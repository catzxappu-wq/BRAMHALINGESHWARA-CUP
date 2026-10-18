import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRegistrationCapacity } from '@/lib/capacity';
import { generateUniqueRegistrationCode } from '@/lib/codeGenerator';
import { uploadToCloud } from '@/lib/cloudStorage';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      mobileNumber,
      address,
      playerCategory,
      photoStorageKey,
      guidanceBy,
      paymentReceiptStorageKey,
      transactionReference,
    } = body;

    // 1. Validations
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

    // Guidance validation
    if (!guidanceBy || typeof guidanceBy !== 'string' || guidanceBy.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ಯಾರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಈ ಫಾರ್ಮ್ ತುಂಬುತ್ತಿದ್ದೀರಿ ಎಂದು ನಮೂದಿಸಿ (ಉದಾ: ನಾಯಕ/ಆಯೋಜಕರು/ಸ್ನೇಹಿತರ ಹೆಸರು).' },
        { status: 400 }
      );
    }

    // Payment receipt validation
    if (!paymentReceiptStorageKey) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ಶುಲ್ಕ ಪಾವತಿಯ ರಶೀದಿ / ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ.' },
        { status: 400 }
      );
    }

    // Upload photo to cloud storage if data URI or file
    let safePhotoKey = photoStorageKey;
    if (typeof photoStorageKey === 'string' && photoStorageKey.startsWith('data:')) {
      const cloudRes = await uploadToCloud(photoStorageKey, 'players');
      safePhotoKey = cloudRes.url;
    } else if (typeof photoStorageKey === 'string' && !photoStorageKey.startsWith('http')) {
      safePhotoKey = path.basename(photoStorageKey);
    }

    // Upload payment receipt to cloud storage if data URI or file
    let safeReceiptKey = paymentReceiptStorageKey;
    if (typeof paymentReceiptStorageKey === 'string' && paymentReceiptStorageKey.startsWith('data:')) {
      const cloudRes = await uploadToCloud(paymentReceiptStorageKey, 'receipts');
      safeReceiptKey = cloudRes.url;
    } else if (typeof paymentReceiptStorageKey === 'string' && !paymentReceiptStorageKey.startsWith('http')) {
      safeReceiptKey = path.basename(paymentReceiptStorageKey);
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
    const existingPlayer = await prisma.player.findFirst({
      where: {
        mobileNumber: cleanMobile,
        registrationCode: { not: null },
      },
    });

    if (existingPlayer) {
      return NextResponse.json(
        {
          success: false,
          message: `ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (${cleanMobile}) ಯೊಂದಿಗೆ ಈಗಾಗಲೇ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಿಮ್ಮ ನೋಂದಣಿ ಕೋಡ್: ${existingPlayer.registrationCode}. ಸ್ಥಿತಿ ತಿಳಿಯಲು 'ನೋಂದಣಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ' ಪುಟಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.`,
        },
        { status: 400 }
      );
    }

    // 4. Generate Unique Registration Code atomically
    const registrationCode = await generateUniqueRegistrationCode();

    // 5. Create player record with payment receipt and guidance details
    const player = await prisma.player.create({
      data: {
        registrationCode,
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        address: address.trim(),
        playerCategory,
        photoStorageKey: safePhotoKey,
        guidanceBy: guidanceBy.trim(),
        paymentReceiptStorageKey: safeReceiptKey,
        transactionReference: transactionReference ? String(transactionReference).trim() : null,
        paymentStatus: 'pending', // Pending organizer verification
        selectionStatus: 'pending',
        registrationStatus: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      playerId: player.id,
      registrationCode: player.registrationCode,
      fullName: player.fullName,
      message: 'ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ! ನಿಮ್ಮ ಪಾವತಿ ರಶೀದಿಯನ್ನು ಸಮಿತಿಯು ಪರಿಶೀಲಿಸಲಿದೆ.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'ನೋಂದಣಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮರುಪ್ರಯತ್ನಿಸಿ.' },
      { status: 500 }
    );
  }
}
