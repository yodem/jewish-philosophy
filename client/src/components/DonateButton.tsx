"use client";

import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { DONATE_BUTTON } from "../../consts";

interface DonateButtonProps {
  headline?: string;
  content?: string;
  buttonText?: string;
  className?: string;
}

export default function DonateButton({
  headline = DONATE_BUTTON.HEADLINE,
  content = DONATE_BUTTON.CONTENT,
  buttonText = DONATE_BUTTON.BUTTON_TEXT,
  className = ""
}: DonateButtonProps) {
  return (
    <Card className={`w-full max-w-xl mx-auto px-2 py-8 bg-white/95 rounded-2xl shadow-lg flex flex-col items-center gap-6 p-6 mt-8 bg-gradient-to-tl from-red-50 via-pink-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-red-200 ${className}`}>
      <CardContent className="w-full flex flex-col items-center gap-4 px-0">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <CardTitle className="text-2xl font-semibold text-center">{headline}</CardTitle>
        </div>
        <CardDescription className="text-gray-700 text-center">{content}</CardDescription>
        
        <form action={DONATE_BUTTON.PAYPAL_ACTION_URL} method="post" target="_top" className="w-full flex justify-center mt-2">
          <input type="hidden" name="hosted_button_id" value={DONATE_BUTTON.PAYPAL_BUTTON_ID} />
          <button 
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 cursor-pointer hover:cursor-pointer"
            title={DONATE_BUTTON.TITLE}
          >
            {buttonText}
          </button>
          <img alt="" src={DONATE_BUTTON.PAYPAL_PIXEL_URL} width="1" height="1" />
        </form>
      </CardContent>
    </Card>
  );
}