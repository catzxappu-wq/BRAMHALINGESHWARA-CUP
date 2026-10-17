import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRegistrationCapacity } from '@/lib/capacity';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalRegistrations,
      paidPlayers,
      pendingPayment,
      selectionPending,
      approvedPlayers,
      notSelectedPlayers,
      totalPaymentsAmount,
      settings,
      capacity,
    ] = await Promise.all([
      prisma.player.count(),
      prisma.player.count({ where: { paymentStatus: 'paid' } }),
      prisma.player.count({ where: { paymentStatus: 'pending' } }),
      prisma.player.count({ where: { selectionStatus: 'pending', paymentStatus: 'paid' } }),
      prisma.player.count({ where: { selectionStatus: 'approved' } }),
      prisma.player.count({ where: { selectionStatus: 'not_selected' } }),
      prisma.payment.aggregate({
        where: { paymentStatus: 'captured' },
        _sum: { amount: true },
      }),
      prisma.tournamentSetting.findUnique({ where: { id: 1 } }),
      checkRegistrationCapacity(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations,
        paidPlayers,
        pendingPayment,
        selectionPending,
        approvedPlayers,
        notSelectedPlayers,
        totalCollectedAmount: totalPaymentsAmount._sum.amount || 0,
        registrationCapacity: settings?.registrationCapacity || 100,
        availableSlots: capacity.remainingSlots,
        registrationOpen: settings?.registrationOpen ?? true,
        registrationFee: settings?.registrationFee ?? 250,
      },
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ success: false, message: 'ಅಂಕಿಅಂಶಗಳನ್ನು ಪಡೆಯುವಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}
