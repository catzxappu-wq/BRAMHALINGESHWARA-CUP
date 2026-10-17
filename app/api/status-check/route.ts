import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rateCheck = checkRateLimit(`status_check_${ip}`, 15, 60000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `ಬಹಳಷ್ಟು ವಿನಂತಿಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ${rateCheck.resetInSec} ಸೆಕೆಂಡುಗಳ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { registrationCode, mobileNumber } = body;

    const cleanCode = String(registrationCode || '').trim().toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ನೋಂದಣಿ ಕೋಡ್ (ಉದಾ: SBK26-000001) ನಮೂದಿಸಿ.' },
        { status: 400 }
      );
    }

    const whereClause: any = {
      registrationCode: cleanCode,
    };

    if (mobileNumber && typeof mobileNumber === 'string' && mobileNumber.trim()) {
      whereClause.mobileNumber = mobileNumber.trim().replace(/\D/g, '');
    }

    const player = await prisma.player.findFirst({
      where: whereClause,
      select: {
        registrationCode: true,
        fullName: true,
        playerCategory: true,
        paymentStatus: true,
        selectionStatus: true,
        registrationStatus: true,
        createdAt: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        {
          success: false,
          message: 'ಈ ನೋಂದಣಿ ಕೋಡ್‌ನೊಂದಿಗೆ ಯಾವುದೇ ಆಟಗಾರರ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೋಡ್ ಸರಿಯಾಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
        },
        { status: 404 }
      );
    }

    // Kannada labels mapping
    const categoryLabels: Record<string, string> = {
      batsman: 'ಬ್ಯಾಟ್ಸ್ಮನ್',
      bowler: 'ಬೌಲರ್',
      all_rounder: 'ಆಲ್ರೌಂಡರ್',
    };

    const paymentLabels: Record<string, { text: string; color: string }> = {
      pending: { text: 'ಪಾವತಿ ಬಾಕಿ', color: 'yellow' },
      paid: { text: 'ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿದೆ', color: 'green' },
      failed: { text: 'ಪಾವತಿ ವಿಫಲವಾಗಿದೆ', color: 'red' },
      cancelled: { text: 'ಪಾವತಿ ರದ್ದಾಗಿದೆ', color: 'gray' },
    };

    const selectionLabels: Record<string, { text: string; color: string }> = {
      pending: { text: 'ಆಯ್ಕೆ ಬಾಕಿಯಿದೆ (ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ)', color: 'blue' },
      approved: { text: 'ಆಯ್ಕೆಯಾಗಿದ್ದಾರೆ (Congratulations!)', color: 'green' },
      not_selected: { text: 'ಆಯ್ಕೆಯಾಗಿಲ್ಲ', color: 'red' },
    };

    const registrationLabels: Record<string, string> = {
      pending_payment: 'ಪಾವತಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ',
      completed: 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
      cancelled: 'ನೋಂದಣಿ ರದ್ದಾಗಿದೆ',
    };

    return NextResponse.json({
      success: true,
      data: {
        registrationCode: player.registrationCode,
        fullName: player.fullName,
        category: player.playerCategory,
        categoryKannada: categoryLabels[player.playerCategory] || player.playerCategory,
        paymentStatus: player.paymentStatus,
        paymentStatusKannada: paymentLabels[player.paymentStatus]?.text || player.paymentStatus,
        paymentStatusColor: paymentLabels[player.paymentStatus]?.color || 'gray',
        selectionStatus: player.selectionStatus,
        selectionStatusKannada: selectionLabels[player.selectionStatus]?.text || player.selectionStatus,
        selectionStatusColor: selectionLabels[player.selectionStatus]?.color || 'gray',
        registrationStatusKannada: registrationLabels[player.registrationStatus] || player.registrationStatus,
        registrationDate: player.createdAt,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, message: 'ಸ್ಥಿತಿ ಪರಿಶೀಲನೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ.' },
      { status: 500 }
    );
  }
}
