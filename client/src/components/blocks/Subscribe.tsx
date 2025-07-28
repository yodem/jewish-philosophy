"use client";
import { subscribeAction } from "@/data/action";
import type { SubscribeProps } from "@/types";
import { useActionState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "../ui/card";
import { SnackbarProvider, useSnackbar } from 'notistack';
import React from "react";
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

  // Show notifications on submit
  React.useEffect(() => {
    if (successMessage) {
      enqueueSnackbar(successMessage, { variant: 'success' });
      // Track successful newsletter signup
      const formData = new FormData(document.querySelector('form') as HTMLFormElement);
      const email = formData.get('email') as string;
      if (email) {
        trackNewsletterSignup(email);
      }
    }
    if (errorMessage) {
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  }, [successMessage, errorMessage, enqueueSnackbar]);

  return (

    <Card className="w-full max-w-xl mx-auto px-2 py-8 bg-white/95 rounded-2xl shadow-lg flex flex-col items-center gap-6  p-6 mt-8 bg-gradient-to-tl from-zinc-200 via-stone-100 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-gray-200">
      <CardContent className="w-full flex flex-col items-center gap-2 px-0">
        <CardTitle className="text-2xl font-semibold mb-1 text-center">{headline}</CardTitle>
        <CardDescription className="text-gray-700 mb-4 text-center">{content}</CardDescription>
        <form className="w-full flex flex-col sm:flex-row items-stretch gap-3" action={formAction}>
          <Input
            name="email"
            type="email"
            placeholder={placeholder ?? zodErrors?.email?.[0]}
            aria-invalid={!!zodErrors?.email?.[0]}
            className={zodErrors?.email?.[0] ? "border-red-500" : ""}
          />
          <Button type="submit" className="w-full sm:w-auto px-6 py-2">
            {buttonText}
          </Button>
        </form>
        {errorMessage && (
          <p className="mt-2 text-red-600 text-sm text-center w-full" role="alert">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="mt-2 text-green-600 text-sm text-center w-full" role="status">{successMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function Subscribe(props: Readonly<SubscribeProps>) {
  return (
    <SnackbarProvider maxSnack={3} preventDuplicate transitionDuration={2000} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <SubscribeInner {...props} />
    </SnackbarProvider>
  );
}
