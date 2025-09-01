"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCommentAction, addThreadAction } from "@/data/action";
import { useActionState } from "react";
import { trackCommentSubmission } from "@/lib/analytics";
import { CommentType, COMMENT_LABELS, COMMENT_FORM_LABELS } from "@/constants/comments";
import { useSnackbar } from 'notistack';

const initialState = {
  zodErrors: null,
  strapiErrors: "",
  successMessage: "",
  errorMessage: "",
};

interface CommentFormProps {
  responsaSlug?: string;
  blogSlug?: string;
  onCommentAdded?: () => void;
  commentType?: CommentType;
  parentCommentSlug?: string;
  isThread?: boolean;
  onCancel?: () => void;
  isOpen?: boolean;
  showHeader?: boolean;
}

export default function CommentForm({
  responsaSlug,
  blogSlug,
  onCommentAdded,
  commentType = 'responsa',
  parentCommentSlug,
  isThread = false,
  onCancel,
  isOpen = true,
  showHeader = false
}: CommentFormProps) {
  const action = isThread ? addThreadAction : addCommentAction;
  const [state, formAction] = useActionState(action, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  console.log({isOpen, isThread, parentCommentSlug});

  // Handle successful comment submission
  useEffect(() => {
    if (state.successMessage && !isSubmitting) {
      setIsSubmitting(false);
      // Call the callback to refresh comments
      onCommentAdded?.();

      // Show success notification
      if (isThread) {
        // Show reply success notification for threads
        enqueueSnackbar(
          commentType === 'blog' ? 'המענה נשלח בהצלחה!' : 'התשובה למענה נשלחה בהצלחה!',
          { variant: 'success' }
        );
        // Hide form after showing notification
        setTimeout(() => {
          onCancel?.();
        }, 500);
      } else {
        // Show success notification for main comments
        enqueueSnackbar(
          commentType === 'blog' ? 'התגובה נשלחה בהצלחה!' : 'התשובה נשלחה בהצלחה!',
          { variant: 'success' }
        );
      }

      // Track successful comment submission
      trackCommentSubmission(commentType === 'blog' ? 'Blog Comment' : 'Responsa Comment', 0);
    }
  }, [state.successMessage, isSubmitting, onCommentAdded, commentType, isThread, onCancel, enqueueSnackbar]);

  // Reset form when submission is successful
  useEffect(() => {
    if (state.successMessage) {
      formRef.current?.reset();
    }
  }, [state.successMessage]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await formAction(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLabels = COMMENT_FORM_LABELS[commentType];
  const headerLabels = COMMENT_LABELS[commentType];

  // Don't render anything if the form is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg relative">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {headerLabels.addCommentFull}
          </h3>
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              ביטול
            </Button>
          )}
        </div>
      )}

      
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        {responsaSlug && <input type="hidden" name="responsaSlug" value={responsaSlug} />}
        {blogSlug && <input type="hidden" name="blogSlug" value={blogSlug} />}
        {isThread && parentCommentSlug && <input type="hidden" name="parentCommentSlug" value={parentCommentSlug} />}
        
        <div>
          <label htmlFor="answerer" className="block text-sm font-medium mb-1">
            {currentLabels.nameLabel}
          </label>
          <Input
            id="answerer"
            name="answerer"
            placeholder={currentLabels.namePlaceholder}
            className={state.zodErrors?.answerer ? "border-red-500" : ""}
          />
          {state.zodErrors?.answerer && (
            <p className="text-red-500 text-sm mt-1">{state.zodErrors.answerer[0]}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="answer" className="block text-sm font-medium mb-1">
            {currentLabels.contentLabel}
          </label>
          <textarea
            id="answer"
            name="answer"
            rows={6}
            placeholder={currentLabels.contentPlaceholder}
            className={`w-full rounded-md border ${
              state.zodErrors?.answer ? "border-red-500" : "border-gray-300"
            } p-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {state.zodErrors?.answer && (
            <p className="text-red-500 text-sm mt-1">{state.zodErrors.answer[0]}</p>
          )}
        </div>
        

        
        <div className={isThread ? "flex gap-2" : ""}>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            loadingText={currentLabels.submittingButton}
            className={isThread ? "flex-1" : "w-full"}
          >
            {currentLabels.submitButton}
          </Button>
          {isThread && onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              ביטול
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
