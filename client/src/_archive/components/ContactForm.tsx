"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { submitContactAction } from "@/data/action";
import { SnackbarProvider, useSnackbar } from 'notistack';
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
    <button
      type="submit"
      disabled={pending || !isFormValid}
      className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 px-6 rounded-lg transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
    >
      {pending ? "שולחים..." : "שלח הודעה"}
    </button>
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
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Hidden input for category ID */}
      <input type="hidden" name="category" value={formValues.category} />

      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-bold text-foreground">
          שם מלא
        </label>
        <Input
          id="name"
          name="name"
          value={formValues.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="הקלידו שם מלא"
          className={`w-full px-4 py-3 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all text-foreground bg-background ${
            state.zodErrors?.name ? "border-destructive" : ""
          }`}
        />
        {state.zodErrors?.name && (
          <p className="text-destructive text-sm">{state.zodErrors.name[0]}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2 text-right">
        <label htmlFor="email" className="block text-sm font-bold text-foreground">
          אימייל
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          value={formValues.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="email@example.com"
          className={`w-full px-4 py-3 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all text-foreground bg-background text-right ${
            state.zodErrors?.email ? "border-destructive" : ""
          }`}
        />
        {state.zodErrors?.email && (
          <p className="text-destructive text-sm">{state.zodErrors.email[0]}</p>
        )}
      </div>

      {/* Category Field */}
      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-bold text-foreground">
          קטגוריה
        </label>
        <Combobox
          options={categoryOptions}
          value={formValues.category}
          onValueChange={handleCategoryChange}
          placeholder={loadingEmailCategories ? "טוענים קטגוריות..." : "בחרו קטגוריה"}
          emptyMessage="לא נמצאו קטגוריות"
          disabled={loadingEmailCategories}
          className={`w-full px-4 py-3 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all ${
            state.zodErrors?.category ? "border-destructive" : ""
          }`}
        />
        {state.zodErrors?.category && (
          <p className="text-destructive text-sm">{state.zodErrors.category[0]}</p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-bold text-foreground">
          נושא הפנייה
        </label>
        <Input
          id="subject"
          name="subject"
          value={formValues.subject}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          placeholder="מה נושא הפנייה?"
          className={`w-full px-4 py-3 rounded-lg border border-input focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all text-foreground bg-background ${
            state.zodErrors?.subject ? "border-destructive" : ""
          }`}
        />
        {state.zodErrors?.subject && (
          <p className="text-destructive text-sm">{state.zodErrors.subject[0]}</p>
        )}
      </div>

      {/* Message Field - Full Width */}
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="message" className="block text-sm font-bold text-foreground">
          תוכן ההודעה
        </label>
        <textarea
          id="message"
          name="message"
          value={formValues.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          rows={5}
          placeholder="כתבו כאן את הודעתכם..."
          className={`w-full px-4 py-3 rounded-lg border ${
            state.zodErrors?.message ? "border-destructive" : "border-input"
          } focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all text-foreground bg-background resize-none`}
        />
        {state.zodErrors?.message && (
          <p className="text-destructive text-sm">{state.zodErrors.message[0]}</p>
        )}
      </div>

      {/* Submit Button - Full Width */}
      <div className="md:col-span-2 pt-4">
        <SubmitButton isFormValid={isFormValid()} />
      </div>
    </form>
  );
}

export default function ContactForm() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <ContactFormInner />
    </SnackbarProvider>
  );
}
