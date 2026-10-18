import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveCloudProvider, isCloudStorageConfigured } from '@/lib/cloudStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cloudProvider = getActiveCloudProvider();
    const isCloudConfigured = isCloudStorageConfigured();

    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
    const databaseType = isPostgres ? 'PostgreSQL (Supabase / Cloud DB)' : 'SQLite (Local / Ephemeral)';

    let playerCount = 0;
    let dbConnected = false;
    let dbError = null;

    try {
      playerCount = await prisma.player.count();
      dbConnected = true;
    } catch (err: any) {
      dbError = err?.message || String(err);
    }

    return NextResponse.json({
      success: true,
      storage: {
        provider: cloudProvider,
        isConfigured: isCloudConfigured,
        cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ? `${process.env.CLOUDINARY_CLOUD_NAME.slice(0, 3)}***` : null,
        hasVercelBlob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
        instructions: !isCloudConfigured
          ? 'Add CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) to Vercel Environment Variables.'
          : 'Permanent cloud storage is active!',
      },
      database: {
        type: databaseType,
        isPostgres,
        isConnected: dbConnected,
        playerCount,
        dbError,
        instructions: !isPostgres
          ? 'Add DATABASE_URL from your Supabase Project Settings to Vercel Environment Variables for permanent database storage.'
          : 'Permanent cloud database is active!',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
