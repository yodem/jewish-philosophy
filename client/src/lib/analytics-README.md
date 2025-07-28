# Analytics Implementation

This documentation describes the comprehensive analytics tracking system implemented for the Jewish Philosophy application using Google Tag Manager (GTM) and Google Analytics (GA).

## Overview

The app tracks user interactions and engagement using both GTM and GA simultaneously to ensure comprehensive data collection and redundancy. All events are tracked using the `@next/third-parties/google` package.

## Analytics Setup

### Configuration
- **GTM ID**: `GTM-N78GTSCR`
- **GA ID**: `G-72NSRCMH08`
- Both are configured in `client/src/app/layout.tsx`

### Key Files
- `client/src/lib/analytics.ts` - Core analytics functions
- `client/src/hooks/use-analytics.ts` - Analytics hook for automatic page tracking
- `client/src/components/PlaylistViewTracker.tsx` - Client component for server-side playlist tracking
- `client/src/components/WritingTracker.tsx` - Client component for content view and engagement tracking

## Tracked Events

### 1. Search Events
**Event**: `search`
**Triggers**: When users perform searches
**Data Collected**:
- Search query
- Content type (blog, video, responsa, etc.)
- Category filter
- Results count

**Locations**:
- `SearchDialog.tsx` - Global search dialog
- `SearchResults.tsx` - Search results page

### 2. Video Events
**Events**: `video_view`, `video_play`
**Triggers**: 
- `video_view` - When video page loads
- `video_play` - When user interacts with video player
**Data Collected**:
- Video ID
- Video title
- Playlist title (if applicable)

**Locations**:
- `YoutubePlayer.tsx` - Now uses Next.js `YouTubeEmbed` component

### 3. Form Submission Events

#### Newsletter Signup
**Event**: `newsletter_signup`
**Triggers**: Successful newsletter subscription
**Data Collected**:
- Email domain (for privacy)

**Locations**:
- `blocks/Subscribe.tsx`

#### Question Submission
**Event**: `question_submission`
**Triggers**: User submits a question
**Data Collected**:
- Question title
- Category

**Locations**:
- `QuestionForm.tsx`

#### Comment Submission
**Event**: `comment_submission`
**Triggers**: User posts a comment on responsa
**Data Collected**:
- Responsa title
- Comment length

**Locations**:
- `app/responsa/[slug]/CommentForm.tsx`

### 4. Navigation Events

#### Page Views
**Event**: `page_view`
**Triggers**: Automatic on route changes
**Data Collected**:
- Page path
- Page title

**Implementation**: `use-analytics.ts` hook

#### Breadcrumb Clicks
**Event**: `breadcrumb_click`
**Triggers**: User clicks breadcrumb links
**Data Collected**:
- Breadcrumb label
- Target path

**Locations**:
- `Breadcrumbs.tsx`

### 5. Content Filtering Events

#### Content Type Filter
**Event**: `content_filter`
**Triggers**: User changes content type filter
**Data Collected**:
- Selected content type
- Previous content type

#### Category Filter
**Event**: `category_filter`
**Triggers**: User changes category filter
**Data Collected**:
- Selected category
- Content type context

**Locations**:
- `SearchForm.tsx`

### 6. Social Sharing Events

#### Social Platform Sharing
**Event**: `social_share`
**Triggers**: User shares content on social platforms
**Data Collected**:
- Platform (facebook, twitter, whatsapp, telegram, linkedin)
- Content title
- Content URL

#### Copy Link
**Event**: `copy_link`
**Triggers**: User copies content link
**Data Collected**:
- Content title
- Content URL

**Locations**:
- `SocialShare.tsx`

### 7. Playlist Interaction Events

#### Playlist View
**Event**: `playlist_view`
**Triggers**: User visits playlist page
**Data Collected**:
- Playlist title
- Video count

**Locations**:
- `PlaylistViewTracker.tsx` (client component)
- Used in `app/playlists/[playlistSlug]/page.tsx`

#### Video from Playlist
**Event**: `playlist_video_click`
**Triggers**: User clicks video from playlist
**Data Collected**:
- Video title
- Playlist title
- Video position in playlist

**Locations**:
- `PlaylistVideoGrid.tsx`

### 8. Content Engagement Events

#### Content View Tracking
**Event**: `content_view`
**Triggers**: When users view content pages (writings, blog posts, responsa)
**Data Collected**:
- Content title
- Content type (writing, blog, responsa)
- Author name
- Page type

**Locations**:
- `app/writings/[slug]/page.tsx` - Book and article pages
- `app/blog/[slug]/page.tsx` - Blog post pages  
- `app/responsa/[slug]/page.tsx` - Responsa Q&A pages

#### Writing/Content Engagement
**Event**: `writing_read`
**Triggers**: User clicks to read/view external content (books, articles)
**Data Collected**:
- Writing title
- Writing type (book/article)
- Author name
- Is external link
- Content format

**Locations**:
- `WritingButtonTracker.tsx` - Tracks button clicks for reading content

### 9. Error Tracking
**Event**: `error`
**Triggers**: Application errors
**Data Collected**:
- Error type
- Error message
- Page path

### 10. Custom Events
**Function**: `trackCustomEvent`
**Purpose**: Track any custom events not covered by specific functions

## Data Structure

Each event includes:
- **GTM Event**: Sent via `sendGTMEvent()`
- **GA Event**: Sent via `sendGAEvent()`

### Standard Properties
- `event` - Event name
- `category` - Event category
- `action` - Action performed
- `label` - Additional label
- `value` - Numeric value (where applicable)
- `custom_parameters` - Additional event data

## Privacy Considerations

- Email addresses are not stored directly; only email domains are tracked
- No personally identifiable information (PII) is collected
- All tracking follows GDPR/privacy best practices

## Usage Examples

```typescript
// Track a search
trackSearch('הרמב"ם', 'blog', 'philosophy', 15);

// Track video view
trackVideoView('abc123', 'שיעור בפילוסופיה', 'סדרת הרמב"ם');

// Track content view
trackContentView('מורה נבוכים', 'writing', 'הרמב"ם');

// Track content engagement (reading/viewing)
trackWritingRead('מאמר בפילוסופיה', 'article', 'שלום צדיק', true);

// Track newsletter signup
trackNewsletterSignup('user@example.com');

// Track social share
trackSocialShare('facebook', 'מאמר בפילוסופיה', 'https://example.com/article');
```

## Analytics Dashboard

Data can be viewed in:
1. **Google Analytics** - Real-time user behavior, conversions, engagement
2. **Google Tag Manager** - Event debugging, tag configuration
3. **Vercel Analytics** - Performance metrics and user behavior

## Benefits

This comprehensive tracking provides insights into:
- Most popular content types and topics
- User search behavior and patterns
- Video engagement and completion rates
- Content sharing patterns
- User journey through the site
- Form conversion rates
- Error rates and user experience issues
- Content consumption patterns (writings, blog posts, responsa)
- Reading engagement and external link clicks
- Author performance and content popularity

The dual tracking (GTM + GA) ensures data redundancy and allows for more sophisticated analysis and segmentation. 