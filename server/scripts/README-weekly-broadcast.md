# Weekly Content Broadcast Script

This script creates weekly content digest broadcasts using the Resend API, sending updates about new content (blogs, writings, videos, terms, and responsas) to newsletter subscribers.

## 🚀 Features

- **📧 Automatic Email Collection**: Fetches all newsletter signup emails from Strapi
- **👥 Audience Management**: Creates and manages Resend audiences automatically
- **📚 Content Aggregation**: Collects new content from the last 7 days across all content types
- **🇮🇱 Hebrew/RTL Support**: Beautiful Hebrew email templates with proper RTL layout
- **📊 Detailed Reporting**: Comprehensive logging and statistics
- **🎯 Smart Templates**: Dynamic email content based on available content

## 📋 Prerequisites

### Environment Variables
Ensure these environment variables are set in your `/server/.env` file:

```bash
# Required
RESEND_API_KEY=your_resend_api_key_here

# Optional (will use defaults if not provided)
RESEND_DEFAULT_FROM_EMAIL=noreply@yourdomain.com
RESEND_DEFAULT_REPLY_TO_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

### Dependencies
The script requires the following npm packages:
- `resend` - For Resend API integration
- `@strapi/strapi` - For Strapi database access

Install dependencies:
```bash
cd server
pnpm install
```

## 🔧 Usage

### Basic Usage
Run the script from the server directory:

```bash
cd server
pnpm ts-node scripts/weekly-broadcast.ts
```

### Programmatic Usage
You can also import and use the service in your own scripts:

```typescript
import WeeklyBroadcastService from './scripts/weekly-broadcast';

const service = new WeeklyBroadcastService();
await service.run();
```

### Scheduled Execution
You can set up automated weekly broadcasts using cron jobs or your deployment platform's scheduler.

#### Using cron (Linux/Mac):
```bash
# Add to crontab (runs every Sunday at 9:00 AM)
0 9 * * 0 cd /path/to/your/project/server && pnpm ts-node scripts/weekly-broadcast.ts
```

#### Using GitHub Actions:
```yaml
name: Weekly Newsletter
on:
  schedule:
    - cron: '0 9 * * 0'  # Sunday at 9:00 AM UTC
jobs:
  send-newsletter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd server && pnpm install
      - name: Send newsletter
        run: cd server && pnpm ts-node scripts/weekly-broadcast.ts
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

## 📊 What Gets Included

The script automatically includes content published in the last 7 days from:

### Content Types
- **📝 Blogs**: Articles and blog posts
- **✍️ Writings**: Essays and written works  
- **🎥 Videos**: Video content and lessons
- **📖 Terms**: Glossary terms and definitions
- **💬 Responsas**: Questions and answers

### Email Content Structure
- **Header**: Branded header with site name
- **Summary**: Total count of new content items
- **Content Sections**: Organized by content type with:
  - Item titles (linked to full content)
  - Publication dates
  - Content type icons
- **Call-to-Action**: Link to visit the main site
- **Footer**: Unsubscribe link and branding

## 🎨 Email Template Features

### Hebrew/RTL Support
- **Direction**: Proper RTL text direction
- **Typography**: Hebrew-friendly fonts
- **Layout**: RTL-optimized email layout
- **Dates**: Hebrew date formatting

### Responsive Design
- **Mobile-friendly**: Optimized for mobile devices
- **Cross-client**: Works across major email clients
- **Accessibility**: Proper semantic HTML structure

### Dynamic Content
- **Conditional Sections**: Only shows content types that have new items
- **Empty State**: Special template when no new content is available
- **Smart Formatting**: Automatic date formatting and content organization

## 🔍 Logging and Monitoring

The script provides detailed logging for monitoring and debugging:

```
🚀 Starting weekly broadcast process...

📧 Fetching newsletter signup emails...
✅ Found 1,234 newsletter subscribers

👥 Creating/updating Resend audience...
✅ Created audience with ID: aud_xxx
✅ Added 100 contacts to audience (batch 1)
✅ Added 100 contacts to audience (batch 2)
...

📚 Fetching content from the last week...
✅ Found 15 new content items this week:
   📝 Blogs: 5
   ✍️  Writings: 3  
   🎥 Videos: 4
   📖 Terms: 2
   💬 Responsas: 1

📡 Creating and sending broadcast...
✅ Created broadcast with ID: bcast_xxx
✅ Broadcast sent successfully!

📊 Broadcast details:
   📧 Subject: 📰 עדכון שבועי: 15 תכנים חדשים באתר פילוסופיה יהודית
   📈 Content items: 15
   👥 Audience ID: aud_xxx

🎉 Weekly broadcast process completed successfully!
```

## ⚠️ Error Handling

The script includes comprehensive error handling:

- **Validation**: Checks for required environment variables
- **API Errors**: Handles Resend API errors gracefully
- **Database Errors**: Manages Strapi connection issues
- **Batch Processing**: Continues if individual batches fail
- **Cleanup**: Properly destroys Strapi connection on exit

## 🔧 Customization

### Email Template
To customize the email template, modify the `generateEmailTemplate()` method in the script:

```typescript
generateEmailTemplate(content: WeeklyContent): string {
  // Customize your template here
}
```

### Content Filtering
To change what content gets included, modify the date filter or add additional filters in `fetchWeeklyContent()`:

```typescript
filters: {
  publishedAt: {
    $gte: weekAgoISO  // Change this for different time ranges
  },
  // Add additional filters here
}
```

### Audience Management
To use a persistent audience instead of creating new ones each time, modify the `createOrUpdateAudience()` method.

## 🚨 Troubleshooting

### Common Issues

#### 1. "RESEND_API_KEY environment variable is required"
**Solution**: Add your Resend API key to the `.env` file:
```bash
RESEND_API_KEY=re_your_api_key_here
```

#### 2. "Failed to create audience"
**Solutions**: 
- Check your Resend API key permissions
- Verify your Resend account has audience creation permissions
- Check Resend API rate limits

#### 3. "No newsletter subscribers found"
**Solutions**:
- Verify there are published newsletter signups in Strapi
- Check the Strapi database connection
- Ensure the `newsletter-signup` content type exists

#### 4. Strapi connection errors
**Solutions**:
- Ensure Strapi is properly configured
- Check database connectivity
- Verify content type schemas exist

### Debug Mode
To enable more detailed logging, you can modify the script to include debug information:

```typescript
// Add this at the top of the script for more verbose logging
process.env.DEBUG = 'resend:*';
```

## 📈 Best Practices

### Frequency
- **Weekly**: Recommended for consistent engagement
- **Avoid Spam**: Don't send more than once per week
- **Timing**: Send during optimal engagement hours for your audience

### Content Quality
- **Minimum Content**: Consider not sending if fewer than 3 new items
- **Content Review**: Review content before automated sending
- **Testing**: Test with a small audience first

### Monitoring
- **Track Opens**: Monitor email open rates in Resend dashboard
- **Track Clicks**: Monitor link clicks to measure engagement
- **Unsubscribes**: Monitor unsubscribe rates and adjust frequency if needed

## 🤝 Contributing

To contribute improvements to this script:

1. **Test Changes**: Always test with a small audience first
2. **Documentation**: Update this README with any changes
3. **Error Handling**: Ensure robust error handling for new features
4. **Logging**: Add appropriate logging for debugging

## 📞 Support

For issues with this script:
1. Check the troubleshooting section above
2. Review the server logs for detailed error messages
3. Verify your Resend account settings and API key permissions
4. Test with a smaller subset of emails first

---

*This script is part of the Jewish Philosophy project's email marketing automation.*
