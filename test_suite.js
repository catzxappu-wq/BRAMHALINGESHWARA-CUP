const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runTests() {
  console.log('================================================================');
  console.log('RUNNING TOURNAMENT BACKEND & DATABASE VERIFICATION TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Database connection & Settings check
    console.log('\n--- Test Group 1: Database & Tournament Settings ---');
    const settings = await prisma.tournamentSetting.findUnique({ where: { id: 1 } });
    assert(settings !== null, 'TournamentSetting table initialized');
    assert(settings.tournamentName === 'ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್', 'Tournament name matches poster in Kannada');
    assert(settings.tournamentVenue === 'ಗೆಣಸಿನಕುಣಿ', 'Tournament venue matches poster');
    assert(settings.registrationCapacity > 0, `Capacity is set (${settings.registrationCapacity})`);

    // TEST 2: Supervisor & Normal Admin accounts
    console.log('\n--- Test Group 2: Admin Accounts & Password Hashing ---');
    const supervisor = await prisma.admin.findUnique({
      where: { username: 'catzxappu' },
      include: { permissions: true },
    });
    assert(supervisor !== null, 'Supervisor admin account (catzxappu) exists');
    assert(supervisor.role === 'supervisor', 'Supervisor has role=supervisor');
    assert(supervisor.isActive === true, 'Supervisor account is active');

    const normalAdmin = await prisma.admin.findUnique({
      where: { username: 'admin_staff' },
      include: { permissions: true },
    });
    assert(normalAdmin !== null, 'Normal admin account exists');
    assert(normalAdmin.role === 'normal', 'Normal admin has role=normal');
    assert(normalAdmin.permissions.length > 0, 'Normal admin has explicit assigned permissions');

    // TEST 3: Password verification
    const credFile = fs.readFileSync(path.join(__dirname, 'admin_credentials.txt'), 'utf8');
    assert(credFile.includes('catzxappu'), 'admin_credentials.txt contains supervisor username catzxappu');
    assert(credFile.includes('admin_staff'), 'admin_credentials.txt contains normal admin username');

    // Extract supervisor password from file
    const supMatch = credFile.match(/Username : catzxappu\r?\nPassword : (.+)/);
    if (supMatch && supMatch[1] && !supMatch[1].includes('[')) {
      const match = await bcrypt.compare(supMatch[1].trim(), supervisor.passwordHash);
      assert(match === true, 'Supervisor password in admin_credentials.txt hashes properly and matches DB');
    }

    // TEST 4: Atomic Unique Registration Code Generation
    console.log('\n--- Test Group 3: Atomic Registration Code Generation ---');
    const seq1 = await prisma.codeSequence.upsert({
      where: { id: 'player_code' },
      update: { lastNumber: { increment: 1 } },
      create: { id: 'player_code', lastNumber: 1 },
    });
    const code1 = `SBK26-${String(seq1.lastNumber).padStart(6, '0')}`;
    assert(code1.startsWith('SBK26-'), `Generated code format is valid: ${code1}`);

    const seq2 = await prisma.codeSequence.upsert({
      where: { id: 'player_code' },
      update: { lastNumber: { increment: 1 } },
      create: { id: 'player_code', lastNumber: 1 },
    });
    const code2 = `SBK26-${String(seq2.lastNumber).padStart(6, '0')}`;
    assert(code2 !== code1, `Sequential code is strictly unique: ${code1} -> ${code2}`);

    // TEST 5: Player Registration & Receipt Upload Lifecycle
    console.log('\n--- Test Group 4: Player Registration & Receipt Upload Flow ---');
    const testMobile = '9876543210';
    // Clean any prior test player
    await prisma.player.deleteMany({ where: { mobileNumber: testMobile } });

    // In the new receipt-based flow, the registration code is issued immediately upon form submission
    const newSeq = await prisma.codeSequence.upsert({
      where: { id: 'player_code' },
      update: { lastNumber: { increment: 1 } },
      create: { id: 'player_code', lastNumber: 1 },
    });
    const regCode = `SBK26-${String(newSeq.lastNumber).padStart(6, '0')}`;

    const testPlayer = await prisma.player.create({
      data: {
        registrationCode: regCode,
        fullName: 'ಮಹೇಶ್ ಕುಮಾರ್',
        mobileNumber: testMobile,
        address: 'ಗೆಣಸಿನಕುಣಿ, ಅವಿನಹಳ್ಳಿ ಹೋಬಳಿ',
        playerCategory: 'all_rounder',
        photoStorageKey: 'data:image/jpeg;base64,mockphotodata',
        paymentReceiptStorageKey: 'data:image/jpeg;base64,mockreceiptdata',
        guidanceBy: 'ಪ್ರಜ್ವಲ್ PK (ಕ್ಯಾಪ್ಟನ್)',
        transactionReference: 'UPI1234567890',
        paymentStatus: 'pending',
        selectionStatus: 'pending',
        registrationStatus: 'completed',
      },
    });
    assert(testPlayer.id !== null, 'Player record created with receipt upload');
    assert(testPlayer.registrationCode === regCode, `Unique registration code assigned: ${regCode}`);
    assert(testPlayer.guidanceBy === 'ಪ್ರಜ್ವಲ್ PK (ಕ್ಯಾಪ್ಟನ್)', 'Guidance By field saved properly');
    assert(testPlayer.paymentReceiptStorageKey !== null, 'Payment receipt screenshot saved properly');
    assert(testPlayer.transactionReference === 'UPI1234567890', 'Transaction reference (UTR) saved');
    assert(testPlayer.paymentStatus === 'pending', 'Player payment status initially pending review');

    // Simulate Admin Verifying & Approving Payment Receipt
    const paidPlayer = await prisma.player.update({
      where: { id: testPlayer.id },
      data: { paymentStatus: 'paid' },
    });
    assert(paidPlayer.paymentStatus === 'paid', 'Admin verified and marked payment receipt as paid');

    // TEST 6: Status check query
    console.log('\n--- Test Group 5: Status Check Query ---');
    const statusQuery = await prisma.player.findFirst({
      where: { registrationCode: regCode, mobileNumber: testMobile },
      select: { fullName: true, playerCategory: true, paymentStatus: true, selectionStatus: true, guidanceBy: true },
    });
    assert(statusQuery !== null, 'Status check query succeeds with code and mobile');
    assert(statusQuery.fullName === 'ಮಹೇಶ್ ಕುಮಾರ್', 'Player name verified');
    assert(statusQuery.playerCategory === 'all_rounder', 'Player category verified');
    assert(statusQuery.guidanceBy === 'ಪ್ರಜ್ವಲ್ PK (ಕ್ಯಾಪ್ಟನ್)', 'Guidance By verified');
    assert(statusQuery.paymentStatus === 'paid', 'Payment status is verified paid');

    // TEST 7: Selection Status Update
    console.log('\n--- Test Group 6: Admin Selection Update ---');
    const approvedPlayer = await prisma.player.update({
      where: { id: testPlayer.id },
      data: { selectionStatus: 'approved' },
    });
    assert(approvedPlayer.selectionStatus === 'approved', 'Admin successfully approved player');

    // Clean up test player
    await prisma.player.delete({ where: { id: testPlayer.id } });
    console.log('Test player record cleaned up.');

    console.log('\n================================================================');
    console.log(`TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');
  } catch (err) {
    console.error('Test Suite encountered an error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
