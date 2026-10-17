import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { generateUniqueRegistrationCode } from '@/lib/codeGenerator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId, orderId, paymentId, signature } = body;

    if (!playerId || !orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, message: 'ಪಾವತಿ ಪರಿಶೀಲನೆಗೆ ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿ ಅಪೂರ್ಣವಾಗಿದೆ.' },
        { status: 400 }
      );
    }

    // 1. Fetch player and associated payment
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { payments: true },
    });

    if (!player) {
      return NextResponse.json(
        { success: false, message: 'ಆಟಗಾರರ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.' },
        { status: 404 }
      );
    }

    // 2. Idempotency: If player is already paid and has registration code
    if (player.paymentStatus === 'paid' && player.registrationCode) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        registrationCode: player.registrationCode,
        playerId: player.id,
        fullName: player.fullName,
        message: 'ಪಾವತಿಯನ್ನು ಈಗಾಗಲೇ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ.',
      });
    }

    // 3. Verify Razorpay cryptographic signature on server
    const isSignatureValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isSignatureValid) {
      console.warn(`Payment signature verification failed for order: ${orderId}, payment: ${paymentId}`);
      // Update payment record as failed
      await prisma.payment.updateMany({
        where: { gatewayOrderId: orderId },
        data: {
          paymentStatus: 'failed',
          paymentSignatureVerified: false,
        },
      });

      return NextResponse.json(
        { success: false, message: 'ಪಾವತಿ ಸಹಿ (Signature) ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಸಹಾಯವಾಣಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.' },
        { status: 400 }
      );
    }

    // 4. Atomic transaction to assign registration code and update status
    const result = await prisma.$transaction(async (tx) => {
      // Generate unique atomic code
      const uniqueCode = await generateUniqueRegistrationCode(tx);

      // Update payment record
      await tx.payment.updateMany({
        where: { gatewayOrderId: orderId },
        data: {
          gatewayPaymentId: paymentId,
          paymentStatus: 'captured',
          paymentSignatureVerified: true,
        },
      });

      // Update player record
      const updatedPlayer = await tx.player.update({
        where: { id: playerId },
        data: {
          paymentStatus: 'paid',
          registrationStatus: 'completed',
          registrationCode: uniqueCode,
        },
      });

      return { uniqueCode, updatedPlayer };
    });

    return NextResponse.json({
      success: true,
      registrationCode: result.uniqueCode,
      playerId: result.updatedPlayer.id,
      fullName: result.updatedPlayer.fullName,
      mobileNumber: result.updatedPlayer.mobileNumber,
      category: result.updatedPlayer.playerCategory,
      message: 'ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ.',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'ಪಾವತಿ ಪರಿಶೀಲನೆಯಲ್ಲಿ ಆಂತರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ.' },
      { status: 500 }
    );
  }
}
