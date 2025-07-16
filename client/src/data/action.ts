"use server";

import z from "zod";
import { subscribeService } from "./services";

const subscribeSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

export async function subscribeAction(prevState: any, formData: FormData) {
  const validatedFields = subscribeSchema.safeParse({
    email: formData.get("email"),
  });

    if (!validatedFields.success) {

    console.dir(validatedFields.error.flatten().fieldErrors, { depth: null})

    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: null,
    };
  }
  const response = await subscribeService(validatedFields.data.email);

  if (!response.data) {
    return {
      ...prevState,
      strapiErrors: response.error.message,
      errorMessage: "Oops! Something went wrong. Please try again.",
    };
  }

  if (response.data.error) {
    return {
      ...prevState,
      strapiErrors: response.data.error.message,
      errorMessage: "Oops! Something went wrong. Please try again.",
    };
  }

  return {
    ...prevState,
    successMessage: "You've been added to the newsletter!",
    zodErrors: null,
    strapiErrors: null,
    errorMessage: null,
  }
}
  