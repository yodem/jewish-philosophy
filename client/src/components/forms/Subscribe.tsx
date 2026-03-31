"use client";

import { subscribeAction } from "@/data/action";
import type { SubscribeProps } from "@/types";
import { useActionState, useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { SnackbarProvider, useSnackbar } from "notistack";
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

function SubmitButton({ buttonText }: { buttonText: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg bg-primary px-10 py-4 font-bold text-primary-foreground shadow-md transition-all ${
        pending ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90 active:scale-95"
      }`}
    >
      {pending ? "שולח..." : buttonText}
    </button>
  );
}

function SubscribeInner({
  headline,
  content,
  placeholder,
  buttonText,
}: Readonly<SubscribeProps>) {
  const [formState, formAction] = useActionState(subscribeAction, INITIAL_STATE);
  const zodErrors = formState?.zodErrors;
  const errorMessage = formState?.errorMessage || formState?.strapiErrors;
  const successMessage = formState?.successMessage;
  const { enqueueSnackbar } = useSnackbar();
  const formRef = useRef<HTMLFormElement>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const previousSubmissionCount = useRef(0);

  useEffect(() => {
    if (formState !== INITIAL_STATE) {
      setSubmissionCount((prev) => prev + 1);
    }
  }, [formState]);

  useEffect(() => {
    if (submissionCount > previousSubmissionCount.current) {
      previousSubmissionCount.current = submissionCount;

      if (successMessage) {
        enqueueSnackbar(successMessage, { variant: "success" });

        const emailInput = formRef.current?.querySelector(
          'input[name="email"]'
        ) as HTMLInputElement;
        if (emailInput?.value) {
          trackNewsletterSignup(emailInput.value);
        }

        if (formRef.current) {
          formRef.current.reset();
        }
      }

      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    }
  }, [submissionCount, successMessage, errorMessage, enqueueSnackbar]);

  return (
    <section
      className="p-4 md:p-8 w-full max-w-6xl mx-auto"
      aria-label="הרשמה לניוזלטר"
    >
      <div className="mx-auto max-w-3xl text-center bg-card rounded-2xl shadow-md border border-border p-4 sm:p-8 md:p-12">
        <h3 className="mb-2 text-2xl font-bold text-foreground">{headline}</h3>
        <p className="mb-8 text-muted-foreground">{content}</p>
        <form
          ref={formRef}
          className="flex flex-col gap-4 md:flex-row"
          action={formAction}
        >
          <input
            name="email"
            type="email"
            placeholder={placeholder ?? zodErrors?.email?.[0]}
            aria-invalid={!!zodErrors?.email?.[0]}
            aria-label="כתובת אימייל"
            className={`flex-1 rounded-lg border bg-background px-6 py-4 text-right text-foreground outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-ring ${
              zodErrors?.email?.[0] ? "border-destructive" : "border-border"
            }`}
          />
          <SubmitButton buttonText={buttonText} />
        </form>
        {errorMessage && (
          <p className="mt-4 text-center text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  );
}

export function Subscribe(props: Readonly<SubscribeProps>) {
  return (
    <SnackbarProvider
      maxSnack={3}
      preventDuplicate
      transitionDuration={2000}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <SubscribeInner {...props} />
    </SnackbarProvider>
  );
}
