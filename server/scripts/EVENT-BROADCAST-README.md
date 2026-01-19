# Event Broadcast Script

## Overview

The `send-event-broadcast.ts` script sends event/meeting announcements to your email subscribers based on the active banner in Strapi. This is perfect for announcing virtual meetings, webinars, live sessions, or any special events.

## How It Works

1. **Fetches Active Banner**: The script retrieves the banner from Strapi (single type)
2. **Checks if Active**: Only sends if the banner's `isActive` field is `true`
3. **Extracts Event Info**: Uses the banner fields:
   - `title` - Event name/title
   - `description` - Event details and description
   - `link` - Registration/join link (optional)
   - `date` - Event date and time (optional)
4. **Generates Email**: Creates a beautiful Hebrew/RTL email template
5. **Sends to Audience**: Sends to all subscribers in the Resend audience

## Usage

### Step 1: Set Up the Banner in Strapi

1. Go to Strapi admin panel
2. Navigate to **Content Manager** → **Banner** (Single Type)
3. Fill in the fields:
   - **Title**: Event name (e.g., "מפגש אונליין: פילוסופיה יהודית בעידן המודרני")
   - **Description**: Event details, what to expect, etc.
   - **Link**: Zoom/Google Meet/registration link (optional)
   - **Date**: Event date and time (optional but recommended)
   - **isActive**: Set to `true` to enable the broadcast
4. Save and publish

### Step 2: Run the Script

From the `/server` directory:

```bash
pnpm send-event-broadcast
```

Or using the full path:

```bash
cd server && pnpm send-event-broadcast
```

## Email Template Features

The generated email includes:

- 🎯 **Eye-catching header** with event announcement
- 📅 **Formatted date** in Hebrew locale (if provided)
- 📝 **Full event description** with proper formatting
- 🔗 **Join button** (if link is provided)
- 💡 **Benefits section** explaining why to attend
- ❤️ **Donation call-to-action**
- 🏠 **Link to website**
- ✉️ **Unsubscribe link** in footer

## Example Banner Content

### Example 1: Virtual Meeting

```
Title: מפגש אונליין: הפילוסופיה של הרמב"ם
Description: 
הצטרפו אלינו למפגש מרתק בו נדון בפילוסופיה של הרמב"ם ובהשפעתה על המחשבה היהודית.

במהלך המפגש:
• נעמיק בתפיסת הרמב"ם על קיום האל
• נדון במושג הנבואה ובמעמד משה רבנו
• נענה על שאלות מהקהל

המפגש מתאים לכל רמת ידע - גם למתחילים!
Link: https://zoom.us/j/123456789
Date: 2026-01-25T20:00:00.000Z
isActive: true
```

### Example 2: Webinar Series

```
Title: סדרת הרצאות: פילוסופיה יהודית בימינו
Description:
מוזמנים להצטרף לסדרת הרצאות בת 4 מפגשים על פילוסופיה יהודית ורלוונטיות שלה לעולם המודרני.

מפגש ראשון: "מה זו פילוסופיה יהודית?"
נדון ביסודות המחשבה הפילוסופית היהודית ובשאלות הגדולות שהיא מעלה.

ההרצאות יוקלטו ויישלחו למשתתפים.
Link: https://example.com/register
Date: 2026-02-01T19:30:00.000Z
isActive: true
```

## Environment Variables Required

Make sure these are set in your `/server/.env` file:

```env
RESEND_API_KEY=re_xxxxx
RESEND_DEFAULT_FROM_EMAIL=noreply@yourdomain.com
STRAPI_BASE_URL=https://your-strapi-url.com
STRAPI_API_TOKEN=your_token_here
FRONTEND_URL=https://religousphilosophy.com/
```

## Audience

- **Audience ID**: `e5d7ecb0-d089-49a1-908e-6423de637cf9` (hardcoded)
- The script sends to all contacts in this Resend audience
- Contacts can be managed via the `sync-audience` script

## Testing

Before sending to all subscribers:

1. **Test with inactive banner**: Set `isActive: false` to verify the script detects it
2. **Test with test email**: Use `onboarding@resend.dev` as `RESEND_DEFAULT_FROM_EMAIL` to send only to yourself
3. **Verify banner data**: Run the script and check the console output to ensure data is fetched correctly

## Troubleshooting

### "No active banner found"
- Check that the banner exists in Strapi
- Verify `isActive` is set to `true`
- Ensure the banner is published (not draft)

### "Failed to fetch banner"
- Verify `STRAPI_BASE_URL` is correct
- Check that `STRAPI_API_TOKEN` has read permissions for banner
- Ensure banner content type is accessible via API

### Emails not sending
- Verify `RESEND_API_KEY` is valid
- Check that you have a verified domain in Resend
- Ensure `RESEND_DEFAULT_FROM_EMAIL` uses your verified domain

## Related Scripts

- `send-broadcast.ts` - Monthly content digest (blogs, videos, etc.)
- `sync-audience.ts` - Sync newsletter signups to Resend audience

## Notes

- The script uses the same audience as the monthly broadcast
- Hebrew/RTL formatting is built-in
- Rate limiting is handled automatically (600ms delay between emails)
- The script will use Resend Broadcasts API if available, otherwise falls back to individual emails
