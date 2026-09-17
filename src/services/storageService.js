import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BUCKET_NAME = 'restaurant-images';

/**
 * Helper to convert a Base64 dataUrl to a Blob for uploading.
 */
function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Sanitizes a file name for safe storage paths.
 */
function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Upload an image to Supabase Storage bucket 'restaurant-images'.
 * Requires an authenticated Supabase user according to storage RLS.
 *
 * @param {File|Blob|string} imageFileOrData - The image to upload
 * @param {'menu'|'gallery'} folder - Target folder in bucket
 * @param {string} [fileName] - Optional file name
 * @returns {Promise<{ success: boolean, url: string, error?: string }>}
 */
export async function uploadImageToStorage(imageFileOrData, folder = 'menu', fileName = '') {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured.',
    };
  }

  // Check if session is authenticated
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return {
        success: false,
        error: 'Authenticated admin session required for storage uploads.',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Could not verify admin authentication session.',
    };
  }

  try {
    let blob;
    let fileExtension = 'jpg';

    if (typeof imageFileOrData === 'string') {
      if (imageFileOrData.startsWith('data:image/')) {
        const extMatch = imageFileOrData.match(/^data:image\/([a-zA-Z0-9]+);/);
        if (extMatch) {
          fileExtension = extMatch[1] === 'jpeg' ? 'jpg' : extMatch[1];
        }
        blob = dataUrlToBlob(imageFileOrData);
      } else {
        // Already a URL (e.g. existing Supabase URL or local path)
        return { success: true, url: imageFileOrData };
      }
    } else if (imageFileOrData instanceof Blob) {
      blob = imageFileOrData;
      if (imageFileOrData.type) {
        const ext = imageFileOrData.type.split('/')[1];
        if (ext) fileExtension = ext === 'jpeg' ? 'jpg' : ext;
      }
    } else {
      return { success: false, error: 'Unsupported image format for upload' };
    }

    const cleanBaseName = fileName
      ? sanitizeFileName(fileName.replace(/\.[^/.]+$/, ''))
      : 'image';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const storagePath = `${folder}/${timestamp}-${cleanBaseName}-${randomSuffix}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, blob, {
        cacheControl: '31536000',
        upsert: true,
        contentType: blob.type || `image/${fileExtension}`,
      });

    if (uploadError) {
      console.warn(`[Supabase Storage] Upload error:`, uploadError.message);
      return {
        success: false,
        error: uploadError.message,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: storagePath,
    };
  } catch (err) {
    console.error('[Supabase Storage] Exception uploading image:', err);
    return {
      success: false,
      error: err.message || 'Image upload failed',
    };
  }
}
