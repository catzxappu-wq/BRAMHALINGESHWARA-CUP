import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isRazorpayConfigured } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: 'ಆಟಗಾರರ ID ಅಗತ್ಯವಿದೆ.' },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!player) {
      return NextResponse.json(
        { success: false, message: 'ಆಟಗಾರರ ವಿವರಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' },
        { status: 404 }
      );
    }

    const settings = await prisma.tournamentSetting.findUnique({ where: { id: 1 } });
    const registrationFee = settings?.registrationFee ?? 250;

    const photoUrl = player.photoStorageKey.startsWith('data:')
      ? player.photoStorageKey
      : `/api/uploads/${player.photoStorageKey}`;

    return NextResponse.json({
      success: true,
      player: {
        id: player.id,
        fullName: player.fullName,
        mobileNumber: player.mobileNumber,
        address: player.address,
        playerCategory: player.playerCategory,
        photoStorageKey: player.photoStorageKey,
        photoUrl,
        registrationFee,
        paymentStatus: player.paymentStatus,
        registrationCode: player.registrationCode,
        isPaymentGatewayConfigured: isRazorpayConfigured(),
        latestPayment: player.payments[0] || null,
      },
    });
  } catch (error: any) {
    console.error('Player details fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'ಆಟಗಾರರ ವಿವರ ಪಡೆಯುವಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ.' },
      { status: 500 }
    );
  }
}
