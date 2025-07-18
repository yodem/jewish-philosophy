"use server";

import z from "zod";
import { subscribeService } from "./services";

const subscribeSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

interface SubscribeState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
}

export async function subscribeAction(prevState: SubscribeState, formData: FormData) {
  const validatedFields = subscribeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: "",
      errorMessage: "",
      successMessage: "",
    };
  }
  const response = await subscribeService(validatedFields.data.email);

  if (!response.data) {
    return {
      ...prevState,
      strapiErrors: response.error.message || "Unknown error",
      errorMessage: "Oops! Something went wrong. Please try again.",
      successMessage: "",
    };
  }

  if (response.data.error) {
    return {
      ...prevState,
      strapiErrors: response.data.error.message || "Unknown error",
      errorMessage: "Oops! Something went wrong. Please try again.",
      successMessage: "",
    };
  }

  return {
    ...prevState,
    successMessage: "You've been added to the newsletter!",
    zodErrors: null,
    strapiErrors: "",
    errorMessage: "",
  };
}
  