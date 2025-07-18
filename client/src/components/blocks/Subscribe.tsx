"use client";
import { subscribeAction } from "@/data/action";
import type { SubscribeProps } from "@/types";
import { useActionState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "../ui/card";

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

export function Subscribe({
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

  return (
    <Card className="w-full max-w-xl mx-auto px-2 py-8 bg-white/95 rounded-2xl shadow-lg flex flex-col items-center gap-6 border-0">
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
