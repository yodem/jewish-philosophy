'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { sendGAEvent } from '@next/third-parties/google';

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, string | number | boolean>;
}

// Search events
export const trackSearch = (query: string, contentType: string, category?: string, resultsCount?: number) => {
  const eventData = {
    event: 'search',
    category: 'search',
    action: 'search_performed',
    label: `${contentType}${category ? `_${category}` : ''}`,
    value: resultsCount || 0,
    custom_parameters: {
      search_term: query,
      content_type: contentType,
      category: category || 'all',
      results_count: resultsCount || 0
    }
  };

  // Send to GTM
  sendGTMEvent(eventData);
  
  // Send to GA
  sendGAEvent('event', 'search', {
    search_term: query,
    content_type: contentType,
    category: category || 'all',
    results_count: resultsCount || 0
  });
};

// Video events
export const trackVideoView = (videoId: string, videoTitle: string, playlistTitle?: string) => {
  const eventData = {
    event: 'video_view',
    category: 'video',
    action: 'video_watched',
    label: videoTitle,
    custom_parameters: {
      video_id: videoId,
      video_title: videoTitle,
      playlist_title: playlistTitle || '',
      content_type: 'video'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'video_view', {
    video_id: videoId,
    video_title: videoTitle,
    playlist_title: playlistTitle || '',
    content_type: 'video'
  });
};

export const trackVideoPlay = (videoId: string, videoTitle: string, playlistTitle?: string) => {
  const eventData = {
    event: 'video_play',
    category: 'video',
    action: 'video_started',
    label: videoTitle,
    custom_parameters: {
      video_id: videoId,
      video_title: videoTitle,
      playlist_title: playlistTitle || '',
      content_type: 'video'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'video_play', {
    video_id: videoId,
    video_title: videoTitle,
    playlist_title: playlistTitle || '',
    content_type: 'video'
  });
};

// Form submission events
export const trackNewsletterSignup = (email: string) => {
  const eventData = {
    event: 'newsletter_signup',
    category: 'engagement',
    action: 'newsletter_subscribed',
    label: 'newsletter',
    custom_parameters: {
      email_domain: email.split('@')[1] || '',
      content_type: 'newsletter'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'newsletter_signup', {
    email_domain: email.split('@')[1] || '',
    content_type: 'newsletter'
  });
};

export const trackQuestionSubmission = (questionTitle: string, category?: string) => {
  const eventData = {
    event: 'question_submission',
    category: 'engagement',
    action: 'question_submitted',
    label: questionTitle,
    custom_parameters: {
      question_title: questionTitle,
      category: category || 'general',
      content_type: 'question'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'question_submission', {
    question_title: questionTitle,
    category: category || 'general',
    content_type: 'question'
  });
};

export const trackCommentSubmission = (responsaTitle: string, commentLength: number) => {
  const eventData = {
    event: 'comment_submission',
    category: 'engagement',
    action: 'comment_submitted',
    label: responsaTitle,
    value: commentLength,
    custom_parameters: {
      responsa_title: responsaTitle,
      comment_length: commentLength,
      content_type: 'comment'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'comment_submission', {
    responsa_title: responsaTitle,
    comment_length: commentLength,
    content_type: 'comment'
  });
};

// Navigation events
export const trackPageView = (pagePath: string, pageTitle: string) => {
  const eventData = {
    event: 'page_view',
    category: 'navigation',
    action: 'page_viewed',
    label: pageTitle,
    custom_parameters: {
      page_path: pagePath,
      page_title: pageTitle
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle
  });
};

export const trackBreadcrumbClick = (breadcrumbLabel: string, breadcrumbPath: string) => {
  const eventData = {
    event: 'breadcrumb_click',
    category: 'navigation',
    action: 'breadcrumb_clicked',
    label: breadcrumbLabel,
    custom_parameters: {
      breadcrumb_label: breadcrumbLabel,
      breadcrumb_path: breadcrumbPath
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'breadcrumb_click', {
    breadcrumb_label: breadcrumbLabel,
    breadcrumb_path: breadcrumbPath
  });
};

// Content filtering events
export const trackContentTypeFilter = (contentType: string, previousType?: string) => {
  const eventData = {
    event: 'content_filter',
    category: 'content',
    action: 'content_type_filtered',
    label: contentType,
    custom_parameters: {
      content_type: contentType,
      previous_type: previousType || 'none'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'content_filter', {
    content_type: contentType,
    previous_type: previousType || 'none'
  });
};

export const trackCategoryFilter = (category: string, contentType: string) => {
  const eventData = {
    event: 'category_filter',
    category: 'content',
    action: 'category_filtered',
    label: category,
    custom_parameters: {
      category: category,
      content_type: contentType
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'category_filter', {
    category: category,
    content_type: contentType
  });
};

// Social sharing events
export const trackSocialShare = (platform: string, contentTitle: string, contentUrl: string) => {
  const eventData = {
    event: 'social_share',
    category: 'social',
    action: 'content_shared',
    label: platform,
    custom_parameters: {
      platform: platform,
      content_title: contentTitle,
      content_url: contentUrl
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'social_share', {
    platform: platform,
    content_title: contentTitle,
    content_url: contentUrl
  });
};

export const trackCopyLink = (contentTitle: string, contentUrl: string) => {
  const eventData = {
    event: 'copy_link',
    category: 'social',
    action: 'link_copied',
    label: contentTitle,
    custom_parameters: {
      content_title: contentTitle,
      content_url: contentUrl
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'copy_link', {
    content_title: contentTitle,
    content_url: contentUrl
  });
};

// Playlist interaction events
export const trackPlaylistView = (playlistTitle: string, videoCount: number) => {
  const eventData = {
    event: 'playlist_view',
    category: 'content',
    action: 'playlist_viewed',
    label: playlistTitle,
    value: videoCount,
    custom_parameters: {
      playlist_title: playlistTitle,
      video_count: videoCount,
      content_type: 'playlist'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'playlist_view', {
    playlist_title: playlistTitle,
    video_count: videoCount,
    content_type: 'playlist'
  });
};

export const trackVideoFromPlaylist = (videoTitle: string, playlistTitle: string, videoPosition: number) => {
  const eventData = {
    event: 'playlist_video_click',
    category: 'content',
    action: 'playlist_video_selected',
    label: videoTitle,
    value: videoPosition,
    custom_parameters: {
      video_title: videoTitle,
      playlist_title: playlistTitle,
      video_position: videoPosition,
      content_type: 'playlist_video'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'playlist_video_click', {
    video_title: videoTitle,
    playlist_title: playlistTitle,
    video_position: videoPosition,
    content_type: 'playlist_video'
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, pagePath?: string) => {
  const eventData = {
    event: 'error',
    category: 'error',
    action: 'error_occurred',
    label: errorType,
    custom_parameters: {
      error_type: errorType,
      error_message: errorMessage,
      page_path: pagePath || window.location.pathname
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'error', {
    error_type: errorType,
    error_message: errorMessage,
    page_path: pagePath || window.location.pathname
  });
};

// Content engagement events
export const trackContentView = (contentTitle: string, contentType: string, author?: string) => {
  const eventData = {
    event: 'content_view',
    category: 'content',
    action: 'content_viewed',
    label: contentTitle,
    custom_parameters: {
      content_title: contentTitle,
      content_type: contentType,
      author: author || '',
      page_type: 'content_detail'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'content_view', {
    content_title: contentTitle,
    content_type: contentType,
    author: author || '',
    page_type: 'content_detail'
  });
};

export const trackContentEngagement = (contentTitle: string, contentType: string, engagementType: string, isExternal: boolean, author?: string) => {
  const eventData = {
    event: 'content_engagement',
    category: 'engagement',
    action: 'content_accessed',
    label: contentTitle,
    custom_parameters: {
      content_title: contentTitle,
      content_type: contentType,
      engagement_type: engagementType,
      is_external: isExternal,
      author: author || '',
      link_type: isExternal ? 'external' : 'internal'
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'content_engagement', {
    content_title: contentTitle,
    content_type: contentType,
    engagement_type: engagementType,
    is_external: isExternal,
    author: author || '',
    link_type: isExternal ? 'external' : 'internal'
  });
};

export const trackWritingRead = (writingTitle: string, writingType: string, author: string, isExternal: boolean) => {
  const eventData = {
    event: 'writing_read',
    category: 'content',
    action: writingType === 'book' ? 'book_opened' : 'article_read',
    label: writingTitle,
    custom_parameters: {
      writing_title: writingTitle,
      writing_type: writingType,
      author: author,
      is_external: isExternal,
      content_format: writingType
    }
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', 'writing_read', {
    writing_title: writingTitle,
    writing_type: writingType,
    author: author,
    is_external: isExternal,
    content_format: writingType
  });
};

// Custom event for any other tracking needs
export const trackCustomEvent = (eventName: string, parameters: Record<string, string | number | boolean>) => {
  const eventData = {
    event: eventName,
    category: parameters.category || 'custom',
    action: parameters.action || eventName,
    label: parameters.label || '',
    value: parameters.value || 0,
    custom_parameters: parameters
  };

  sendGTMEvent(eventData);
  sendGAEvent('event', eventName, parameters);
}; 