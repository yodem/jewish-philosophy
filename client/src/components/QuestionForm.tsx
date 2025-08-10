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
import { useCategories } from "@/hooks/use-categories";
import { CategoryBadge } from "@/components/CategoryBadge";
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
      {pending ? "שולח שאלה..." : "שלח שאלה"}
    </Button>
  );
}

function QuestionFormInner() {
  const router = useRouter();
  const [state, formAction] = useActionState(submitQuestionAction, initialState);
  const [showForm, setShowForm] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formValues, setFormValues] = useState({
    title: '',
    content: '',
    questioneer: ''
  });
  const { enqueueSnackbar } = useSnackbar();
  const { fullCategories, loadingCategories } = useCategories();

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
      setSelectedCategories([]);
      setFormValues({
        title: '',
        content: '',
        questioneer: ''
      });
    }
  }, [showForm]);

  // Form validation
  const isFormValid = () => {
    return (
      formValues.title.trim().length >= 3 &&
      formValues.content.trim().length >= 10 &&
      formValues.questioneer.trim().length >= 2 &&
      selectedCategories.length >= 1 &&
      selectedCategories.length <= 3
    );
  };

  // Dialog confirm handler
  const handleDialogConfirm = () => {
    setDialogOpen(false);
    if (state.slug) {
      router.push(`/responsa/${state.slug}`);
    }
  };

  // Handle category selection
  const handleCategoryChange = (categoryValue: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryValue)) {
        return prev.filter(cat => cat !== categoryValue);
      } else {
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, categoryValue];
      }
    });
  };

  // Handle form input changes
  const handleInputChange = (field: 'title' | 'content' | 'questioneer', value: string) => {
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
              השאלה נשלחה בהצלחה! האם תרצה לעבור לעמוד השאלה?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>לא, תודה</Button>
            <Button onClick={handleDialogConfirm}>כן, עבור לעמוד השאלה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            {/* Hidden inputs for selected categories */}
            {selectedCategories.map((category) => (
              <input
                key={category}
                type="hidden"
                name="categories"
                value={category}
              />
            ))}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                כותרת
              </label>
              <Input
                id="title"
                name="title"
                value={formValues.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
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
                value={formValues.questioneer}
                onChange={(e) => handleInputChange('questioneer', e.target.value)}
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
                value={formValues.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
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
            <div>
              <label className="block text-sm font-medium mb-1">
                קטגוריות (1-3 קטגוריות) {selectedCategories.length > 0 && `(${selectedCategories.length}/3)`}
              </label>
              {loadingCategories ? (
                <div className="text-gray-500 text-sm">טוען קטגוריות...</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    {fullCategories.map((category) => {
                      const isSelected = selectedCategories.includes(category.slug);
                      const isDisabled = !isSelected && selectedCategories.length >= 3;
                      
                      return (
                        <CategoryBadge
                          key={category.slug}
                          category={category}
                          isSelected={isSelected}
                          isDisabled={isDisabled}
                          showRemoveIcon={isSelected}
                          onClick={() => handleCategoryChange(category.slug)}
                        />
                      );
                    })}
                  </div>
                  {selectedCategories.length >= 3 && (
                    <p className="text-blue-600 text-sm">נבחרו 3 קטגוריות מקסימום</p>
                  )}
                  {state.zodErrors?.categories && (
                    <p className="text-red-500 text-sm">{state.zodErrors.categories[0]}</p>
                  )}
                </div>
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