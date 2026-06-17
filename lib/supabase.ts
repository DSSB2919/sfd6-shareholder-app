import { createClient } from '@supabase/supabase-js';
import { type Redemption } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffgfzvnoyyvfmhuorzcw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2Z6dm5veXl2Zm1odW9yemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzA5OTAsImV4cCI6MjA5NjkwNjk5MH0.8JyBqa2HGiOrF2CxsPJYuM_rdXcUlxFGD_aHqluOwTE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Storage bucket name for receipts
export const RECEIPTS_BUCKET = 'receipts';

// Extended Redemption type for Supabase (includes DB-specific fields)
export interface RedemptionRecord {
  id: string;
  shareholder_id: number;
  shareholder_name: string;
  shareholder_member_no: string;
  food_amount: number;
  alcohol_amount: number;
  total_deduct: number;
  final_pay: number;
  receipt_url: string | null;
  receipt_path: string | null;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
}

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

// Create redemption record
export async function createRedemption(data: Omit<RedemptionRecord, 'id' | 'created_at' | 'verified_at' | 'verified_by'>): Promise<RedemptionRecord | null> {
  try {
    const { data: result, error } = await supabase
      .from('redemptions')
      .insert([{
        ...data,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) {
      console.error('Create redemption error:', error);
      return null;
    }

    return result as RedemptionRecord;
  } catch (error) {
    console.error('Create redemption failed:', error);
    return null;
  }
}

// Get all redemptions
export async function getRedemptions(): Promise<RedemptionRecord[]> {
  try {
    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get redemptions error:', error);
      return [];
    }

    return data as RedemptionRecord[];
  } catch (error) {
    console.error('Get redemptions failed:', error);
    return [];
  }
}

// Update redemption status
export async function updateRedemptionStatus(
  id: string, 
  status: 'verified' | 'rejected', 
  verifiedBy: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('redemptions')
      .update({
        status,
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy,
      })
      .eq('id', id);

    if (error) {
      console.error('Update redemption error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Update redemption failed:', error);
    return false;
  }
}

// Delete redemption and its receipt
export async function deleteRedemption(id: string, receiptPath: string | null): Promise<boolean> {
  try {
    // Delete receipt from storage if exists
    if (receiptPath) {
      await deleteReceipt(receiptPath);
    }

    // Delete record from database
    const { error } = await supabase
      .from('redemptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete redemption error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete redemption failed:', error);
    return false;
  }
}

// Get old redemptions for cleanup (older than 2 days)
export async function getOldRedemptions(days: number = 2): Promise<RedemptionRecord[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Get old redemptions error:', error);
      return [];
    }

    return data as RedemptionRecord[];
  } catch (error) {
    console.error('Get old redemptions failed:', error);
    return [];
  }
}
