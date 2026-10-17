import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken, logAdminActivity } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rate = checkRateLimit(`login_${ip}`, 10, 60000);

    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `ಲಾಗಿನ್ ಪ್ರಯತ್ನಗಳ ಮಿತಿ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ${rate.resetInSec} ಸೆಕೆಂಡುಗಳ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'ಬಳಕೆದಾರ ಹೆಸರು ಮತ್ತು ಪಾಸ್ವರ್ಡ್ ಕಡ್ಡಾಯವಾಗಿದೆ.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const admin = await prisma.admin.findUnique({
      where: { username: cleanUsername },
      include: { permissions: true },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ತಪ್ಪಾದ ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.' },
        { status: 401 }
      );
    }

    // Check account active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'ಈ ನಿರ್ವಾಹಕ ಖಾತೆಯನ್ನು ಅಮಾನತುಗೊಳಿಸಲಾಗಿದೆ/ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.' },
        { status: 403 }
      );
    }

    // Check lockout
    if (admin.lockedUntil && new Date() < new Date(admin.lockedUntil)) {
      const waitMin = Math.ceil((new Date(admin.lockedUntil).getTime() - Date.now()) / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `ಹಲವಾರು ಬಾರಿ ತಪ್ಪು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿದ ಕಾರಣ ಖಾತೆಯನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. ದಯವಿಟ್ಟು ${waitMin} ನಿಮಿಷಗಳ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.`,
        },
        { status: 423 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);

    if (!isMatch) {
      const newAttempts = admin.failedLoginAttempts + 1;
      let updateData: any = { failedLoginAttempts: newAttempts };

      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: updateData,
      });

      await logAdminActivity(
        admin.id,
        admin.username,
        'LOGIN_FAILED',
        'ADMIN',
        admin.id,
        { ip, attempt: newAttempts }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            newAttempts >= 5
              ? '5 ಬಾರಿ ತಪ್ಪು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿದ ಕಾರಣ ಖಾತೆಯನ್ನು 15 ನಿಮಿಷಗಳ ಕಾಲ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ.'
              : `ತಪ್ಪಾದ ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್. (ಉಳಿದ ಪ್ರಯತ್ನಗಳು: ${5 - newAttempts})`,
        },
        { status: 401 }
      );
    }

    // Successful login: Reset failed attempts & lockout
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const token = signToken({
      id: admin.id,
      username: admin.username,
      role: admin.role as 'supervisor' | 'normal',
      mustChangePassword: admin.mustChangePassword,
      permissions: admin.permissions.map((p) => p.permissionKey),
    });

    await logAdminActivity(
      admin.id,
      admin.username,
      'LOGIN_SUCCESS',
      'ADMIN',
      admin.id,
      { ip }
    );

    const response = NextResponse.json({
      success: true,
      role: admin.role,
      username: admin.username,
      mustChangePassword: admin.mustChangePassword,
      message: 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ.',
    });

    // Set secure cookie
    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'ಲಾಗಿನ್ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ಸರ್ವರ್ ದೋಷ ಸಂಭವಿಸಿದೆ.' },
      { status: 500 }
    );
  }
}
