import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isRazorpayConfigured, createPaymentOrder } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { playerId } = await req.json();

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: 'ಆಟಗಾರರ ID ಅಗತ್ಯವಿದೆ.' },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json(
        { success: false, message: 'ಆಟಗಾರರ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ.' },
        { status: 404 }
      );
    }

    if (player.paymentStatus === 'paid' && player.registrationCode) {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        registrationCode: player.registrationCode,
        message: 'ಈಗಾಗಲೇ ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ.',
      });
    }

    const settings = await prisma.tournamentSetting.findUnique({ where: { id: 1 } });
    const registrationFee = settings?.registrationFee ?? 250;

    const isConfigured = isRazorpayConfigured();
    if (!isConfigured) {
      return NextResponse.json({
        success: true,
        isPaymentGatewayConfigured: false,
        playerId: player.id,
        amount: registrationFee,
        currency: 'INR',
        message: 'ಆನ್‌ಲೈನ್ ಪಾವತಿ ಗೇಟ್‌ವೇ ಇನ್ನೂ ಸಂಯೋಜನೆಗೊಂಡಿಲ್ಲ.',
      });
    }

    // Create Razorpay order
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
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: 'ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ.' },
      { status: 500 }
    );
  }
}
