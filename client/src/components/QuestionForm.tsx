"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitQuestionAction } from "@/data/action";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { trackQuestionSubmission } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const initialState = {
  zodErrors: null,
  strapiErrors: "",
  successMessage: "",
  errorMessage: "",
};

function SubmitButton({ 
  isFormValid 
}: { 
  isFormValid: boolean 
}) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending || !isFormValid} 
      className="w-auto text-white"
    >
      {pending ? "שולחים שאלה..." : "שלחו שאלה"}
    </Button>
  );
}

function QuestionFormInner() {
  const router = useRouter();
  const [state, formAction] = useActionState(submitQuestionAction, initialState);
  const [showForm, setShowForm] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    content: '',
    questioneer: '',
    questioneerEmail: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  // Show notifications on submit
  useEffect(() => {
    if (state.successMessage) {
      enqueueSnackbar(state.successMessage, { variant: 'success' });
      setDialogOpen(true);
      
      // Track successful question submission
      const formData = new FormData(document.querySelector('form') as HTMLFormElement);
      const questionTitle = formData.get('title') as string;
      if (questionTitle) {
        trackQuestionSubmission(questionTitle);
      }
    }
    if (state.errorMessage || state.strapiErrors) {
      enqueueSnackbar(state.errorMessage || state.strapiErrors, { variant: 'error' });
    }
  }, [state.successMessage, state.errorMessage, state.strapiErrors, enqueueSnackbar]);

  // Reset form when form is shown/hidden
  useEffect(() => {
    if (!showForm) {
      setFormValues({
        title: '',
        content: '',
        questioneer: '',
        questioneerEmail: ''
      });
    }
  }, [showForm]);

  // Form validation
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = formValues.questioneerEmail.trim().length === 0 ||
                      emailRegex.test(formValues.questioneerEmail);

    return (
      formValues.title.trim().length >= 3 &&
      formValues.content.trim().length >= 10 &&
      formValues.questioneer.trim().length >= 2 &&
      emailValid
    );
  };

  // Dialog confirm handler
  const handleDialogConfirm = () => {
    setDialogOpen(false);
    if (state.slug) {
      router.push(`/responsa/${state.slug}`);
    }
  };


  // Handle form input changes
  const handleInputChange = (field: 'title' | 'content' | 'questioneer' | 'questioneerEmail', value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-lg p-6 mt-8 shadow-sm bg-gradient-to-br from-zinc-200 via-stone-100 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-gray-200">
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>לעבור לעמוד השאלה?</DialogTitle>
            <DialogDescription>
              השאלה נשלחה בהצלחה! האם תרצו לעבור לעמוד השאלה?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>לא, תודה</Button>
            <Button onClick={handleDialogConfirm}>כן, עברו לעמוד השאלה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {!showForm ? (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">יש לכם שאלה?</h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            שתפו את השאלה שלכם, ואנחנו נענה עליה בהקדם האפשרי.
          </p>
          <Button onClick={() => setShowForm(true)}>שאל שאלה חדשה</Button>
        </div>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-6">שאל שאלה חדשה</h3>
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                כותרת
              </label>
              <Input
                id="title"
                name="title"
                value={formValues.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="הכניסו כותרת קצרה ומתומצתת"
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
                value={formValues.questioneer}
                onChange={(e) => handleInputChange('questioneer', e.target.value)}
                placeholder="הכניסו את שמכם"
                className={state.zodErrors?.questioneer ? "border-red-500" : ""}
              />
              {state.zodErrors?.questioneer && (
                <p className="text-red-500 text-sm mt-1">{state.zodErrors.questioneer[0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="questioneerEmail" className="block text-sm font-medium mb-1">
                כתובת אימייל <span className="text-gray-500">(אופציונלי)</span>
              </label>
              <Input
                id="questioneerEmail"
                name="questioneerEmail"
                type="email"
                value={formValues.questioneerEmail}
                onChange={(e) => handleInputChange('questioneerEmail', e.target.value)}
                placeholder="הכניסו את כתובת האימייל שלכם (אופציונלי)"
                className={state.zodErrors?.questioneerEmail ? "border-red-500" : ""}
              />
              {state.zodErrors?.questioneerEmail && formValues.questioneerEmail.trim().length > 0 && (
                <p className="text-red-500 text-sm mt-1">{state.zodErrors.questioneerEmail[0]}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">אם תזינו כתובת אימייל, נשלח אליכם התראה כאשר תתקבל תשובה לשאלה</p>
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                תוכן השאלה
              </label>
              <textarea
                id="content"
                name="content"
                value={formValues.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={6}
                placeholder="הסבירו את השאלה שלכם בפירוט"
                className={`w-full rounded-md border ${
                  state.zodErrors?.content ? "border-red-500" : "border-gray-300"
                } p-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {state.zodErrors?.content && (
                <p className="text-red-500 text-sm mt-1">{state.zodErrors.content[0]}</p>
              )}
            </div>
            <div className="flex justify-between items-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
              >
                ביטול
              </Button>
              <SubmitButton isFormValid={isFormValid()} />
  
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default function QuestionForm() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <QuestionFormInner />
    </SnackbarProvider>
  );
} 