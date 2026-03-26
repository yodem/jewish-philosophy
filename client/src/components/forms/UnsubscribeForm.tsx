"use client";

import { unsubscribeAction } from "@/data/action";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { SnackbarProvider, useSnackbar } from 'notistack';
import React from "react";

interface UnsubscribeState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
}

const INITIAL_STATE: UnsubscribeState = {
  zodErrors: null,
  strapiErrors: "",
  errorMessage: "",
  successMessage: "",
};

function UnsubscribeFormInner() {
  const [formState, formAction] = useActionState(
    unsubscribeAction,
    INITIAL_STATE
  );

  const zodErrors = formState?.zodErrors;
  const errorMessage = formState?.errorMessage || formState?.strapiErrors;
  const successMessage = formState?.successMessage;
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (successMessage) {
      enqueueSnackbar(successMessage, { variant: 'success' });
    }
    if (errorMessage) {
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  }, [successMessage, errorMessage, enqueueSnackbar]);

  return (
    <Card className="w-full max-w-md mx-auto bg-card/95 shadow-lg">
      <CardContent className="p-6">
        <CardTitle className="text-xl font-semibold mb-2 text-center text-foreground">
          ביטול מנוי
        </CardTitle>
        <CardDescription className="text-muted-foreground mb-6 text-center">
          הזינו את כתובת האימייל שלכם לביטול המנוי
        </CardDescription>

        <form className="space-y-4" action={formAction}>
          <div>
            <Input
              name="email"
              type="email"
              placeholder={zodErrors?.email?.[0] || "כתובת אימייל"}
              aria-invalid={!!zodErrors?.email?.[0]}
              className={zodErrors?.email?.[0] ? "border-destructive" : ""}
              dir="ltr"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            ביטול מנוי
          </Button>
        </form>

        {errorMessage && (
          <p className="mt-4 text-destructive text-sm text-center" role="alert">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm text-center">
              {successMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UnsubscribeForm() {
  return (
    <SnackbarProvider
      maxSnack={3}
      preventDuplicate
      transitionDuration={2000}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <UnsubscribeFormInner />
    </SnackbarProvider>
  );
}
