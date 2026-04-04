import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileUrl: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(fileUrl, {
    folder: 'autoflow-ethiopia',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },           // WebP/AVIF auto
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