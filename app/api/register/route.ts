import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRegistrationCapacity } from '@/lib/capacity';
import { isRazorpayConfigured, createPaymentOrder } from '@/lib/razorpay';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, mobileNumber, address, playerCategory, photoStorageKey } = body;

    // 1. Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳು).' },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobileNumber || '').trim().replace(/\D/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಗಳ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (6, 7, 8 ಅಥವಾ 9 ರಿಂದ ಪ್ರಾರಂಭ).' },
        { status: 400 }
      );
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ಪೂರ್ಣ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 5 ಅಕ್ಷರಗಳು).' },
        { status: 400 }
      );
    }

    const validCategories = ['batsman', 'bowler', 'all_rounder'];
    if (!playerCategory || !validCategories.includes(playerCategory)) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ಆಟಗಾರರ ಸರಿಯಾದ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಬ್ಯಾಟ್ಸ್ಮನ್, ಬೌಲರ್, ಅಥವಾ ಆಲ್ರೌಂಡರ್).' },
        { status: 400 }
      );
    }

    if (!photoStorageKey) {
      return NextResponse.json(
        { success: false, message: 'ಭಾವಚಿತ್ರ ಅಪ್ಲೋಡ್ ಮಾಡುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.' },
        { status: 400 }
      );
    }

    // Verify uploaded photo
    let safePhotoKey = photoStorageKey;
    if (typeof photoStorageKey === 'string' && photoStorageKey.startsWith('data:')) {
      safePhotoKey = photoStorageKey;
    } else {
      const safeFilename = path.basename(photoStorageKey);
      safePhotoKey = safeFilename;
      const uploadDirs = [
        path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
        '/tmp/uploads',
      ];
      const exists = uploadDirs.some((dir) => fs.existsSync(path.join(dir, safeFilename)));
      if (!exists && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
        return NextResponse.json(
          { success: false, message: 'ಅಪ್ಲೋಡ್ ಮಾಡಿದ ಭಾವಚಿತ್ರವು ಸರ್ವರ್‌ನಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಅಪ್ಲೋಡ್ ಮಾಡಿ.' },
          { status: 400 }
        );
      }
    }

    // 2. Atomic Capacity Check
    const capacity = await checkRegistrationCapacity();
    if (!capacity.canRegister) {
      return NextResponse.json(
        { success: false, message: capacity.reasonKannada || 'ನೋಂದಣಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.' },
        { status: 400 }
      );
    }

    // 3. Duplicate check for already completed registration with same mobile number
    const existingPaid = await prisma.player.findFirst({
      where: {
        mobileNumber: cleanMobile,
        paymentStatus: 'paid',
      },
    });

    if (existingPaid) {
      return NextResponse.json(
        {
          success: false,
          message: `ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (${cleanMobile}) ಯೊಂದಿಗೆ ಈಗಾಗಲೇ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಿಮ್ಮ ನೋಂದಣಿ ಕೋಡ್: ${existingPaid.registrationCode}. ಸ್ಥಿತಿ ತಿಳಿಯಲು 'ನೋಂದಣಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ' ಪುಟಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.`,
        },
        { status: 400 }
      );
    }

    // 4. Fetch Registration Fee from server settings (NEVER trust client fee)
    const settings = await prisma.tournamentSetting.findUnique({ where: { id: 1 } });
    const registrationFee = settings?.registrationFee ?? 250;

    // 5. Create player record with pending_payment status
    const player = await prisma.player.create({
      data: {
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        address: address.trim(),
        playerCategory,
        photoStorageKey: safePhotoKey,
        paymentStatus: 'pending',
        selectionStatus: 'pending',
        registrationStatus: 'pending_payment',
      },
    });

    const isConfigured = isRazorpayConfigured();

    if (!isConfigured) {
      return NextResponse.json({
        success: true,
        playerId: player.id,
        amount: registrationFee,
        currency: 'INR',
        isPaymentGatewayConfigured: false,
        message: 'ಆಟಗಾರರ ಮಾಹಿತಿ ದಾಖಲಾಗಿದೆ. ಆದಾಗ್ಯೂ ಆನ್‌ಲೈನ್ ಪಾವತಿ ಗೇಟ್‌ವೇ ಇನ್ನೂ ಸಂಯೋಜನೆಗೊಂಡಿಲ್ಲ.',
      });
    }

    // 6. Create Razorpay order
    try {
      const order = await createPaymentOrder(registrationFee, `reg_${player.id.slice(-8)}`, {
        playerId: player.id,
        playerName: player.fullName,
        mobileNumber: player.mobileNumber,
        tournament: 'Shree Brahmalingeshwara Cup 2026',
      });

      // Save payment record
      await prisma.payment.create({
        data: {
          playerId: player.id,
          gatewayName: 'razorpay',
          gatewayOrderId: order.id,
          amount: registrationFee,
          currency: 'INR',
          paymentStatus: 'created',
          paymentSignatureVerified: false,
        },
      });

      return NextResponse.json({
        success: true,
        playerId: player.id,
        orderId: order.id,
        amount: registrationFee,
        currency: 'INR',
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        isPaymentGatewayConfigured: true,
      });
    } catch (orderError: any) {
      console.error('Razorpay order creation error:', orderError);
      return NextResponse.json({
        success: true,
        playerId: player.id,
        amount: registrationFee,
        currency: 'INR',
        isPaymentGatewayConfigured: false,
        gatewayError: orderError.message,
        message: 'ಪಾವತಿ ಆದೇಶ ರಚಿಸುವಲ್ಲಿ ಗೇಟ್‌ವೇ ದೋಷ ಸಂಭವಿಸಿದೆ.',
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'ನೋಂದಣಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.' },
      { status: 500 }
    );
  }
}
