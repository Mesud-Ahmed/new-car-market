import { v2 as cloudinary } from 'cloudinary';
import { env } from './config';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

function validateRemoteFileUrl(fileUrl: string): void {
  let parsed: URL;

  try {
    parsed = new URL(fileUrl);
  } catch {
    throw new Error('Invalid photo URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Photo URL must use HTTP(S)');
  }
}

export const uploadToCloudinary = async (fileUrl: string): Promise<string> => {
  validateRemoteFileUrl(fileUrl);

  const result = await cloudinary.uploader.upload(fileUrl, {
    folder: 'autoflow-ethiopia',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
      {
        overlay: 'text:Arial_60_bold:freedom%20car%20sale',
        gravity: 'south_east',
        opacity: 60,
        color: 'white',
        x: 30,
        y: 30,
      },
    ],
  });

  return result.secure_url;
};

export { cloudinary };
