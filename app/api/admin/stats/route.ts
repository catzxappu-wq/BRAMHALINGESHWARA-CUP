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
      selectionPending,
      approvedPlayers,
      notSelectedPlayers,
      batsmen,
      bowlers,
      allRounders,
      settings,
      capacity,
    ] = await Promise.all([
      prisma.player.count(),
      prisma.player.count({ where: { selectionStatus: 'pending' } }),
      prisma.player.count({ where: { selectionStatus: 'approved' } }),
      prisma.player.count({ where: { selectionStatus: 'not_selected' } }),
      prisma.player.count({ where: { playerCategory: 'batsman' } }),
      prisma.player.count({ where: { playerCategory: 'bowler' } }),
      prisma.player.count({ where: { playerCategory: 'all_rounder' } }),
      prisma.tournamentSetting.findUnique({ where: { id: 1 } }),
      checkRegistrationCapacity(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations,
        selectionPending,
        approvedPlayers,
        notSelectedPlayers,
        batsmen,
        bowlers,
        allRounders,
        registrationCapacity: settings?.registrationCapacity || 100,
        availableSlots: capacity.remainingSlots,
        registrationOpen: settings?.registrationOpen ?? true,
      },
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ success: false, message: 'ಅಂಕಿಅಂಶಗಳನ್ನು ಪಡೆಯುವಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}
