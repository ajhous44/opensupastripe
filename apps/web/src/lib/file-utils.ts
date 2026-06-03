import sizeOf from 'image-size';
import { MAX_IMAGE_SIZE_MB } from './constants';

// Maximum file size in bytes (5MB)
export const MAX_FILE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * Validates if a file is a valid image by checking its structure
 * @param file The file to validate
 * @returns A promise that resolves to a validation result object
 */
export async function validateImage(file: File): Promise<{ 
  valid: boolean; 
  message?: string;
}> {
  // Check file size first (already done in the app, but included here for completeness)
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      message: `File exceeds the ${MAX_IMAGE_SIZE_MB}MB size limit` 
    };
  }
  
  // Check file type based on MIME
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validMimeTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: `File is not a supported image type. Use JPEG, PNG, WEBP or GIF` 
    };
  }
  
  // Check image structure integrity
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Buffer for image-size
    const buffer = Buffer.from(arrayBuffer);
    
    // Attempt to determine image dimensions - will throw if not a valid image
    const dimensions = sizeOf(buffer);
    
    // Additional check to verify dimensions are present
    if (!dimensions || !dimensions.width || !dimensions.height) {
      return { 
        valid: false, 
        message: 'Invalid image file format' 
      };
    }
    return { valid: true };
  } catch (error) {
    console.error('Image validation failed:', error);
    return { 
      valid: false,
      message: 'The file is not a valid image'
    };
  }
} 

/**
 * Converts an image file to WebP format with specified quality and max dimensions
 * @param file Original image file
 * @param options Configuration options
 * @returns Promise resolving to a new File object in WebP format
 */
export async function convertToWebP(
  file: File,
  options: {
    quality?: number; // 0-100, default 85
    maxWidth?: number; // Maximum width in pixels
    maxHeight?: number; // Maximum height in pixels
    maintainAspectRatio?: boolean; // Maintain aspect ratio when resizing
  } = {}
): Promise<File> {
  // Default options
  const {
    quality = 85,
    maxWidth = 1920,
    maxHeight = 1920,
    maintainAspectRatio = true
  } = options;

  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }
  
  return new Promise((resolve, reject) => {
    // Create image element to load the file
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions if resizing is needed
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        if (maintainAspectRatio) {
          // Calculate the scaling factor
          const scaleFactor = Math.min(
            maxWidth / width,
            maxHeight / height
          );
          const newDimensions = {
            width: Math.floor(width * scaleFactor),
            height: Math.floor(height * scaleFactor)
          };
          ({ width, height } = newDimensions);
        } else {
          const newDimensions = {
            width: Math.min(width, maxWidth),
            height: Math.min(height, maxHeight)
          };
          ({ width, height } = newDimensions);
        }
      }
      
      // Create canvas for the image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not convert image to WebP'));
            return;
          }
          
          // Create a new file from the WebP blob
          const newFilename = file.name.replace(/\.[^.]+$/, '') + '.webp';
          const newFile = new File([blob], newFilename, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          resolve(newFile);
        },
        'image/webp',
        quality / 100
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load the image from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Function to process multiple files, converting them all to WebP format
 * @param files Array of image files
 * @param options WebP conversion options
 * @returns Promise resolving to array of converted WebP files
 */
export async function batchConvertToWebP(
  files: File[],
  options?: Parameters<typeof convertToWebP>[1]
): Promise<File[]> {
  const conversionPromises = files.map(file => {
    // Only convert images
    if (file.type.startsWith('image/') && !file.type.includes('webp')) {
      return convertToWebP(file, options);
    }
    // Return non-image files unchanged
    return Promise.resolve(file);
  });
  
  return Promise.all(conversionPromises);
} 