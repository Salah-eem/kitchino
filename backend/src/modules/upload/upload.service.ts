import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== '...' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== '...' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== '...';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    if (!isCloudinaryConfigured) {
      throw new BadRequestException('Cloudinary is not configured. Please check your .env file.');
    }

    try {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'kitchino-products', resource_type: 'auto' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              return reject(new BadRequestException(`Cloudinary upload failed: ${error.message || 'Unknown error'}`));
            }
            if (!result) return reject(new Error('Upload failed: Result is undefined'));
            resolve(result.secure_url);
          }
        );

        const { Readable } = require('stream');
        const readable = new Readable();
        readable.push(file.buffer);
        readable.push(null);
        readable.pipe(stream);
      });
    } catch (error) {
      console.error('Upload Service Error:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  async getImageUrl(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      secure: true,
      type: 'upload',
    });
  }
}
