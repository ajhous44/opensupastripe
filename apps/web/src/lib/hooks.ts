import { useState, useEffect, useCallback } from 'react'
import { createClient } from './supabase-browser'
import { convertToWebP } from './file-utils'

/**
 * A hook that returns a debounced value after a specified delay.
 * Useful for reducing the frequency of API calls in search or autocomplete inputs.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear the timeout if the value changes before the delay has passed
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
} 

/**
 * Custom hook for uploading images to Supabase Storage with WebP conversion
 * 
 * @param options Configuration options for the uploader
 * @returns Upload functions and state variables
 */
export function useWebPUpload(options: {
  bucket: string;
  path?: string;
  convertOptions?: Parameters<typeof convertToWebP>[1];
  onSuccess?: (urls: string[] | string) => void;
  onError?: (error: Error) => void;
}) {
  const { 
    bucket, 
    path = '', 
    convertOptions,
    onSuccess,
    onError
  } = options;
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const supabase = createClient();
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  /**
   * Uploads a single WebP converted file to Supabase storage
   */
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    try {
      // Convert to WebP (if not already WebP)
      const webpFile = file.type.includes('webp') ? file : await convertToWebP(file, convertOptions);
      
      // Generate unique file path
      const fileExt = '.webp';
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, webpFile, {
          upsert: true,
          contentType: 'image/webp'
        });
        
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      if (!data?.path && !storageUrl) {
        throw new Error('Upload succeeded but no path or storage URL available');
      }
      
      // Build public URL for the file
      return `${storageUrl}/storage/v1/object/public/${bucket}/${data?.path || filePath}`;
    } catch (err) {
      console.error('File upload error:', err);
      throw err;
    }
  }, [bucket, path, convertOptions, supabase, storageUrl]);

  /**
   * Uploads a single file with WebP conversion
   */
  const upload = useCallback(async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const url = await uploadFile(file);
      setUploadedUrls([url]);
      setProgress(100);
      
      if (onSuccess) {
        onSuccess(url);
      }
      
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, onSuccess, onError]);

  /**
   * Uploads multiple files with WebP conversion
   */
  const uploadMultiple = useCallback(async (files: File[]) => {
    if (!files.length) return [];
    
    setIsUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const urls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        // Update progress as each file completes
        const url = await uploadFile(files[i]);
        urls.push(url);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      setUploadedUrls(urls);
      
      if (onSuccess) {
        onSuccess(urls);
      }
      
      return urls;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, onSuccess, onError]);

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
    uploadedUrls,
  };
} 