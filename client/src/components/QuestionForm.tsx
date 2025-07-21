"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitQuestionAction } from "@/data/action";

const initialState = {
  zodErrors: null,
  strapiErrors: "",
  successMessage: "",
  errorMessage: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-auto"
    >
      {pending ? "שולח שאלה..." : "שלח שאלה"}
    </Button>
  );
}

export default function QuestionForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(submitQuestionAction, initialState);
  const [showForm, setShowForm] = useState(false);

  // Redirect after successful submission
  useEffect(() => {
    if (state.slug) {
      router.push(`/responsa/${state.slug}`);
    }
  }, [state.slug, router]);

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-8 shadow-sm">
      {!showForm ? (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">יש לך שאלה?</h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            שתף את השאלה שלך, ואנחנו נענה עליה בהקדם האפשרי.
          </p>
          <Button onClick={() => setShowForm(true)}>שאל שאלה חדשה</Button>
        </div>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-6">שאל שאלה חדשה</h3>
          
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                כותרת השאלה
              </label>
              <Input
                id="title"
                name="title"
                placeholder="הכנס כותרת קצרה ומתומצתת"
                className={state.zodErrors?.title ? "border-red-500" : ""}
              />
              {state.zodErrors?.title && (
                <p className="text-red-500 text-sm mt-1">{state.zodErrors.title[0]}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="questioneer" className="block text-sm font-medium mb-1">
                שם השואל
              </label>
              <Input
                id="questioneer"
                name="questioneer"
                placeholder="הכנס את שמך"
                className={state.zodErrors?.questioneer ? "border-red-500" : ""}
              />
              {state.zodErrors?.questioneer && (
                <p className="text-red-500 text-sm mt-1">{state.zodErrors.questioneer[0]}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                תוכן השאלה
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                placeholder="הסבר את השאלה שלך בפירוט"
                className={`w-full rounded-md border ${
                  state.zodErrors?.content ? "border-red-500" : "border-gray-300"
                } p-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {state.zodErrors?.content && (
                <p className="text-red-500 text-sm mt-1">{state.zodErrors.content[0]}</p>
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
            
            {state.strapiErrors && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md">
                API Error: {state.strapiErrors}
              </div>
            )}
            
            <div className="flex justify-between items-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
              >
                ביטול
              </Button>
              <SubmitButton />
            </div>
          </form>
        </>
      )}
    </div>
  );
} 