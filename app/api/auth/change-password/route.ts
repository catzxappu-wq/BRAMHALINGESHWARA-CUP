import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, comparePassword, hashPassword, logAdminActivity } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'ಅನಧಿಕೃತ ಪ್ರವೇಶ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಎರಡೂ ಅಗತ್ಯವಿದೆ.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಖಚಿತಪಡಿಸಿದ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.' },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    });

    if (!admin) {
      return NextResponse.json({ success: false, message: 'ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ.' }, { status: 404 });
    }

    const isMatch = await comparePassword(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ.' },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    await logAdminActivity(
      admin.id,
      admin.username,
      'PASSWORD_CHANGED',
      'ADMIN',
      admin.id
    );

    return NextResponse.json({
      success: true,
      message: 'ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸುವಲ್ಲಿ ಸರ್ವರ್ ದೋಷ ಸಂಭವಿಸಿದೆ.' },
      { status: 500 }
    );
  }
}
