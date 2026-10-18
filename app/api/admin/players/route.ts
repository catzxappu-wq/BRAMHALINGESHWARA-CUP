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
        guidanceBy: p.guidanceBy || '-',
        photoUrl: p.photoStorageKey.startsWith('data:') ? p.photoStorageKey : `/api/uploads/${p.photoStorageKey}`,
        photoStorageKey: p.photoStorageKey,
        paymentReceiptUrl: p.paymentReceiptStorageKey
          ? (p.paymentReceiptStorageKey.startsWith('data:')
              ? p.paymentReceiptStorageKey
              : `/api/uploads/${p.paymentReceiptStorageKey}`)
          : null,
        transactionReference: p.transactionReference || '-',
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

    // Allow both supervisor and normal admins to update player status
    const permitted =
      session.role === 'supervisor' ||
      session.role === 'normal' ||
      (await hasPermission(session, 'update_selection'));

    if (!permitted) {
      return NextResponse.json(
        { success: false, message: 'ಆಯ್ಕೆ ಅಥವಾ ಪಾವತಿ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲು ನಿಮಗೆ ಅನುಮತಿ ಇಲ್ಲ.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { playerId, selectionStatus, paymentStatus } = body;

    if (!playerId || (!selectionStatus && !paymentStatus)) {
      return NextResponse.json({ success: false, message: 'ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿ ಅಪೂರ್ಣವಾಗಿದೆ.' }, { status: 400 });
    }

    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, message: 'ಈ ಆಟಗಾರರ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (selectionStatus) {
      const validSelection = ['pending', 'approved', 'not_selected', 'rejected'];
      if (!validSelection.includes(selectionStatus)) {
        return NextResponse.json({ success: false, message: 'ಅಮಾನ್ಯ ಆಯ್ಕೆ ಸ್ಥಿತಿ.' }, { status: 400 });
      }
      updateData.selectionStatus =
        selectionStatus === 'rejected' || selectionStatus === 'not_selected'
          ? 'not_selected'
          : selectionStatus;
    }

    if (paymentStatus) {
      const validPayment = ['pending', 'paid', 'rejected', 'free'];
      if (!validPayment.includes(paymentStatus)) {
        return NextResponse.json({ success: false, message: 'ಅಮಾನ್ಯ ಪಾವತಿ ಸ್ಥಿತಿ.' }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;
    }

    const updated = await prisma.player.update({
      where: { id: playerId },
      data: updateData,
    });

    await logAdminActivity(
      session.id,
      session.username,
      'UPDATE_PLAYER_STATUS',
      'PLAYER',
      playerId,
      { updateData, playerCode: updated.registrationCode }
    );

    return NextResponse.json({
      success: true,
      player: updated,
      message: 'ಆಟಗಾರರ ವಿವರಗಳು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.',
    });
  } catch (error: any) {
    console.error('Update player error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'ನವೀಕರಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const permitted =
      session.role === 'supervisor' ||
      session.role === 'normal' ||
      (await hasPermission(session, 'delete_player'));
    if (!permitted) {
      return NextResponse.json(
        { success: false, message: 'ಅರ್ಜಿಯನ್ನು ಅಳಿಸಲು ಅಧಿಕಾರವಿಲ್ಲ.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('id');

    if (!playerId) {
      return NextResponse.json({ success: false, message: 'Player ID ಅಗತ್ಯವಿದೆ.' }, { status: 400 });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json({ success: false, message: 'ಆಟಗಾರರ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.' }, { status: 404 });
    }

    // Delete associated payments if any
    await prisma.payment.deleteMany({
      where: { playerId },
    });

    // Delete player permanently from database
    await prisma.player.delete({
      where: { id: playerId },
    });

    await logAdminActivity(
      session.id,
      session.username,
      'DELETE_PLAYER_REGISTRATION',
      'PLAYER',
      playerId,
      { playerCode: player.registrationCode, fullName: player.fullName }
    );

    return NextResponse.json({
      success: true,
      message: `${player.fullName} (${player.registrationCode}) ಅವರ ಅರ್ಜಿಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗಿದೆ.`,
    });
  } catch (error) {
    console.error('Delete player error:', error);
    return NextResponse.json({ success: false, message: 'ಅರ್ಜಿಯನ್ನು ಅಳಿಸುವಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ.' }, { status: 500 });
  }
}
