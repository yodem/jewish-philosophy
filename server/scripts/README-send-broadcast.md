# Send Broadcast Script

A simplified script to send weekly content broadcasts to an existing Resend audience.

## 🚀 Quick Start

### 1. Create Audience in Resend Dashboard
1. Log into your [Resend dashboard](https://resend.com/audiences)
2. Create a new audience 
3. Add your newsletter subscribers manually or via CSV upload
4. Copy the audience ID (format: `aud_12345678-1234-1234-1234-123456789012`)

### 2. Send Broadcast
From the server directory, run:

```bash
cd server
pnpm send-broadcast <your-audience-id>
```

**Example:**
```bash
pnpm send-broadcast aud_12345678-1234-1234-1234-123456789012
```

## 📧 What Gets Sent

The script automatically:
- ✅ Fetches content published in the last 7 days
- ✅ Generates a beautiful Hebrew/RTL email template
- ✅ Creates and sends a broadcast via Resend API
- ✅ Includes proper unsubscribe links
- ✅ Provides detailed logging and error handling

### Content Types Included:
- 📝 **Blogs** - Articles and blog posts
- ✍️ **Writings** - Essays and written works  
- 🎥 **Videos** - Video content and lessons
- 📖 **Terms** - Glossary terms and definitions
- 💬 **Responsas** - Questions and answers

## 🔧 Configuration

Your environment variables are already set up in `/server/.env`:

```bash
RESEND_API_KEY=re_Wz9XnTMt_DmiDvAiqcQmN6j49dHncgKHb  ✅ Already configured
RESEND_DEFAULT_FROM_EMAIL=onboarding@resend.dev
FRONTEND_URL=https://religousphilosophy.com/
```

## 📊 Sample Output

```bash
🚀 Starting broadcast sending process...

👥 Using audience ID: aud_12345678-1234-1234-1234-123456789012

🚀 Initializing Strapi...
✅ Strapi initialized

📚 Fetching content from the last week...
✅ Found 12 new content items this week:
   📝 Blogs: 4
   ✍️ Writings: 2  
   🎥 Videos: 3
   📖 Terms: 2
   💬 Responsas: 1

📡 Creating and sending broadcast...
🔄 Creating broadcast...
✅ Created broadcast with ID: bcast_xyz789
🔄 Sending broadcast...
✅ Broadcast sent successfully!

📊 Final broadcast details:
   📧 Subject: 📰 עדכון שבועי: 12 תכנים חדשים באתר פילוסופיה יהודית
   📈 Content items: 12
   👥 Audience ID: aud_12345678-1234-1234-1234-123456789012
   🆔 Broadcast ID: bcast_xyz789

🎉 Broadcast sending process completed successfully!
```

## ⚠️ Error Handling

### Common Issues:

#### 1. Invalid Audience ID
```bash
❌ Error: Invalid audience ID format
Audience ID should start with "aud_" and be in the format: aud_12345678-1234-1234-1234-123456789012
```
**Solution:** Use the correct audience ID from your Resend dashboard.

#### 2. Missing Audience ID
```bash
❌ Error: Audience ID is required
Usage: pnpm ts-node scripts/send-broadcast.ts <audience-id>
```
**Solution:** Provide the audience ID as a parameter.

#### 3. API Key Issues
```bash
❌ Error: RESEND_API_KEY environment variable is required
```
**Solution:** Your API key is already configured in `.env` file.

## 🎯 Next Steps

1. **Create your audience** in the Resend dashboard
2. **Test with a small audience** first
3. **Run the script** with your audience ID
4. **Monitor results** in your Resend dashboard
5. **Set up automation** (optional) using cron jobs

## 🔄 Automation (Optional)

To automate weekly broadcasts, you can create a cron job:

```bash
# Run every Sunday at 9:00 AM
0 9 * * 0 cd /path/to/your/project/server && pnpm send-broadcast aud_your-audience-id
```

---

*Ready to send your first broadcast? Just create an audience in Resend and run the script!*
