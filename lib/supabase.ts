import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffgfzvnoyyvfmhuorzcw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2Z6dm5veXl2Zm1odW9yemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzA5OTAsImV4cCI6MjA5NjkwNjk5MH0.8JyBqa2HGiOrF2CxsPJYuM_rdXcUlxFGD_aHqluOwTE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for receipts
export const RECEIPTS_BUCKET = 'receipts';

// Upload receipt image to Supabase Storage
export async function uploadReceipt(file: File, redemptionId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${redemptionId}_${Date.now()}.${fileExt}`;
    const filePath = `cashier/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(RECEIPTS_BUCKET)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

// Delete receipt after 2 days (call this from backend/cron)
export async function deleteReceipt(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}
