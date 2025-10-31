/**
 * Send Broadcast Script
 * 
 * Sends monthly content broadcast to the Resend audience
 * Shows the 5 most recent items from each content type with a "View more" button
 * Audience ID: e5d7ecb0-d089-49a1-908e-6423de637cf9
 * 
 * Usage: pnpm send-broadcast
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Fixed audience ID
const AUDIENCE_ID = 'e5d7ecb0-d089-49a1-908e-6423de637cf9';

// Types for our content
interface ContentItem {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  playlistSlug?: string; // For videos - playlist slug needed for URL construction
}

interface WeeklyContent {
  blogs: ContentItem[];
  writings: ContentItem[];
  videos: ContentItem[]; // Videos have playlistSlug property
  terms: ContentItem[];
  responsas: ContentItem[];
}

class BroadcastSender {
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
    this.siteUrl = process.env.FRONTEND_URL || 'https://jewish-philosophy.vercel.app';
    this.strapiUrl = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
    this.strapiApiToken = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  }

  /**
   * Fetch content from Strapi API for the last month
   */
  async fetchWeeklyContent(): Promise<WeeklyContent> {
    console.log('📚 Fetching content from Strapi API for the last month...');
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthAgoISO = oneMonthAgo.toISOString();

    const content: WeeklyContent = {
      blogs: [],
      writings: [],
      videos: [],
      terms: [],
      responsas: []
    };

    try {
      // Helper function to fetch from Strapi API
      const fetchFromStrapi = async (endpoint: string, populate?: string): Promise<ContentItem[]> => {
        const populateParam = populate ? `&populate=${populate}` : '';
        const url = `${this.strapiUrl}/api/${endpoint}?filters[createdAt][$gte]=${monthAgoISO}&sort=createdAt:desc&fields[0]=title&fields[1]=slug&fields[2]=createdAt${populateParam}`;
        
        console.log(`🔍 Fetching ${endpoint} from: ${url}`);
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (this.strapiApiToken) {
          headers['Authorization'] = `Bearer ${this.strapiApiToken}`;
        }
        
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        
        const data = await response.json() as { data?: any[] };
        return data.data?.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          createdAt: item.createdAt,
          playlistSlug: item.playlist?.slug || item.playlists?.[0]?.slug // Get playlist slug for videos
        })) || [];
      };

      // Fetch all content types in parallel
      // Videos need playlist relationship populated to get playlist slug
      const [blogs, writings, videos, terms, responsas] = await Promise.all([
        fetchFromStrapi('blogs'),
        fetchFromStrapi('writings'), 
        fetchFromStrapi('videos', 'playlists'),
        fetchFromStrapi('terms'),
        fetchFromStrapi('responsas')
      ]);

      content.blogs = blogs;
      content.writings = writings;
      content.videos = videos;
      content.terms = terms;
      content.responsas = responsas;

      const totalItems = content.blogs.length + content.writings.length + 
                        content.videos.length + content.terms.length + content.responsas.length;

      console.log(`✅ Found ${totalItems} new content items this month:`);
      console.log(`   📝 Blogs: ${content.blogs.length}`);
      console.log(`   ✍️  Writings: ${content.writings.length}`);
      console.log(`   🎥 Videos: ${content.videos.length}`);
      console.log(`   📖 Terms: ${content.terms.length}`);
      console.log(`   💬 Responsas: ${content.responsas.length}`);

      return content;
    } catch (error) {
      console.error('❌ Error fetching monthly content from Strapi:', error);
      throw error;
    }
  }

  /**
   * Generate Hebrew/RTL email template for weekly content
   */
  generateEmailTemplate(content: WeeklyContent): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const generateContentSection = (items: ContentItem[], title: string, emoji: string, urlPath: string) => {
      if (items.length === 0) return '';
      
      // Show only the first 5 items
      const displayedItems = items.slice(0, 5);
      const remainingCount = items.length - displayedItems.length;
      
      // Helper function to generate URL - videos need playlist slug
      const getItemUrl = (item: ContentItem) => {
        if (urlPath === 'playlists' && item.playlistSlug) {
          // Videos: /playlists/[playlistSlug]/[videoSlug]
          return `${this.siteUrl}/${urlPath}/${item.playlistSlug}/${item.slug}`;
        }
        // Other content types: /[urlPath]/[slug]
        return `${this.siteUrl}/${urlPath}/${item.slug}`;
      };
      
      return `
        <div style="margin: 30px 0;">
          <h3 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 8px;">
            ${emoji} ${title} (${items.length})
          </h3>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px;">
            ${displayedItems.map(item => `
              <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                <a href="${getItemUrl(item)}" 
                   style="color: #667eea; text-decoration: none; font-weight: bold; font-size: 16px;">
                  ${item.title}
                </a>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                  נוצר: ${formatDate(item.createdAt)}
                </p>
              </div>
            `).join('')}
            ${remainingCount > 0 ? `
              <div style="margin-top: 20px; text-align: center;">
                <a href="${this.siteUrl}/${urlPath}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 12px 30px; 
                          border-radius: 25px; 
                          font-weight: bold;
                          font-size: 15px;
                          display: inline-block;
                          box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);">
                  צפו בעוד ${remainingCount}
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    };

    const totalItems = content.blogs.length + content.writings.length + 
                      content.videos.length + content.terms.length + content.responsas.length;

    if (totalItems === 0) {
      return `
        <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">📰 העדכון החודשי</h1>
            <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">פילוסופיה יהודית</p>
          </div>
          
          <!-- Content -->
          <div style="background: white; padding: 40px 30px; text-align: center;">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">🌟 חודש שקט</h2>
            <p style="font-size: 16px; line-height: 1.8; color: #555;">
              החודש לא פורסמו תכנים חדשים באתר. אנחנו עובדים על תכנים מרתקים לחודש הבא!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.siteUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 35px; 
                        border-radius: 30px; 
                        font-weight: bold;
                        font-size: 16px;
                        display: inline-block;">
                🏠 בקר באתר
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f1f3f4; padding: 25px; text-align: center;">
            <p style="margin: 0; color: #888; font-size: 12px;">
              <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #667eea; text-decoration: none;">
                ביטול מנוי
              </a>
            </p>
          </div>
        </div>
      `;
    }

    return `
      <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">📰 העדכון החודשי</h1>
          <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">פילוסופיה יהודית</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 40px 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 24px; text-align: center;">
            🌟 תכנים חדשים החודש (${totalItems})
          </h2>
          
          <p style="font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 25px; text-align: center;">
            החודש פורסמו ${totalItems} תכנים חדשים באתר שלנו. הנה מה שחדש:
          </p>
          
          ${generateContentSection(content.blogs, 'מאמרים ובלוגים', '📝', 'blog')}
          ${generateContentSection(content.writings, 'כתבים', '✍️', 'writings')}
          ${generateContentSection(content.videos, 'וידאו ושיעורים', '🎥', 'playlists')}
          ${generateContentSection(content.terms, 'מונחים ומושגים', '📖', 'terms')}
          ${generateContentSection(content.responsas, 'שאלות ותשובות', '💬', 'responsa')}
          
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
              🏠 בקר באתר לתכנים נוספים
            </a>
          </div>
          
          <p style="color: #666; font-size: 16px; text-align: center; margin-top: 40px; line-height: 1.6;">
            תודה שאתם חלק מהקהילה שלנו!<br>
            <strong style="color: #667eea;">צוות פילוסופיה יהודית</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f1f3f4; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">
            ניוזלטר חודשי - עדכונים על תכנים חדשים באתר
          </p>
          <p style="margin: 0; color: #888; font-size: 12px;">
            <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #667eea; text-decoration: none;">
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
   * Create and send broadcast using available API methods
   */
  async createAndSendBroadcast(content: WeeklyContent): Promise<void> {
    const totalItems = content.blogs.length + content.writings.length + 
                      content.videos.length + content.terms.length + content.responsas.length;

    const subject = totalItems > 0 
      ? `📰 עדכון חודשי: ${totalItems} תכנים חדשים באתר פילוסופיה יהודית`
      : `📰 עדכון חודשי מפילוסופיה יהודית`;

    const htmlContent = this.generateEmailTemplate(content);

    console.log('📊 Preparing broadcast:');
    console.log(`   👥 Audience ID: ${AUDIENCE_ID}`);
    console.log(`   📧 From: ${this.fromEmail}`);
    console.log(`   📝 Subject: ${subject}`);
    console.log(`   📈 Content items: ${totalItems}`);

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
          name: `Weekly Content Digest - ${new Date().toISOString().split('T')[0]}`
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
        console.log(`   📈 Content items: ${totalItems}`);
        console.log(`   👥 Audience ID: ${AUDIENCE_ID}`);
        console.log(`   🆔 Broadcast ID: ${broadcast.id}`);
        return;
      }
    } catch (error) {
      console.log(`⚠️  Broadcasts API not available, falling back to individual emails`);
    }

    // Fallback: Send individual emails
    console.log('📡 Sending content digest via individual emails...');
    
    try {
      // Get all contacts in the audience
      const emails = await this.getAudienceContacts();

      if (emails.length === 0) {
        console.log('ℹ️  No contacts found in audience');
        return;
      }

      console.log(`🚀 Sending emails to ${emails.length} subscribers...`);

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
          console.log(`❌ Error sending to ${email}: ${error.message}`);
          errorCount++;
        }

        // Add delay to avoid rate limits (max 2 requests/second)
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay
        }
      }

      console.log(`📊 Email sending completed!`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${errorCount}`);
      console.log(`📊 Final campaign details:`);
      console.log(`   📧 Subject: ${subject}`);
      console.log(`   📈 Content items: ${totalItems}`);
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
      console.log('🚀 Starting monthly broadcast process...\n');

      // Fetch weekly content
      const content = await this.fetchWeeklyContent();

      // Create and send broadcast
      await this.createAndSendBroadcast(content);

      console.log('\n🎉 Monthly broadcast process completed successfully!');

    } catch (error) {
      console.error('\n❌ Monthly broadcast process failed:', error);
      process.exit(1);
    } finally {
      this.cleanup();
    }
  }
}

// Main execution
async function main() {
  const sender = new BroadcastSender();
  await sender.run();
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

export default BroadcastSender;