// Cleanup script for old redemptions (run daily via cron)
// Usage: node scripts/cleanup-old-redemptions.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffgfzvnoyyvfmhuorzcw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2Z6dm5veXl2Zm1odW9yemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzA5OTAsImV4cCI6MjA5NjkwNjk5MH0.8JyBqa2HGiOrF2CxsPJYuM_rdXcUlxFGD_aHqluOwTE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const RECEIPTS_BUCKET = 'receipts';
const CLEANUP_DAYS = 2;

async function cleanupOldRedemptions() {
  console.log(`[${new Date().toISOString()}] Starting cleanup...`);
  
  try {
    // Calculate cutoff date (2 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS);
    
    console.log(`Deleting redemptions older than: ${cutoffDate.toISOString()}`);
    
    // Get old redemptions
    const { data: oldRedemptions, error: fetchError } = await supabase
      .from('redemptions')
      .select('*')
      .lt('created_at', cutoffDate.toISOString());
    
    if (fetchError) {
      console.error('Error fetching old redemptions:', fetchError);
      process.exit(1);
    }
    
    if (!oldRedemptions || oldRedemptions.length === 0) {
      console.log('No old redemptions to clean up.');
      process.exit(0);
    }
    
    console.log(`Found ${oldRedemptions.length} old redemptions to delete.`);
    
    // Delete receipts from storage
    const filesToDelete = oldRedemptions
      .filter(r => r.receipt_path)
      .map(r => r.receipt_path);
    
    if (filesToDelete.length > 0) {
      console.log(`Deleting ${filesToDelete.length} receipt files...`);
      const { error: storageError } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .remove(filesToDelete);
      
      if (storageError) {
        console.error('Error deleting receipt files:', storageError);
      } else {
        console.log(`Deleted ${filesToDelete.length} receipt files.`);
      }
    }
    
    // Delete records from database
    const idsToDelete = oldRedemptions.map(r => r.id);
    const { error: deleteError } = await supabase
      .from('redemptions')
      .delete()
      .in('id', idsToDelete);
    
    if (deleteError) {
      console.error('Error deleting redemption records:', deleteError);
      process.exit(1);
    }
    
    console.log(`Successfully deleted ${oldRedemptions.length} old redemptions.`);
    process.exit(0);
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupOldRedemptions();
