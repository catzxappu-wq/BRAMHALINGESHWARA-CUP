const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

async function main() {
  console.log('Seeding initial tournament configuration and administrative accounts...');

  // 1. Initialize Tournament Settings
  const defaultRules = JSON.stringify([
    "ಅವಿನಹಳ್ಳಿ ಹೋಬಳಿ ಮಟ್ಟದ 9 ಹರಾಜಿನ ತಂಡಗಳು",
    "ಒಂದೇ ಊರಿನ 9 ಐ ಡಿ ಗ್ರಾಮಾಂತರ ತಂಡಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ",
    "ಚೆಕ್ ಬೌಲರ್ ಗಳಿಗೆ ಅವಕಾಶ ಇರುವುದಿಲ್ಲ",
    "ಊಟದ ವ್ಯವಸ್ಥೆ ಇರುತ್ತದೆ",
    "ಐ ಡಿ ತಂಡಗಳಿಗೆ ಹೆಸರು ನೋಂದಾಯಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ : ನವೆಂಬರ್ 01",
    "ಐ ಡಿ ಕಾರ್ಡ್ ಅಂಡ್ ಆಧಾರ್ ಕಾರ್ಡ್ ಕಡ್ಡಾಯ"
  ]);

  const settings = await prisma.tournamentSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
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
      updatedBy: "system_init"
    }
  });
  console.log('Tournament settings initialized.');

  // 2. Initialize Code Sequence
  await prisma.codeSequence.upsert({
    where: { id: "player_code" },
    update: {},
    create: { id: "player_code", lastNumber: 0 }
  });

  // 3. Admin Accounts Setup
  const supervisorUsername = 'catzxappu';
  const supervisorPassword = process.env.INITIAL_SUPERVISOR_PASSWORD || 'shree@3101';

  const normalAdminUsername = 'admin_staff';
  const normalAdminPassword = process.env.INITIAL_NORMAL_PASSWORD || ('SbkAdm2026#' + crypto.randomBytes(3).toString('hex'));

  // Check if supervisor exists (check both catzxappu or old supervisor)
  let supervisor = await prisma.admin.findFirst({
    where: {
      OR: [
        { username: supervisorUsername },
        { role: 'supervisor' }
      ]
    }
  });
  let supervisorCreated = false;
  if (!supervisor) {
    const hash = await bcrypt.hash(supervisorPassword, 10);
    supervisor = await prisma.admin.create({
      data: {
        username: supervisorUsername,
        passwordHash: hash,
        role: 'supervisor',
        isActive: true,
        mustChangePassword: false,
      }
    });
    supervisorCreated = true;
    console.log(`Supervisor account created: ${supervisorUsername}`);
  } else {
    // Ensure credentials match user configuration
    const hash = await bcrypt.hash(supervisorPassword, 10);
    supervisor = await prisma.admin.update({
      where: { id: supervisor.id },
      data: {
        username: supervisorUsername,
        passwordHash: hash,
        role: 'supervisor',
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
    console.log(`Supervisor account updated: ${supervisorUsername}`);
  }

  // Check if normal admin exists
  let normalAdmin = await prisma.admin.findUnique({ where: { username: normalAdminUsername } });
  let normalAdminCreated = false;
  if (!normalAdmin) {
    const hash = await bcrypt.hash(normalAdminPassword, 10);
    normalAdmin = await prisma.admin.create({
      data: {
        username: normalAdminUsername,
        passwordHash: hash,
        role: 'normal',
        isActive: true,
        mustChangePassword: true,
      }
    });
    normalAdminCreated = true;

    // Grant default permissions to normal admin
    const defaultPermissions = ['view_players', 'view_payments', 'view_stats'];
    for (const perm of defaultPermissions) {
      await prisma.adminPermission.create({
        data: {
          adminId: normalAdmin.id,
          permissionKey: perm,
          grantedBy: supervisor.id
        }
      });
    }
    console.log(`Normal admin account created: ${normalAdminUsername}`);
  }

  // 4. Generate or update admin_credentials.txt
  const credentialsFilePath = path.join(process.cwd(), process.env.ADMIN_CREDENTIALS_FILE || 'admin_credentials.txt');
  let credentialsContent = `================================================================================
ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ - 2026
SHREE BRAHMALINGESHWARA CUP 2026 CRICKET TOURNAMENT
ADMINISTRATIVE ACCESS CREDENTIALS (CONFIDENTIAL)
================================================================================
Generated At: ${new Date().toISOString()}

IMPORTANT SECURITY INSTRUCTIONS:
1. Keep this file private and confidential. Do not commit it to version control.
2. The initial passwords below are TEMPORARY. You will be prompted to change
   your password upon your first successful login.
3. Access URL: /admin/login
================================================================================

[1] SUPERVISOR ADMIN (ಮುಖ್ಯ ನಿರ್ವಾಹಕರು)
--------------------------------------------------------------------------------
Username : ${supervisorUsername}
Password : ${supervisorPassword}
Role     : supervisor (Full Administrative Control)
Access   : All permissions including Fee, Capacity, Admin Creation, Approvals

[2] NORMAL ADMIN (ಸಾಮಾನ್ಯ ನಿರ್ವಾಹಕರು)
--------------------------------------------------------------------------------
Username : ${normalAdminUsername}
Password : ${normalAdminCreated ? normalAdminPassword : '[EXISTING / PREVIOUSLY CONFIGURED]'}
Role     : normal
Access   : View players, view payments, view statistics
================================================================================
`;

  fs.writeFileSync(credentialsFilePath, credentialsContent, { encoding: 'utf8', flag: 'w' });
  console.log(`Credentials securely saved to: ${credentialsFilePath}`);

  // 5. Activity log
  await prisma.adminActivityLog.create({
    data: {
      adminId: supervisor.id,
      adminUsername: supervisor.username,
      action: 'SYSTEM_INITIALIZATION',
      targetType: 'SYSTEM',
      safeMetadata: JSON.stringify({ seeded: true, timestamp: new Date() })
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
