/**
 * Resend Audience Management Service
 * 
 * This service manages adding and removing contacts from Resend audiences
 * for newsletter subscription management.
 */

import { Resend } from 'resend';

interface Contact {
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
}

interface AudienceServiceConfig {
  apiKey: string;
  defaultAudienceId?: string;
}

class ResendAudienceService {
  private resend: Resend;
  private defaultAudienceId?: string;

  constructor(config: AudienceServiceConfig) {
    this.resend = new Resend(config.apiKey);
    this.defaultAudienceId = config.defaultAudienceId;
  }

  /**
   * Add a contact to an audience
   */
  async addContact(email: string, audienceId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const targetAudienceId = audienceId || this.defaultAudienceId;
      
      if (!targetAudienceId) {
        throw new Error('No audience ID provided and no default audience configured');
      }

      console.log(`📧 Adding contact ${email} to audience ${targetAudienceId}`);

      const { data, error } = await this.resend.contacts.create({
        email: email,
        unsubscribed: false,
        audienceId: targetAudienceId
      });

      if (error) {
        // Handle duplicate contact gracefully
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`ℹ️  Contact ${email} already exists in audience`);
          return { success: true };
        }
        throw new Error(error.message);
      }

      console.log(`✅ Successfully added contact ${email} to audience`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Error adding contact ${email} to audience:`, error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Remove a contact from an audience
   */
  async removeContact(email: string, audienceId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const targetAudienceId = audienceId || this.defaultAudienceId;
      
      if (!targetAudienceId) {
        throw new Error('No audience ID provided and no default audience configured');
      }

      console.log(`📧 Removing contact ${email} from audience ${targetAudienceId}`);

      // First, find the contact in the audience
      const { data: contacts, error: listError } = await this.resend.contacts.list({
        audienceId: targetAudienceId
      });

      if (listError) {
        throw new Error(listError.message);
      }

      // Find the contact by email
      const contact = contacts?.data?.find(c => c.email === email);
      
      if (!contact) {
        console.log(`ℹ️  Contact ${email} not found in audience`);
        return { success: true }; // Not an error if already removed
      }

      // Remove the contact
      const { error: removeError } = await this.resend.contacts.remove({
        email: email,
        audienceId: targetAudienceId
      });

      if (removeError) {
        throw new Error(removeError.message);
      }

      console.log(`✅ Successfully removed contact ${email} from audience`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Error removing contact ${email} from audience:`, error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get contact status in audience
   */
  async getContactStatus(email: string, audienceId?: string): Promise<{ 
    exists: boolean; 
    unsubscribed?: boolean; 
    error?: string 
  }> {
    try {
      const targetAudienceId = audienceId || this.defaultAudienceId;
      
      if (!targetAudienceId) {
        throw new Error('No audience ID provided and no default audience configured');
      }

      const { data: contacts, error } = await this.resend.contacts.list({
        audienceId: targetAudienceId
      });

      if (error) {
        throw new Error(error.message);
      }

      const contact = contacts?.data?.find(c => c.email === email);
      
      return {
        exists: !!contact,
        unsubscribed: contact?.unsubscribed || false
      };

    } catch (error) {
      console.error(`❌ Error checking contact ${email} status:`, error.message);
      return { 
        exists: false, 
        error: error.message 
      };
    }
  }

  /**
   * Bulk add contacts to audience
   */
  async addContacts(emails: string[], audienceId?: string): Promise<{ 
    success: boolean; 
    successCount: number;
    errors: string[];
  }> {
    const targetAudienceId = audienceId || this.defaultAudienceId;
    
    if (!targetAudienceId) {
      return {
        success: false,
        successCount: 0,
        errors: ['No audience ID provided and no default audience configured']
      };
    }

    console.log(`📧 Adding ${emails.length} contacts to audience ${targetAudienceId}`);

    const results = {
      success: true,
      successCount: 0,
      errors: [] as string[]
    };

    // Process in batches to avoid rate limits
    const batchSize = 100;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const contacts = batch.map(email => ({ email, unsubscribed: false }));

      try {
        // Process contacts individually since bulk create might not be supported
        for (const contact of contacts) {
          try {
            const { error: contactError } = await this.resend.contacts.create({
              email: contact.email,
              unsubscribed: contact.unsubscribed,
              audienceId: targetAudienceId
            });
            
            if (contactError && !contactError.message?.includes('already exists')) {
              results.errors.push(`Contact ${contact.email}: ${contactError.message}`);
              results.success = false;
            } else {
              results.successCount++;
            }
          } catch (error) {
            results.errors.push(`Contact ${contact.email}: ${error.message}`);
            results.success = false;
          }
        }

        console.log(`✅ Processed batch ${i / batchSize + 1} (${contacts.length} contacts)`);
      } catch (error) {
        results.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
        results.success = false;
      }
    }

    console.log(`📊 Bulk add completed: ${results.successCount}/${emails.length} successful`);
    return results;
  }

  /**
   * Set default audience ID
   */
  setDefaultAudience(audienceId: string): void {
    this.defaultAudienceId = audienceId;
  }

  /**
   * Get default audience ID
   */
  getDefaultAudience(): string | undefined {
    return this.defaultAudienceId;
  }
}

// Create and export singleton instance
const resendAudienceService = new ResendAudienceService({
  apiKey: process.env.RESEND_API_KEY || '',
  defaultAudienceId: process.env.RESEND_DEFAULT_AUDIENCE_ID
});

export default resendAudienceService;
export { ResendAudienceService };
export type { Contact, AudienceServiceConfig };
