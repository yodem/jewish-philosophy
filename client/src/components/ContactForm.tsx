"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { submitContactAction } from "@/data/action";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Subscribe } from "@/components/blocks/Subscribe";
import { useEmailCategories } from "@/hooks/use-email-categories";

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
      className="w-full sm:w-auto text-white"
    >
      {pending ? "שולחים..." : "שלחו הודעה"}
    </Button>
  );
}

function ContactFormInner() {
  const [state, formAction] = useActionState(submitContactAction, initialState);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  });
  const { enqueueSnackbar } = useSnackbar();
  const { emailCategories, loadingEmailCategories } = useEmailCategories();

  // Show notifications on submit
  useEffect(() => {
    if (state.successMessage) {
      enqueueSnackbar(state.successMessage, { variant: 'success' });
    }
    if (state.errorMessage || state.strapiErrors) {
      enqueueSnackbar(state.errorMessage || state.strapiErrors, { variant: 'error' });
    }
  }, [state.successMessage, state.errorMessage, state.strapiErrors, enqueueSnackbar]);

  // Form validation
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      formValues.name.trim().length >= 2 &&
      emailRegex.test(formValues.email) &&
      formValues.subject.trim().length >= 3 &&
      formValues.message.trim().length >= 10 &&
      formValues.category.trim().length > 0
    );
  };

  // Handle form input changes
  const handleInputChange = (field: 'name' | 'email' | 'subject' | 'message' | 'category', value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    handleInputChange('category', value);
  };

  // Convert email categories to combobox options
  const categoryOptions = emailCategories.map(category => ({
    value: category.id.toString(),
    label: category.name,
    description: category.description
  }));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Contact Form */}
      <div className="w-full max-w-2xl mx-auto rounded-lg p-6 mt-8 shadow-sm bg-gradient-to-br from-zinc-200 via-stone-100 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-gray-200">

        <form action={formAction} className="space-y-4">
          {/* Hidden input for category ID */}
          <input type="hidden" name="category" value={formValues.category} />
          
          <div>
            <label className="block text-sm font-medium mb-1">
              סוג הפנייה *
            </label>
            <Combobox
              options={categoryOptions}
              value={formValues.category}
              onValueChange={handleCategoryChange}
              placeholder={loadingEmailCategories ? "טוענים קטגוריות..." : "בחרו סוג פנייה"}
              emptyMessage="לא נמצאו קטגוריות"
              disabled={loadingEmailCategories}
              className={state.zodErrors?.category ? "border-red-500" : ""}
            />
            {state.zodErrors?.category && (
              <p className="text-red-500 text-sm mt-1">{state.zodErrors.category[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              שם מלא *
            </label>
            <Input
              id="name"
              name="name"
              value={formValues.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="הכניסו את שמכם המלא"
              className={state.zodErrors?.name ? "border-red-500" : ""}
            />
            {state.zodErrors?.name && (
              <p className="text-red-500 text-sm mt-1">{state.zodErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              כתובת אימייל *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="הכניסו את כתובת האימייל שלכם"
              className={state.zodErrors?.email ? "border-red-500" : ""}
            />
            {state.zodErrors?.email && (
              <p className="text-red-500 text-sm mt-1">{state.zodErrors.email[0]}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">נשתמש בכתובת זו כדי לחזור אליך</p>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              נושא ההודעה *
            </label>
            <Input
              id="subject"
              name="subject"
              value={formValues.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="מה נושא ההודעה שלכם?"
              className={state.zodErrors?.subject ? "border-red-500" : ""}
            />
            {state.zodErrors?.subject && (
              <p className="text-red-500 text-sm mt-1">{state.zodErrors.subject[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              תוכן ההודעה *
            </label>
            <textarea
              id="message"
              name="message"
              value={formValues.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={6}
              placeholder="כתבו את ההודעה שלכם כאן..."
              className={`w-full rounded-md border ${
                state.zodErrors?.message ? "border-red-500" : "border-gray-300"
              } p-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {state.zodErrors?.message && (
              <p className="text-red-500 text-sm mt-1">{state.zodErrors.message[0]}</p>
            )}
          </div>

          <div className="flex justify-end">
            <SubmitButton isFormValid={isFormValid()} />
          </div>
        </form>
      </div>

      {/* Newsletter Subscription */}
      <div className="w-full">
        <Subscribe
          id={1}
          headline="הירשמו לניוזלטר"
          content="קבלו עדכונים על תכנים חדשים, שיעורים ותשובות לשאלות"
          placeholder="הכניסו את כתובת האימייל שלכם"
          buttonText="הירשמו"
        />
      </div>
    </div>
  );
}

export default function ContactForm() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <ContactFormInner />
    </SnackbarProvider>
  );
}
