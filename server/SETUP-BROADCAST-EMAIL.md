# Setup Broadcast Email - Production Mode

## Issue
The broadcast script is currently using `onboarding@resend.dev` which is a test email address that can only send to your own email (`yotamfromm123@gmail.com`).

To send to all subscribers, you need to verify your domain with Resend.

## Steps to Fix

### 1. Verify Your Domain in Resend

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain: `religousphilosophy.com`
4. Follow the instructions to add DNS records (TXT, MX, etc.)
5. Wait for verification (usually takes a few minutes to a few hours)

### 2. Update Environment Variable

Once your domain is verified, update your `.env` file:

```bash
# Change from:
RESEND_DEFAULT_FROM_EMAIL=onboarding@resend.dev

# To:
RESEND_DEFAULT_FROM_EMAIL=noreply@religousphilosophy.com
# Or any other email using your verified domain like:
# newsletter@religousphilosophy.com
# updates@religousphilosophy.com
```

### 3. Run the Broadcast

After updating the `.env` file, run the broadcast script again:

```bash
cd server
pnpm tsx scripts/send-broadcast.ts
```

## Alternative: Use Resend Broadcasts API

If you have access to the Resend Broadcasts API (requires a paid plan), the script will automatically use it instead of sending individual emails. This is more efficient and faster.

## Notes

- The script already generates the email HTML only once (not per recipient)
- The script includes rate limiting (600ms delay between emails) to respect Resend's limits
- The script will show warnings if you're still using the test email address

