import { Prisma } from '@prisma/client';
import prisma from './prisma';

/**
 * Generates an atomic, unique registration code in format SBK26-000001
 * Uses database sequence transaction to guarantee uniqueness and prevent race conditions.
 */
export async function generateUniqueRegistrationCode(
  customTx?: Prisma.TransactionClient
): Promise<string> {
  const db = customTx || prisma;

  // Perform atomic increment
  const seq = await db.codeSequence.upsert({
    where: { id: 'player_code' },
    update: {
      lastNumber: {
        increment: 1,
      },
    },
    create: {
      id: 'player_code',
      lastNumber: 1,
    },
  });

  const paddedNumber = String(seq.lastNumber).padStart(6, '0');
  return `SBK26-${paddedNumber}`;
}
