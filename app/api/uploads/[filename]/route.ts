import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Prevent path traversal
    const safeFilename = path.basename(filename);
    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    let contentType = 'image/jpeg';
    if (safeFilename.endsWith('.png')) contentType = 'image/png';
    else if (safeFilename.endsWith('.webp')) contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('File serve error:', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}
