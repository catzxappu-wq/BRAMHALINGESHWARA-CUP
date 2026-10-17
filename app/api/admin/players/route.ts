import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, hasPermission, logAdminActivity } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const selectionStatus = searchParams.get('selectionStatus') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q } },
        { mobileNumber: { contains: q } },
        { registrationCode: { contains: q } },
      ];
    }

    if (category) {
      where.playerCategory = category;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (selectionStatus) {
      where.selectionStatus = selectionStatus;
    }

    const [total, players] = await Promise.all([
      prisma.player.count({ where }),
      prisma.player.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      players: players.map((p) => ({
        id: p.id,
        registrationCode: p.registrationCode,
        fullName: p.fullName,
        mobileNumber: p.mobileNumber,
        address: p.address,
        playerCategory: p.playerCategory,
        photoUrl: `/api/uploads/${p.photoStorageKey}`,
        photoStorageKey: p.photoStorageKey,
        paymentStatus: p.paymentStatus,
        selectionStatus: p.selectionStatus,
        registrationStatus: p.registrationStatus,
        createdAt: p.createdAt,
        latestPayment: p.payments[0] || null,
      })),
    });
  } catch (error) {
    console.error('Admin players fetch error:', error);
    return NextResponse.json({ success: false, message: 'ಆಟಗಾರರ ಪಟ್ಟಿ ಪಡೆಯುವಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const permitted = await hasPermission(session, 'update_selection');
    if (!permitted) {
      return NextResponse.json(
        { success: false, message: 'ಆಯ್ಕೆ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲು ನಿಮಗೆ ಅನುಮತಿ ಇಲ್ಲ.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { playerId, selectionStatus } = body;

    if (!playerId || !selectionStatus) {
      return NextResponse.json({ success: false, message: 'ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿ ಅಪೂರ್ಣವಾಗಿದೆ.' }, { status: 400 });
    }

    const validSelection = ['pending', 'approved', 'not_selected'];
    if (!validSelection.includes(selectionStatus)) {
      return NextResponse.json({ success: false, message: 'ಅಮಾನ್ಯ ಆಯ್ಕೆ ಸ್ಥಿತಿ.' }, { status: 400 });
    }

    const updated = await prisma.player.update({
      where: { id: playerId },
      data: { selectionStatus },
    });

    await logAdminActivity(
      session.id,
      session.username,
      'UPDATE_PLAYER_SELECTION',
      'PLAYER',
      playerId,
      { newStatus: selectionStatus, playerCode: updated.registrationCode }
    );

    return NextResponse.json({
      success: true,
      player: updated,
      message: 'ಆಟಗಾರರ ಆಯ್ಕೆ ಸ್ಥಿತಿ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.',
    });
  } catch (error) {
    console.error('Update player error:', error);
    return NextResponse.json({ success: false, message: 'ನವೀಕರಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'supervisor') {
      return NextResponse.json(
        { success: false, message: 'ಕೇವಲ ಮುಖ್ಯ ನಿರ್ವಾಹಕರು ಮಾತ್ರ ನೋಂದಣಿ ರದ್ದುಗೊಳಿಸಬಹುದು.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('id');

    if (!playerId) {
      return NextResponse.json({ success: false, message: 'Player ID ಅಗತ್ಯವಿದೆ.' }, { status: 400 });
    }

    const player = await prisma.player.update({
      where: { id: playerId },
      data: {
        registrationStatus: 'cancelled',
        paymentStatus: 'cancelled',
        selectionStatus: 'not_selected',
      },
    });

    await logAdminActivity(
      session.id,
      session.username,
      'CANCEL_PLAYER_REGISTRATION',
      'PLAYER',
      playerId,
      { playerCode: player.registrationCode }
    );

    return NextResponse.json({
      success: true,
      message: 'ಆಟಗಾರರ ನೋಂದಣಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.',
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    return NextResponse.json({ success: false, message: 'ರದ್ದುಗೊಳಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.' }, { status: 500 });
  }
}
