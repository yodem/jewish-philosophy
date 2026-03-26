"use client";
import { subscribeAction } from "@/data/action";
import type { SubscribeProps } from "@/types";
import { useActionState } from "react";
import React from "react";
import { SnackbarProvider, useSnackbar } from 'notistack';
import { trackNewsletterSignup } from "@/lib/analytics";

interface SubscribeState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
}

const INITIAL_STATE: SubscribeState = {
  zodErrors: null,
  strapiErrors: "",
  errorMessage: "",
  successMessage: "",
};

function SubscribeInner({
  headline,
  content,
  placeholder,
  buttonText,
}: Readonly<SubscribeProps>) {
  const [formState, formAction] = useActionState(
    subscribeAction,
    INITIAL_STATE
  );
  const zodErrors = formState?.zodErrors;
  const errorMessage = formState?.errorMessage || formState?.strapiErrors;
  const successMessage = formState?.successMessage;
  const { enqueueSnackbar } = useSnackbar();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [submissionCount, setSubmissionCount] = React.useState(0);
  const previousSubmissionCount = React.useRef(0);

  React.useEffect(() => {
    if (formState !== INITIAL_STATE) {
      setSubmissionCount(prev => prev + 1);
    }
  }, [formState]);

  React.useEffect(() => {
    if (submissionCount > previousSubmissionCount.current) {
      previousSubmissionCount.current = submissionCount;

      if (successMessage) {
        enqueueSnackbar(successMessage, { variant: 'success' });

        const emailInput = formRef.current?.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput?.value) {
          trackNewsletterSignup(emailInput.value);
        }

        if (formRef.current) {
          formRef.current.reset();
        }
      }

      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  }, [submissionCount, successMessage, errorMessage, enqueueSnackbar]);

  return (
    <section className="bg-muted/50 p-8 md:p-12 border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-primary mb-2">{headline}</h3>
        <p className="text-muted-foreground mb-8">{content}</p>
        <form
          ref={formRef}
          className="flex flex-col md:flex-row gap-4"
          action={formAction}
        >
          <input
            name="email"
            type="email"
            placeholder={placeholder ?? zodErrors?.email?.[0]}
            aria-invalid={!!zodErrors?.email?.[0]}
            className={`flex-1 px-6 py-4 rounded-lg border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all text-right bg-background text-foreground ${
              zodErrors?.email?.[0] ? "border-destructive" : "border-border"
            }`}
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-10 rounded-lg transition-all shadow-md active:scale-95"
          >
            {buttonText}
          </button>
        </form>
        {errorMessage && (
          <p className="mt-4 text-destructive text-sm text-center" role="alert">{errorMessage}</p>
        )}
      </div>
    </section>
  );
}

export function Subscribe(props: Readonly<SubscribeProps>) {
  return (
    <SnackbarProvider maxSnack={3} preventDuplicate transitionDuration={2000} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <SubscribeInner {...props} />
    </SnackbarProvider>
  );
}
