import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string {
  // If an external cloud database (Postgres, MySQL, etc.) is configured via env
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // If running in Vercel or AWS Lambda serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = '/tmp/dev.db';

    // If /tmp/dev.db does not exist yet in this Lambda instance, copy from packaged seed.db
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'seed.db'),
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(__dirname, 'seed.db'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`Copied database template from ${candidate} to ${tmpDbPath}`);
            break;
          } catch (e) {
            console.error('Failed to copy db to /tmp:', e);
          }
        }
      }
    }

    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || 'file:./dev.db';
}

const activeDbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = activeDbUrl;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
