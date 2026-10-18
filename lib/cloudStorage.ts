import { v2 as cloudinary } from 'cloudinary';
import { put } from '@vercel/blob';
import crypto from 'crypto';

// Configure Cloudinary from env variables if available
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  cloudinary.config({ cloudinary_url: cloudinaryUrl });
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function isCloudStorageConfigured(): boolean {
  const hasCloudinary = Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
  const hasVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return hasCloudinary || hasVercelBlob;
}

export function getActiveCloudProvider(): 'cloudinary' | 'vercel_blob' | 'none' {
  if (
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  ) {
    return 'cloudinary';
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return 'vercel_blob';
  }
  return 'none';
}

export interface CloudUploadResult {
  url: string;
  provider: 'cloudinary' | 'vercel_blob' | 'local_fallback';
  publicId?: string;
  bytes?: number;
}

/**
 * Upload an image (Data URI, Buffer, or File) to permanent cloud storage.
 * Priority:
 * 1. Cloudinary (if configured)
 * 2. Vercel Blob (if configured)
 * 3. Graceful fallback (data URI / local storage)
 */
export async function uploadToCloud(
  input: string | Buffer,
  folder: 'players' | 'receipts',
  preferredFilename?: string
): Promise<CloudUploadResult> {
  const provider = getActiveCloudProvider();
  const safeBase = preferredFilename
    ? preferredFilename.replace(/[^a-zA-Z0-9_-]/g, '_')
    : `${folder}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // --- 1. CLOUDINARY UPLOAD ---
  if (provider === 'cloudinary') {
    try {
      let uploadSource: string;

      if (typeof input === 'string') {
        uploadSource = input; // Data URI or URL
      } else {
        // Buffer to base64 Data URI
        uploadSource = `data:image/jpeg;base64,${input.toString('base64')}`;
      }

      const res = await cloudinary.uploader.upload(uploadSource, {
        folder: `brahmalingeshwara-cup/${folder}`,
        public_id: safeBase,
        resource_type: 'image',
        overwrite: true,
      });

      return {
        url: res.secure_url || res.url,
        provider: 'cloudinary',
        publicId: res.public_id,
        bytes: res.bytes,
      };
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      // Fall through to fallback
    }
  }

  // --- 2. VERCEL BLOB UPLOAD ---
  if (provider === 'vercel_blob') {
    try {
      let buffer: Buffer;
      let contentType = 'image/jpeg';

      if (typeof input === 'string') {
        if (input.startsWith('data:')) {
          const match = input.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            contentType = match[1];
            buffer = Buffer.from(match[2], 'base64');
          } else {
            buffer = Buffer.from(input);
          }
        } else {
          buffer = Buffer.from(input);
        }
      } else {
        buffer = input;
      }

      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const filename = `${folder}/${safeBase}.${ext}`;

      const blob = await put(filename, buffer, {
        access: 'public',
        contentType,
      });

      return {
        url: blob.url,
        provider: 'vercel_blob',
        bytes: buffer.length,
      };
    } catch (err) {
      console.error('Vercel Blob upload error:', err);
      // Fall through to fallback
    }
  }

  // --- 3. FALLBACK: Return Data URI directly ---
  if (typeof input === 'string' && input.startsWith('data:')) {
    return {
      url: input,
      provider: 'local_fallback',
    };
  }

  if (Buffer.isBuffer(input)) {
    return {
      url: `data:image/jpeg;base64,${input.toString('base64')}`,
      provider: 'local_fallback',
    };
  }

  return {
    url: String(input),
    provider: 'local_fallback',
  };
}
