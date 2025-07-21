"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCommentAction } from "@/data/action";
import { useActionState } from "react";

const initialState = {
  zodErrors: null,
  strapiErrors: "",
  successMessage: "",
  errorMessage: "",
};

export default function CommentForm({ responsaId }: { responsaId: number }) {
  const router = useRouter();
  const [state, formAction] = useActionState(addCommentAction, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await formAction(formData);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
      <form action={handleSubmit} className="space-y-4">
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