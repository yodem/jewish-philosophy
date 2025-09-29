# Audience Integration Documentation

This system automatically syncs newsletter subscribers between your Strapi database and Resend audiences for seamless broadcast management.

## 🚀 **How It Works**

### **Automatic Sync on Subscribe/Unsubscribe**
- ✅ **Subscribe**: When someone subscribes via your website, they're automatically added to your Resend audience
- ✅ **Unsubscribe**: When someone unsubscribes, they're automatically removed from your Resend audience
- ✅ **Non-blocking**: Resend operations don't interfere with the user experience if they fail

### **Manual Sync for Existing Subscribers**
- 📤 **Bulk Import**: Sync all existing Strapi subscribers to a Resend audience
- 🔍 **Verification**: Check sync results to ensure data integrity

## 📋 **Setup Instructions**

### 1. **Create Audience in Resend**
1. Go to [Resend Audiences](https://resend.com/audiences)
2. Create a new audience for your newsletter
3. Copy the audience ID (format: `aud_12345678-1234-1234-1234-123456789012`)

### 2. **Configure Environment**
Add your audience ID to `/server/.env`:

```bash
# Set this to your Resend audience ID
RESEND_DEFAULT_AUDIENCE_ID=aud_12345678-1234-1234-1234-123456789012
```

### 3. **Sync Existing Subscribers**
Run the sync script to migrate existing subscribers:

```bash
cd server
pnpm sync-audience aud_12345678-1234-1234-1234-123456789012
```

## 🔧 **Available Scripts**

### **Sync Existing Subscribers**
```bash
pnpm sync-audience <audience-id>
```
Migrates all existing newsletter subscribers from Strapi to Resend audience.

### **Send Broadcast**
```bash
pnpm send-broadcast <audience-id>
```
Sends weekly content digest to the audience.

## 📊 **What Happens During Integration**

### **On Newsletter Signup** (`POST /api/newsletter-signups`)
1. ✅ Email saved to Strapi database
2. 📧 Contact added to Resend audience (automatic)
3. 📬 Welcome email sent to subscriber
4. 📈 Analytics tracked

### **On Newsletter Unsubscribe** (`DELETE /api/newsletter-signups/unsubscribe`)
1. ❌ Email removed from Strapi database
2. 📧 Contact removed from Resend audience (automatic)
3. ✅ Success confirmation returned

### **Error Handling**
- 🛡️ **Non-critical failures**: Resend operations won't break the subscribe/unsubscribe flow
- 📝 **Comprehensive logging**: All operations are logged for monitoring
- 🔄 **Graceful degradation**: System works even if Resend is temporarily unavailable

## 🔍 **Monitoring & Verification**

### **Log Messages to Watch For**

#### **Successful Operations**
```bash
✅ Added user@example.com to Resend audience
✅ Removed user@example.com from Resend audience
```

#### **Warnings (Non-Critical)**
```bash
⚠️ Failed to add user@example.com to Resend audience: Contact already exists
⚠️ Failed to remove user@example.com from Resend audience: Contact not found
```

#### **Errors (Logged but Non-Blocking)**
```bash
Resend audience error (non-critical): API key invalid
Resend audience removal error (non-critical): Network timeout
```

### **Verification Commands**

Check if the integration is working by looking at your server logs when users subscribe/unsubscribe.

## 🎯 **Configuration Options**

### **Environment Variables**
```bash
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional - Default audience for auto-sync
RESEND_DEFAULT_AUDIENCE_ID=aud_your_audience_id_here

# Email settings
RESEND_DEFAULT_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://your-site.com
```

### **Service Configuration**
The Resend service can be configured programmatically:

```typescript
import resendAudienceService from '../src/services/resend-audience';

// Set default audience
resendAudienceService.setDefaultAudience('aud_your_audience_id');

// Check current default
const currentAudience = resendAudienceService.getDefaultAudience();
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### 1. **"No audience ID provided"**
**Solution**: Set `RESEND_DEFAULT_AUDIENCE_ID` in your `.env` file.

#### 2. **"Contact already exists"**
**Info**: This is normal and expected - the system handles duplicates gracefully.

#### 3. **"API key invalid"**
**Solution**: Verify your `RESEND_API_KEY` in the `.env` file.

#### 4. **Sync script fails**
**Solutions**:
- Check your audience ID format (`aud_` prefix)
- Verify API key permissions
- Ensure Strapi database is accessible

### **Testing the Integration**

1. **Test Subscribe Flow**:
   - Subscribe via your website
   - Check server logs for success messages
   - Verify contact appears in Resend dashboard

2. **Test Unsubscribe Flow**:
   - Unsubscribe via your unsubscribe page
   - Check server logs for removal messages
   - Verify contact is removed from Resend dashboard

3. **Test Broadcast**:
   - Run the send-broadcast script
   - Check broadcast appears in Resend dashboard
   - Verify emails are received by test subscribers

## 🔄 **Migration Workflow**

If you're setting up this integration on an existing site:

1. **Backup**: Export your current newsletter subscribers
2. **Create Audience**: Set up your Resend audience
3. **Configure**: Add audience ID to environment variables
4. **Sync**: Run the sync script to migrate existing subscribers
5. **Test**: Verify the integration with test subscriptions
6. **Monitor**: Watch logs to ensure everything works smoothly

## 💡 **Best Practices**

### **Audience Management**
- 🎯 **Single Audience**: Use one main audience for your newsletter
- 🏷️ **Clear Naming**: Name your audience clearly (e.g., "Main Newsletter")
- 📊 **Regular Monitoring**: Check Resend dashboard periodically

### **Data Consistency**
- 🔄 **Regular Syncs**: Run sync script periodically if needed
- 📝 **Log Monitoring**: Watch for Resend errors in your logs
- 🧪 **Testing**: Test subscribe/unsubscribe flows regularly

### **Performance**
- ⚡ **Non-Blocking**: Resend operations don't slow down user experience
- 📦 **Batch Operations**: Sync script uses efficient batch processing
- 🛡️ **Error Resilience**: System works even if Resend is down

## 🤝 **Support**

For issues with the audience integration:

1. **Check server logs** for detailed error messages
2. **Verify configuration** in `.env` file
3. **Test with small audience** first
4. **Check Resend dashboard** for API usage and errors

---

*Your newsletter subscribers are now automatically synced between Strapi and Resend! 🎉*
