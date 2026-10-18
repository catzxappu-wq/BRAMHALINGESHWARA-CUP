import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { uploadToCloud, getActiveCloudProvider } from '@/lib/cloudStorage';

export const dynamic = 'force-dynamic';

const MAX_SIZE = (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '8', 10)) * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get('photo') || formData.get('receipt') || formData.get('file')) as File | null;
    const folderType = (formData.get('folder') as string) === 'receipts' ? 'receipts' : 'players';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'ದಯವಿಟ್ಟು ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'ಕೇವಲ JPG, PNG ಮತ್ತು WEBP ಫಾರ್ಮ್ಯಾಟ್‌ಗಳ ಚಿತ್ರವನ್ನು ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'ಚಿತ್ರದ ಗಾತ್ರವು 8 MB ಗಿಂತ ಹೆಚ್ಚಿರಬಾರದು.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';

    const safeFilename = `${folderType}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Upload to permanent cloud storage (Cloudinary / Vercel Blob)
    const uploadResult = await uploadToCloud(buffer, folderType, safeFilename);

    return NextResponse.json({
      success: true,
      photoStorageKey: uploadResult.url,
      photoUrl: uploadResult.url,
      provider: uploadResult.provider,
      fileName: `${safeFilename}.${ext}`,
      activeCloudProvider: getActiveCloudProvider(),
      message: 'ಚಿತ್ರ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್ಲೋಡ್ ಆಗಿದೆ.',
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, message: 'ಚಿತ್ರ ಅಪ್ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.' },
      { status: 500 }
    );
  }
}
