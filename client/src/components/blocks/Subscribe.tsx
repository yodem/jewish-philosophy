"use client";
import { subscribeAction } from "@/data/action";
import type { SubscribeProps } from "@/types";
import { useActionState } from "react";

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
    <section className="w-1/2 px-6 py-12 bg-white rounded-lg shadow-md flex flex-col md:flex-row items-center gap-8">
      <div className="flex-1 mb-6 md:mb-0">
        <h4 className="text-2xl font-semibold mb-2">{headline}</h4>
        <p className="text-gray-700">{content}</p>
      </div>
      <form className="flex flex-col sm:flex-row items-stretch gap-3 flex-1" action={formAction}>
        <input
          name="email"
          type="email"
          placeholder={placeholder ?? zodErrors?.email?.[0]}
          className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition ${zodErrors?.email?.[0] ? "border-red-500" : ""}`}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-cyan-500 cursor-pointer hover:bg-cyan-600 text-white font-semibold rounded-md transition"
        >
          {buttonText}
        </button>
      </form>
      {errorMessage && (
        <p className="mt-2 text-red-600 text-sm" role="alert">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="mt-2 text-green-600 text-sm" role="status">{successMessage}</p>
      )}
    </section>
  );
}
