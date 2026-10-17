import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_SIZE = (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10)) * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ಭಾವಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'ಕೇವಲ JPG, PNG ಮತ್ತು WEBP ಫಾರ್ಮ್ಯಾಟ್‌ಗಳ ಭಾವಚಿತ್ರವನ್ನು ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'ಭಾವಚಿತ್ರದ ಗಾತ್ರವು 5 MB ಗಿಂತ ಹೆಚ್ಚಿರಬಾರದು.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension
    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';

    const safeFilename = `player_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      photoStorageKey: safeFilename,
      photoUrl: `/api/uploads/${safeFilename}`,
      message: 'ಭಾವಚಿತ್ರ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್ಲೋಡ್ ಆಗಿದೆ.',
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { success: false, message: 'ಭಾವಚಿತ್ರ ಅಪ್ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.' },
      { status: 500 }
    );
  }
}
