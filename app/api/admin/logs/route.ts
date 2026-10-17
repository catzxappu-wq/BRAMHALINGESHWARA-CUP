import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'supervisor') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const logs = await prisma.adminActivityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('Fetch activity logs error:', error);
    return NextResponse.json({ success: false, message: 'ಚಟುವಟಿಕೆ ಲಾಗ್‌ಗಳನ್ನು ಪಡೆಯುವಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}
