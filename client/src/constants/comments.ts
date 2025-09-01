/**
 * Constants and types for the comments system
 */

export type CommentType = 'responsa' | 'blog';

export const COMMENT_LABELS = {
  responsa: {
    sectionTitle: "תשובות",
    noCommentsText: "אין תשובות עדיין. היה הראשון להשיב!",
    addComment: "הוסף תשובה",
    addCommentFull: "הוסיפו תשובה",
  },
  blog: {
    sectionTitle: "תגובות", 
    noCommentsText: "אין תגובות עדיין. היה הראשון להגיב!",
    addComment: "הוסף תגובה",
    addCommentFull: "הוסיפו תגובה",
  }
} as const;

export const REPLY_BUTTON_LABELS = {
  reply: "הגב",
  cancel: "ביטול",
} as const;

export const COMMENT_FORM_LABELS = {
  responsa: {
    nameLabel: "שם",
    namePlaceholder: "הכניסו את שמכם",
    contentLabel: "תשובה",
    contentPlaceholder: "הכניסו את תשובתכם",
    submitButton: "שלחו תשובה",
    submittingButton: "שולחים...",
  },
  blog: {
    nameLabel: "שם",
    namePlaceholder: "הכניסו את שמכם",
    contentLabel: "תגובה",
    contentPlaceholder: "הכניסו את תגובתכם",
    submitButton: "שלחו תגובה",
    submittingButton: "שולחים...",
  }
} as const;
