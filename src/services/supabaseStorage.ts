import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

export type StorageBucket = 
  | 'avatars' 
  | 'course-assets' 
  | 'project-assets' 
  | 'event-assets' 
  | 'achievement-assets';

export const supabaseStorage = {
  /**
   * Upload file to a specific Supabase storage bucket
   */
  uploadFile: async (
    bucket: StorageBucket,
    filePath: string,
    file: File,
    options: { upsert?: boolean } = { upsert: true }
  ): Promise<{ path: string; publicUrl?: string }> => {
    if (!isSupabaseConfigured()) {
      console.warn('[SupabaseStorage] Supabase credentials not configured. Returning local object URL.');
      return { path: filePath, publicUrl: URL.createObjectURL(file) };
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: options.upsert,
        cacheControl: '3600',
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    };
  },

  /**
   * Get public URL for an asset
   */
  getPublicUrl: (bucket: StorageBucket, path: string): string => {
    if (!isSupabaseConfigured()) {
      return path;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Create signed URL for private assets
   */
  createSignedUrl: async (bucket: StorageBucket, path: string, expiresIn = 3600): Promise<string> => {
    if (!isSupabaseConfigured()) {
      return path;
    }
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
    return data.signedUrl;
  },

  /**
   * Delete file from bucket
   */
  deleteFile: async (bucket: StorageBucket, path: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return true;
    }
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Failed to remove file: ${error.message}`);
    }
    return true;
  },
};
