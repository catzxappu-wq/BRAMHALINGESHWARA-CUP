import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const results: string[] = [];

    // 1. Initialize Tournament Settings
    const existingSettings = await prisma.tournamentSetting.findUnique({
      where: { id: 1 },
    });

    if (!existingSettings) {
      const defaultRules = JSON.stringify([
        "ಅವಿನಹಳ್ಳಿ ಹೋಬಳಿ ಮಟ್ಟದ 9 ಹರಾಜಿನ ತಂಡಗಳು",
        "ಒಂದೇ ಊರಿನ 9 ಐ ಡಿ ಗ್ರಾಮಾಂತರ ತಂಡಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ",
        "ಚೆಕ್ ಬೌಲರ್ ಗಳಿಗೆ ಅವಕಾಶ ಇರುವುದಿಲ್ಲ",
        "ಊಟದ ವ್ಯವಸ್ಥೆ ಇರುತ್ತದೆ",
        "ಐ ಡಿ ತಂಡಗಳಿಗೆ ಹೆಸರು ನೋಂದಾಯಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ : ನವೆಂಬರ್ 01",
        "ಐ ಡಿ ಕಾರ್ಡ್ ಅಂಡ್ ಆಧಾರ್ ಕಾರ್ಡ್ ಕಡ್ಡಾಯ"
      ]);

      await prisma.tournamentSetting.create({
        data: {
          id: 1,
          tournamentName: "ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್",
          tournamentEdition: "ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ 2026",
          season: "ಸೀಸನ್ - 01",
          registrationFee: 250.0,
          registrationOpen: true,
          registrationCapacity: 100,
          capacityCountingRule: "paid",
          registrationDeadline: new Date("2026-11-01T23:59:59+05:30"),
          tournamentDates: "20, 21 ಮತ್ತು 22 ನವೆಂಬರ್ 2026",
          tournamentVenue: "ಗೆಣಸಿನಕುಣಿ",
          firstPrize: "₹28,888/- ಹಾಗೂ ಪಾರಿತೋಷಕ",
          secondPrize: "₹18,888/- ಹಾಗೂ ಪಾರಿತೋಷಕ",
          contactNumber1: "9632520611",
          contactName1: "ತೀರ್ಥೇಶ್‌",
          contactNumber2: "9606467726",
          contactName2: "ಪ್ರಜ್ವಲ್ PK",
          rules: defaultRules,
          updatedBy: "cloud_init",
        },
      });
      results.push('Tournament settings initialized.');
    } else {
      results.push('Tournament settings already exist.');
    }

    // 2. Initialize Code Sequence
    await prisma.codeSequence.upsert({
      where: { id: "player_code" },
      update: {},
      create: { id: "player_code", lastNumber: 0 },
    });
    results.push('Code sequence initialized.');

    // 3. Supervisor Account
    const supUsername = 'catzxappu';
    const supPassword = 'shree@3101';
    let supervisor = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: supUsername },
          { role: 'supervisor' },
        ],
      },
    });

    const supHash = await bcrypt.hash(supPassword, 10);
    if (!supervisor) {
      supervisor = await prisma.admin.create({
        data: {
          username: supUsername,
          passwordHash: supHash,
          role: 'supervisor',
          isActive: true,
          mustChangePassword: false,
        },
      });
      results.push(`Supervisor account created (username: ${supUsername}, password: ${supPassword}).`);
    } else {
      supervisor = await prisma.admin.update({
        where: { id: supervisor.id },
        data: {
          username: supUsername,
          passwordHash: supHash,
          role: 'supervisor',
          isActive: true,
          mustChangePassword: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
      results.push(`Supervisor account updated to ${supUsername} (password: ${supPassword}).`);
    }

    // 4. Normal Admin Account
    let normalAdmin = await prisma.admin.findUnique({
      where: { username: 'admin_staff' },
    });

    if (!normalAdmin) {
      const normalHash = await bcrypt.hash('SbkAdm2026#c8eabe', 10);
      normalAdmin = await prisma.admin.create({
        data: {
          username: 'admin_staff',
          passwordHash: normalHash,
          role: 'normal',
          isActive: true,
          mustChangePassword: true,
        },
      });

      const defaultPerms = ['view_players', 'view_payments', 'view_stats'];
      for (const perm of defaultPerms) {
        await prisma.adminPermission.create({
          data: {
            adminId: normalAdmin.id,
            permissionKey: perm,
            grantedBy: supervisor.id,
          },
        });
      }
      results.push('Normal admin account created (username: admin_staff, password: SbkAdm2026#c8eabe).');
    } else {
      results.push('Normal admin account already exists.');
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      databaseUrlType: process.env.DATABASE_URL?.split(':')[0] || 'unknown',
      results,
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database initialization failed.',
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
