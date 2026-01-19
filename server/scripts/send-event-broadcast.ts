/**
 * Send Event Broadcast Script
 * 
 * Sends event/meeting announcements to the Resend audience based on active banner
 * Fetches banner info (title, description, link, date) and sends to subscribers
 * Audience ID: e5d7ecb0-d089-49a1-908e-6423de637cf9
 * 
 * Usage: pnpm send-event-broadcast
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Fixed audience ID
const AUDIENCE_ID = 'e5d7ecb0-d089-49a1-908e-6423de637cf9';

// Types for banner/event content
interface EventBanner {
  id: number;
  title: string;
  description: string;
  link?: string;
  date?: string;
  isActive: boolean;
}

class EventBroadcastSender {
  private resend: Resend;
  private fromEmail: string;
  private siteUrl: string;
  private strapiUrl: string;
  private strapiApiToken: string | undefined;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_DEFAULT_FROM_EMAIL || 'onboarding@resend.dev';
    this.siteUrl = process.env.FRONTEND_URL || 'https://religousphilosophy.com/';
    this.strapiUrl = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
    this.strapiApiToken = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  }

  /**
   * Fetch active banner from Strapi API
   */
  async fetchActiveBanner(): Promise<EventBanner | null> {
    console.log('🎯 Fetching active banner from Strapi API...');
    
    try {
      const url = `${this.strapiUrl}/api/banner`;
      
      console.log(`🔍 Fetching from: ${url}`);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.strapiApiToken) {
        headers['Authorization'] = `Bearer ${this.strapiApiToken}`;
      }
      
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error:`, errorText);
        throw new Error(`Failed to fetch banner: ${response.statusText}`);
      }
      
      const result = await response.json() as { 
        data?: { 
          id: number; 
          attributes?: Omit<EventBanner, 'id'>;
          // Handle flattened format (Strapi v5 sometimes flattens single types)
          title?: string;
          description?: string;
          link?: string;
          date?: string;
          isActive?: boolean;
        } 
      };
      
      if (!result.data) {
        console.log('ℹ️  No banner found');
        return null;
      }

      // Handle Strapi v5 response format (with attributes) or flattened format
      const banner: EventBanner = result.data.attributes 
        ? {
            id: result.data.id,
            ...result.data.attributes
          }
        : {
            id: result.data.id,
            title: result.data.title || '',
            description: result.data.description || '',
            link: result.data.link,
            date: result.data.date,
            isActive: result.data.isActive ?? false
          };

      // Validate required fields
      if (!banner.title || !banner.description) {
        console.log('⚠️  Banner found but missing required fields (title or description)');
        return null;
      }

      if (!banner.isActive) {
        console.log('ℹ️  Banner exists but is not active');
        return null;
      }

      console.log(`✅ Found active banner: "${banner.title}"`);
      if (banner.date) {
        console.log(`   📅 Event date: ${new Date(banner.date).toLocaleString('he-IL')}`);
      }
      if (banner.link) {
        console.log(`   🔗 Link: ${banner.link}`);
      }

      return banner;
    } catch (error) {
      console.error('❌ Error fetching banner from Strapi:', error);
      throw error;
    }
  }

  /**
   * Generate Hebrew/RTL email template for event announcement
   */
  generateEventEmailTemplate(banner: EventBanner): string {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const hasDate = banner.date && banner.date.trim() !== '';
    const hasLink = banner.link && banner.link.trim() !== '';

    return `
      <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎯 הזמנה למפגש מיוחד</h1>
          <p style="color: #e8e8e8; margin: 15px 0 0 0; font-size: 18px;">פילוסופיה דתית</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 40px 30px;">
          <!-- Event Title -->
          <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-right: 4px solid #667eea; padding: 25px; margin-bottom: 30px; border-radius: 8px;">
            <h2 style="color: #667eea; margin: 0; font-size: 26px; font-weight: bold; line-height: 1.4;">
              ${banner.title}
            </h2>
          </div>
          
          ${hasDate ? `
          <!-- Event Date -->
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <div style="color: #667eea; font-size: 16px; font-weight: bold; margin-bottom: 8px;">📅 מועד המפגש</div>
            <div style="color: #333; font-size: 20px; font-weight: bold;">
              ${formatDate(banner.date!)}
            </div>
          </div>
          ` : ''}
          
          <!-- Event Description -->
          <div style="margin: 30px 0;">
            <h3 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 8px;">
              📝 אודות המפגש
            </h3>
            <div style="font-size: 17px; line-height: 1.8; color: #555; white-space: pre-wrap;">
${banner.description}
            </div>
          </div>
          
          ${hasLink ? `
          <!-- Join Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${banner.link}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 18px 45px; 
                      border-radius: 30px; 
                      font-weight: bold;
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              🎯 הצטרפו למפגש
            </a>
          </div>
          ` : ''}
          
          <!-- Donation Block -->
          <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
            <h3 style="color: #dc2626; font-size: 20px; margin-top: 0; margin-bottom: 12px;">❤️ תמכו בנו</h3>
            <p style="font-size: 15px; line-height: 1.8; color: #555; margin: 0 0 15px 0;">
              פלטפורמה זו מוקדשת להנגשת פילוסופיה דתית איכותית לקהל רחב. כל תרומה עוזרת לנו להמשיך להפיץ ידע ותכנים מרתקים לקהילה.
            </p>
            <a href="${this.siteUrl}" 
               style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 35px; 
                      border-radius: 30px; 
                      font-weight: bold;
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
              ❤️ תמכו בנו
            </a>
          </div>
          
          <!-- Visit Site Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${this.siteUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 35px; 
                      border-radius: 30px; 
                      font-weight: bold;
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              🏠 בקרו באתר לתכנים נוספים
            </a>
          </div>
          
          <p style="color: #666; font-size: 16px; text-align: center; margin-top: 40px; line-height: 1.6;">
            מצפים לראותכם!<br>
            <strong style="color: #667eea;">צוות פילוסופיה דתית</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f1f3f4; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">
            הזמנה למפגש מיוחד - פילוסופיה דתית
          </p>
          <p style="margin: 0; color: #888; font-size: 12px;">
            <a href="${this.siteUrl}/unsubscribe" style="color: #667eea; text-decoration: none;">
              ביטול מנוי
            </a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Get all contacts in the audience
   */
  async getAudienceContacts(): Promise<string[]> {
    try {
      const { data: contacts, error } = await this.resend.contacts.list({
        audienceId: AUDIENCE_ID
      });

      if (error) {
        throw new Error(`Failed to get audience contacts: ${error.message}`);
      }

      const contactList = contacts?.data || [];
      const emails = contactList.map(contact => contact.email);
      
      console.log(`📧 Found ${emails.length} contacts in audience`);
      return emails;
    } catch (error) {
      console.error('❌ Error fetching audience contacts:', error);
      throw error;
    }
  }

  /**
   * Create and send event broadcast
   */
  async createAndSendBroadcast(banner: EventBanner): Promise<void> {
    const subject = `🎯 הזמנה מיוחדת: ${banner.title}`;
    const htmlContent = this.generateEventEmailTemplate(banner);

    console.log('📊 Preparing event broadcast:');
    console.log(`   👥 Audience ID: ${AUDIENCE_ID}`);
    console.log(`   📧 From: ${this.fromEmail}`);
    console.log(`   📝 Subject: ${subject}`);
    console.log(`   🎯 Event: ${banner.title}`);

    // Try broadcasts API first, fallback to individual emails
    try {
      console.log('📡 Attempting to use Resend Broadcasts API...');
      
      // Check if broadcasts API is available
      if ('broadcasts' in this.resend && typeof (this.resend as any).broadcasts?.create === 'function') {
        const { data: broadcast, error: createError } = await (this.resend as any).broadcasts.create({
          audienceId: AUDIENCE_ID,
          from: this.fromEmail,
          subject: subject,
          html: htmlContent,
          name: `Event Announcement - ${banner.title} - ${new Date().toISOString().split('T')[0]}`
        });

        if (createError) {
          throw new Error(`Failed to create broadcast: ${createError.message}`);
        }

        console.log(`✅ Created broadcast with ID: ${broadcast.id}`);

        // Send the broadcast
        console.log('🚀 Sending broadcast...');
        const { error: sendError } = await (this.resend as any).broadcasts.send({ 
          id: broadcast.id 
        });

        if (sendError) {
          throw new Error(`Failed to send broadcast: ${sendError.message}`);
        }

        console.log(`✅ Broadcast sent successfully via Broadcasts API!`);
        console.log(`📊 Final broadcast details:`);
        console.log(`   📧 Subject: ${subject}`);
        console.log(`   🎯 Event: ${banner.title}`);
        console.log(`   👥 Audience ID: ${AUDIENCE_ID}`);
        console.log(`   🆔 Broadcast ID: ${broadcast.id}`);
        return;
      }
    } catch (error) {
      console.log(`⚠️  Broadcasts API not available, falling back to individual emails`);
    }

    // Fallback: Send individual emails
    console.log('📡 Sending event announcement via individual emails...');
    
    try {
      // Get all contacts in the audience
      const emails = await this.getAudienceContacts();

      if (emails.length === 0) {
        console.log('ℹ️  No contacts found in audience');
        return;
      }

      console.log(`🚀 Sending emails to ${emails.length} subscribers...`);
      console.log(`📧 Using from address: ${this.fromEmail}`);
      
      // Check if using test email address
      if (this.fromEmail === 'onboarding@resend.dev') {
        console.warn('⚠️  WARNING: Using test email address (onboarding@resend.dev)');
        console.warn('⚠️  This will only send to your own email address.');
        console.warn('⚠️  To send to all subscribers, verify a domain at resend.com/domains');
        console.warn('⚠️  and update RESEND_DEFAULT_FROM_EMAIL in your .env file');
        console.warn('⚠️  Example: RESEND_DEFAULT_FROM_EMAIL=noreply@religousphilosophy.com\n');
      }

      let successCount = 0;
      let errorCount = 0;

      // Send individual emails with delay to respect rate limits
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        
        try {
          const { error: emailError } = await this.resend.emails.send({
            from: this.fromEmail,
            to: email,
            subject: subject,
            html: htmlContent
          });

          if (emailError) {
            console.log(`❌ Failed to send to ${email}: ${emailError.message}`);
            errorCount++;
          } else {
            console.log(`✅ Sent to ${email}`);
            successCount++;
          }
        } catch (error) {
          console.log(`❌ Error sending to ${email}: ${(error as Error).message}`);
          errorCount++;
        }

        // Add delay to avoid rate limits (max 2 requests/second)
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay
        }
      }

      console.log(`\n📊 Email sending completed!`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${errorCount}`);
      console.log(`📊 Final campaign details:`);
      console.log(`   📧 Subject: ${subject}`);
      console.log(`   🎯 Event: ${banner.title}`);
      console.log(`   👥 Audience ID: ${AUDIENCE_ID}`);
      console.log(`   📊 Delivery rate: ${successCount}/${emails.length}`);

    } catch (error) {
      console.error('❌ Error sending broadcast:', error);
      throw error;
    }
  }

  /**
   * Cleanup (no database connection to close)
   */
  cleanup() {
    // No cleanup needed when using Strapi API
  }

  /**
   * Main execution function
   */
  async run(): Promise<void> {
    try {
      console.log('🚀 Starting event broadcast process...\n');

      // Fetch active banner
      const banner = await this.fetchActiveBanner();

      if (!banner) {
        console.log('ℹ️  No active banner found. Cannot send event broadcast.');
        console.log('💡 Tip: Create and activate a banner in Strapi to announce an event.');
        return;
      }

      // Create and send broadcast
      await this.createAndSendBroadcast(banner);

      console.log('\n🎉 Event broadcast process completed successfully!');

    } catch (error) {
      console.error('\n❌ Event broadcast process failed:', error);
      process.exit(1);
    } finally {
      this.cleanup();
    }
  }
}

// Main execution
async function main() {
  const sender = new EventBroadcastSender();
  await sender.run();
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

export default EventBroadcastSender;
