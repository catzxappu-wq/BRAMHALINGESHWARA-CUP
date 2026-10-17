import { Prisma } from '@prisma/client';
import prisma from './prisma';

export interface CapacityCheckResult {
  isOpen: boolean;
  canRegister: boolean;
  reasonKannada?: string;
  totalRegistered: number;
  maxCapacity: number;
  remainingSlots: number;
  countingRule: string;
  registrationFee: number;
}

export async function checkRegistrationCapacity(
  customTx?: Prisma.TransactionClient
): Promise<CapacityCheckResult> {
  const db = customTx || prisma;

  const settings = await db.tournamentSetting.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    return {
      isOpen: false,
      canRegister: false,
      reasonKannada: "ಪಂದ್ಯಾವಳಿ ಸೆಟ್ಟಿಂಗ್ಸ್ ಲಭ್ಯವಿಲ್ಲ.",
      totalRegistered: 0,
      maxCapacity: 0,
      remainingSlots: 0,
      countingRule: 'paid',
      registrationFee: 0,
    };
  }

  // 1. Check if admin manually closed registration
  if (!settings.registrationOpen) {
    return {
      isOpen: false,
      canRegister: false,
      reasonKannada: "ಕ್ಷಮಿಸಿ, ಆಡಳಿತ ಮಂಡಳಿಯು ನೋಂದಣಿಯನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ಮುಕ್ತಾಯಗೊಳಿಸಿದೆ.",
      totalRegistered: 0,
      maxCapacity: settings.registrationCapacity,
      remainingSlots: 0,
      countingRule: settings.capacityCountingRule,
      registrationFee: settings.registrationFee,
    };
  }

  // 2. Check registration deadline
  if (settings.registrationDeadline && new Date() > new Date(settings.registrationDeadline)) {
    return {
      isOpen: false,
      canRegister: false,
      reasonKannada: "ನೋಂದಣಿಯ ಅಂತಿಮ ದಿನಾಂಕ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.",
      totalRegistered: 0,
      maxCapacity: settings.registrationCapacity,
      remainingSlots: 0,
      countingRule: settings.capacityCountingRule,
      registrationFee: settings.registrationFee,
    };
  }

  // 3. Count according to configured rule
  const countWhere: Prisma.PlayerWhereInput =
    settings.capacityCountingRule === 'paid'
      ? { paymentStatus: 'paid' }
      : { registrationStatus: 'completed' };

  const currentCount = await db.player.count({
    where: countWhere,
  });

  const remainingSlots = Math.max(0, settings.registrationCapacity - currentCount);

  if (currentCount >= settings.registrationCapacity) {
    return {
      isOpen: true,
      canRegister: false,
      reasonKannada: `ಗರಿಷ್ಠ ನೋಂದಣಿ ಮಿತಿ (${settings.registrationCapacity} ಆಟಗಾರರು) ತಲುಪಿದೆ. ಪ್ರಸ್ತುತ ಹೊಸ ನೋಂದಣಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುವುದಿಲ್ಲ.`,
      totalRegistered: currentCount,
      maxCapacity: settings.registrationCapacity,
      remainingSlots: 0,
      countingRule: settings.capacityCountingRule,
      registrationFee: settings.registrationFee,
    };
  }

  return {
    isOpen: true,
    canRegister: true,
    totalRegistered: currentCount,
    maxCapacity: settings.registrationCapacity,
    remainingSlots,
    countingRule: settings.capacityCountingRule,
    registrationFee: settings.registrationFee,
  };
}
