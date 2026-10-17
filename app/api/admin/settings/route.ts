import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, logAdminActivity } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.tournamentSetting.findUnique({
      where: { id: 1 },
    });

    return NextResponse.json({
      success: true,
      settings,
      isSupervisor: session.role === 'supervisor',
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ success: false, message: 'ಸೆಟ್ಟಿಂಗ್ಸ್ ಪಡೆಯುವಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'supervisor') {
      return NextResponse.json(
        { success: false, message: 'ಕೇವಲ ಮುಖ್ಯ ನಿರ್ವಾಹಕರಿಗೆ ಮಾತ್ರ ಸೆಟ್ಟಿಂಗ್ಸ್ ಬದಲಾಯಿಸುವ ಹಕ್ಕಿದೆ.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      tournamentName,
      tournamentEdition,
      season,
      registrationFee,
      registrationOpen,
      registrationCapacity,
      capacityCountingRule,
      registrationDeadline,
      tournamentDates,
      tournamentVenue,
      firstPrize,
      secondPrize,
      contactName1,
      contactNumber1,
      contactName2,
      contactNumber2,
      rules,
    } = body;

    const updated = await prisma.tournamentSetting.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        tournamentName: tournamentName || 'ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್',
        tournamentEdition: tournamentEdition || 'ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ 2026',
        season: season || 'ಸೀಸನ್ - 01',
        registrationFee: Number(registrationFee) || 250,
        registrationOpen: Boolean(registrationOpen),
        registrationCapacity: Number(registrationCapacity) || 100,
        capacityCountingRule: capacityCountingRule || 'paid',
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        tournamentDates: tournamentDates || '20, 21 ಮತ್ತು 22 ನವೆಂಬರ್ 2026',
        tournamentVenue: tournamentVenue || 'ಗೆಣಸಿನಕುಣಿ',
        firstPrize: firstPrize || '₹28,888/- ಹಾಗೂ ಪಾರಿತೋಷಕ',
        secondPrize: secondPrize || '₹18,888/- ಹಾಗೂ ಪಾರಿತೋಷಕ',
        contactName1: contactName1 || 'ತೀರ್ಥೇಶ್‌',
        contactNumber1: contactNumber1 || '9632520611',
        contactName2: contactName2 || 'ಪ್ರಜ್ವಲ್ PK',
        contactNumber2: contactNumber2 || '9606467726',
        rules: typeof rules === 'string' ? rules : JSON.stringify(rules || []),
        updatedBy: session.username,
      },
      update: {
        tournamentName,
        tournamentEdition,
        season,
        registrationFee: Number(registrationFee),
        registrationOpen: Boolean(registrationOpen),
        registrationCapacity: Number(registrationCapacity),
        capacityCountingRule,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        tournamentDates,
        tournamentVenue,
        firstPrize,
        secondPrize,
        contactName1,
        contactNumber1,
        contactName2,
        contactNumber2,
        rules: typeof rules === 'string' ? rules : JSON.stringify(rules || []),
        updatedBy: session.username,
      },
    });

    await logAdminActivity(
      session.id,
      session.username,
      'UPDATE_TOURNAMENT_SETTINGS',
      'SETTINGS',
      '1',
      {
        fee: updated.registrationFee,
        capacity: updated.registrationCapacity,
        isOpen: updated.registrationOpen,
      }
    );

    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'ಪಂದ್ಯಾವಳಿ ಸೆಟ್ಟಿಂಗ್ಸ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ success: false, message: 'ಸೆಟ್ಟಿಂಗ್ಸ್ ನವೀಕರಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.' }, { status: 500 });
  }
}
