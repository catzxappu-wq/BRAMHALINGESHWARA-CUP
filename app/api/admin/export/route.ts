import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, hasPermission, logAdminActivity } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const permitted = await hasPermission(session, 'export_csv');
    if (!permitted) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const players = await prisma.player.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const categoryKannada: Record<string, string> = {
      batsman: 'ಬ್ಯಾಟ್ಸ್ಮನ್',
      bowler: 'ಬೌಲರ್',
      all_rounder: 'ಆಲ್ರೌಂಡರ್',
    };

    const selectionKannada: Record<string, string> = {
      approved: 'ಆಯ್ಕೆಯಾಗಿದ್ದಾರೆ',
      not_selected: 'ಆಯ್ಕೆಯಾಗಿಲ್ಲ',
      pending: 'ಬಾಕಿ',
    };

    const headers = [
      'ನೋಂದಣಿ ಕೋಡ್',
      'ಆಟಗಾರರ ಹೆಸರು',
      'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      'ಆಟಗಾರರ ವಿಭಾಗ',
      'ಯಾರ ಮಾರ್ಗದರ್ಶನ',
      'ಆಯ್ಕೆ ಸ್ಥಿತಿ',
      'ವಿಳಾಸ',
      'ನೋಂದಣಿ ದಿನಾಂಕ',
    ];

    const escapeCsv = (str: string) => {
      const escaped = (str || '').replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = players.map((p) => {
      return [
        escapeCsv(p.registrationCode || 'N/A'),
        escapeCsv(p.fullName),
        escapeCsv(p.mobileNumber),
        escapeCsv(categoryKannada[p.playerCategory] || p.playerCategory),
        escapeCsv(p.guidanceBy || '-'),
        escapeCsv(selectionKannada[p.selectionStatus] || p.selectionStatus),
        escapeCsv(p.address),
        escapeCsv(new Date(p.createdAt).toLocaleString('kn-IN')),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    await logAdminActivity(
      session.id,
      session.username,
      'EXPORT_PLAYERS_CSV',
      'PLAYER',
      undefined,
      { count: players.length }
    );

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="brahmalingeshwara_cup_players_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ success: false, message: 'CSV ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}
