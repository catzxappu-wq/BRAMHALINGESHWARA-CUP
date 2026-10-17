import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const permitted = await hasPermission(session, 'view_payments');
    if (!permitted) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (status) {
      where.paymentStatus = status;
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { gatewayOrderId: { contains: q } },
        { gatewayPaymentId: { contains: q } },
        { player: { fullName: { contains: q } } },
        { player: { registrationCode: { contains: q } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            mobileNumber: true,
            registrationCode: true,
            playerCategory: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ success: false, message: 'ಪಾವತಿ ವಿವರಗಳನ್ನು ಪಡೆಯುವಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}
