/**
 * Sync Audience Script
 * 
 * Adds all emails from Newsletter-signup to the Resend audience
 * Audience ID: e5d7ecb0-d089-49a1-908e-6423de637cf9
 * 
 * Usage: pnpm sync-audience
 */

import dotenv from 'dotenv';
import { Resend } from 'resend';
import path from 'path';
import Database from 'better-sqlite3';

// Load environment variables first
dotenv.config();

// Import service after env vars are loaded
import resendAudienceService from '../src/services/resend-audience';

// Fixed audience ID
const AUDIENCE_ID = 'e5d7ecb0-d089-49a1-908e-6423de637cf9';

class AudienceSync {
  private resend: Resend;
  private db: Database.Database;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    
    this.resend = new Resend(process.env.RESEND_API_KEY);
    
    // Connect to SQLite database directly
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    this.db = new Database(dbPath);
  }

  /**
   * Fetch all newsletter subscribers from database
   */
  async fetchAllSubscribers(): Promise<string[]> {
    console.log('📧 Fetching all newsletter subscribers from database...');
    
    try {
      // Query SQLite database directly
      const stmt = this.db.prepare(`
        SELECT email FROM newsletter_signups 
        WHERE published_at IS NOT NULL 
        ORDER BY created_at DESC
      `);
      
      const rows = stmt.all() as { email: string }[];
      const emails = rows.map(row => row.email);
      
      console.log(`✅ Found ${emails.length} newsletter subscribers`);
      emails.forEach((email, index) => {
        console.log(`   ${index + 1}. ${email}`);
      });
      
      return emails;
    } catch (error) {
      console.error('❌ Error fetching newsletter subscribers:', error);
      throw error;
    }
  }

  /**
   * Bulk sync all subscribers to Resend audience using the audience service
   */
  async bulkSyncToAudience(emails: string[]): Promise<{ successCount: number; errors: string[] }> {
    console.log(`📤 Syncing ${emails.length} subscribers to Resend audience using bulk service...`);
    
    const result = await resendAudienceService.addContacts(emails, AUDIENCE_ID);
    
    return {
      successCount: result.successCount,
      errors: result.errors
    };
  }

  /**
   * Sync all subscribers to Resend audience
   */
  async syncToAudience(): Promise<void> {
    try {
      console.log('🔄 Starting audience synchronization...\n');
      console.log(`👥 Target audience ID: ${AUDIENCE_ID}\n`);

      // Fetch all subscribers
      const emails = await this.fetchAllSubscribers();

      if (emails.length === 0) {
        console.log('ℹ️  No subscribers found to sync');
        return;
      }

      // Use bulk sync service
      const syncResult = await this.bulkSyncToAudience(emails);
      const successCount = syncResult.successCount;
      const errorCount = syncResult.errors.length;
      const errors = syncResult.errors;

      // Report results
      console.log('\n📊 Synchronization Results:');
      console.log(`   ✅ Successfully added: ${successCount}/${emails.length}`);
      console.log(`   ❌ Errors: ${errorCount}`);

      if (errors.length > 0) {
        console.log('\n⚠️  Error details:');
        errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }

      if (errorCount === 0) {
        console.log('\n🎉 Audience synchronization completed successfully!');
      } else {
        console.log('\n⚠️  Audience synchronization completed with some errors');
      }

    } catch (error) {
      console.error('\n❌ Audience synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  cleanup() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Main execution
async function main() {
  const sync = new AudienceSync();
  
  try {
    console.log('🚀 Starting Newsletter Audience Sync...\n');
    await sync.syncToAudience();
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    sync.cleanup();
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

export default AudienceSync;