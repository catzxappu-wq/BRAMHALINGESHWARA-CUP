import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRegistrationCapacity } from '@/lib/capacity';
import { isRazorpayConfigured } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.tournamentSetting.findUnique({
      where: { id: 1 },
    });

    const capacity = await checkRegistrationCapacity();

    let rules: string[] = [];
    if (settings?.rules) {
      try {
        rules = JSON.parse(settings.rules);
      } catch {
        rules = [];
      }
    }

    return NextResponse.json({
      success: true,
      tournament: {
        name: settings?.tournamentName || "ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್",
        edition: settings?.tournamentEdition || "ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ 2026",
        season: settings?.season || "ಸೀಸನ್ - 01",
        dates: settings?.tournamentDates || "20, 21 ಮತ್ತು 22 ನವೆಂಬರ್ 2026",
        venue: settings?.tournamentVenue || "ಗೆಣಸಿನಕುಣಿ",
        firstPrize: settings?.firstPrize || "₹28,888/- ಹಾಗೂ ಪಾರಿತೋಷಕ",
        secondPrize: settings?.secondPrize || "₹18,888/- ಹಾಗೂ ಪಾರಿತೋಷಕ",
        contactName1: settings?.contactName1 || "ತೀರ್ಥೇಶ್‌",
        contactNumber1: settings?.contactNumber1 || "9632520611",
        contactName2: settings?.contactName2 || "ಪ್ರಜ್ವಲ್ PK",
        contactNumber2: settings?.contactNumber2 || "9606467726",
        rules,
        registrationFee: settings?.registrationFee ?? 250,
        registrationOpen: settings?.registrationOpen ?? true,
        registrationCapacity: settings?.registrationCapacity ?? 100,
        registrationDeadline: settings?.registrationDeadline,
        canRegister: capacity.canRegister,
        remainingSlots: capacity.remainingSlots,
        totalRegistered: capacity.totalRegistered,
        reasonKannada: capacity.reasonKannada,
        isPaymentGatewayConfigured: isRazorpayConfigured(),
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'ಸೆಟ್ಟಿಂಗ್ಸ್ ಪಡೆಯುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ' },
      { status: 500 }
    );
  }
}
