"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCommentAction } from "@/data/action";
import { useActionState } from "react";
import { trackCommentSubmission } from "@/lib/analytics";

const initialState = {
  zodErrors: null,
  strapiErrors: "",
  successMessage: "",
  errorMessage: "",
};

export default function CommentForm({ 
  responsaId, 
  onCommentAdded 
}: { 
  responsaId: number;
  onCommentAdded?: () => void;
}) {
  const [state, formAction] = useActionState(addCommentAction, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle successful comment submission
  useEffect(() => {
    if (state.successMessage && !isSubmitting) {
      // Call the callback to refresh comments
      onCommentAdded?.();
      
      // Show success notification
      setShowSuccessNotification(true);
      
      // Track successful comment submission
      trackCommentSubmission('Responsa Comment', 0);
      
      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.successMessage, isSubmitting, onCommentAdded]);

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

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg relative">
      {/* Success notification toast */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            התשובה נשלחה בהצלחה!
          </div>
        </div>
      )}
      
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <input type="hidden" name="responsaId" value={responsaId} />
        
        <div>
          <label htmlFor="answerer" className="block text-sm font-medium mb-1">
            שם
          </label>
          <Input
            id="answerer"
            name="answerer"
            placeholder="הכנס את שמך"
            className={state.zodErrors?.answerer ? "border-red-500" : ""}
          />
          {state.zodErrors?.answerer && (
            <p className="text-red-500 text-sm mt-1">{state.zodErrors.answerer[0]}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="answer" className="block text-sm font-medium mb-1">
            תשובה
          </label>
          <textarea
            id="answer"
            name="answer"
            rows={6}
            placeholder="הכנס את תשובתך"
            className={`w-full rounded-md border ${
              state.zodErrors?.answer ? "border-red-500" : "border-gray-300"
            } p-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {state.zodErrors?.answer && (
            <p className="text-red-500 text-sm mt-1">{state.zodErrors.answer[0]}</p>
          )}
        </div>
        
        {state.successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-md">
            {state.successMessage}
          </div>
        )}
        
        {state.errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md">
            {state.errorMessage}
          </div>
        )}
        
        <div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "שולח..." : "שלח תשובה"}
          </Button>
        </div>
      </form>
    </div>
  );
} 