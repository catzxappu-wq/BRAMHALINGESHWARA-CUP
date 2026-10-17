import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, hashPassword, logAdminActivity } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'supervisor') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        permissions: {
          select: {
            permissionKey: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      admins: admins.map((a) => ({
        ...a,
        permissions: a.permissions.map((p) => p.permissionKey),
      })),
    });
  } catch (error) {
    console.error('Fetch admins error:', error);
    return NextResponse.json({ success: false, message: 'ನಿರ್ವಾಹಕರ ಪಟ್ಟಿ ಪಡೆಯುವಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'supervisor') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { username, password, permissions } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'ಬಳಕೆದಾರ ಹೆಸರು ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಕಡ್ಡಾಯವಾಗಿದೆ.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { success: false, message: 'ಬಳಕೆದಾರ ಹೆಸರು ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.' },
        { status: 400 }
      );
    }

    const existing = await prisma.admin.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'ಈ ಬಳಕೆದಾರ ಹೆಸರು ಈಗಾಗಲೇ ಬಳಕೆಯಲ್ಲಿದೆ.' },
        { status: 400 }
      );
    }

    const hash = await hashPassword(password);

    const newAdmin = await prisma.admin.create({
      data: {
        username: cleanUsername,
        passwordHash: hash,
        role: 'normal',
        isActive: true,
        mustChangePassword: true,
      },
    });

    if (Array.isArray(permissions) && permissions.length > 0) {
      for (const perm of permissions) {
        await prisma.adminPermission.create({
          data: {
            adminId: newAdmin.id,
            permissionKey: perm,
            grantedBy: session.id,
          },
        });
      }
    }

    await logAdminActivity(
      session.id,
      session.username,
      'CREATE_NORMAL_ADMIN',
      'ADMIN',
      newAdmin.id,
      { createdUsername: cleanUsername }
    );

    return NextResponse.json({
      success: true,
      message: 'ಸಾಮಾನ್ಯ ನಿರ್ವಾಹಕ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ.',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ success: false, message: 'ನಿರ್ವಾಹಕ ರಚನೆಯಲ್ಲಿ ದೋಷ.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'supervisor') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { adminId, isActive, permissions, newPassword } = body;

    if (!adminId) {
      return NextResponse.json({ success: false, message: 'Admin ID ಅಗತ್ಯವಿದೆ.' }, { status: 400 });
    }

    const targetAdmin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!targetAdmin) {
      return NextResponse.json({ success: false, message: 'ನಿರ್ವಾಹಕ ಕಂಡುಬಂದಿಲ್ಲ.' }, { status: 404 });
    }

    if (targetAdmin.role === 'supervisor' && isActive === false) {
      return NextResponse.json(
        { success: false, message: 'ಮುಖ್ಯ ನಿರ್ವಾಹಕರ ಖಾತೆಯನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 8) {
      updateData.passwordHash = await hashPassword(newPassword);
      updateData.mustChangePassword = true;
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
    });

    if (Array.isArray(permissions)) {
      await prisma.adminPermission.deleteMany({ where: { adminId } });
      for (const perm of permissions) {
        await prisma.adminPermission.create({
          data: {
            adminId,
            permissionKey: perm,
            grantedBy: session.id,
          },
        });
      }
    }

    await logAdminActivity(
      session.id,
      session.username,
      'UPDATE_ADMIN_ACCOUNT',
      'ADMIN',
      adminId,
      { updatedUsername: targetAdmin.username, isActive, permissionsCount: permissions?.length }
    );

    return NextResponse.json({
      success: true,
      message: 'ನಿರ್ವಾಹಕರ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.',
    });
  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json({ success: false, message: 'ನವೀಕರಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.' }, { status: 500 });
  }
}
