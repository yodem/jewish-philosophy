import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WhatsappButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href="https://chat.whatsapp.com/IH4Mn5TnlowKxbW2cPL7x0?mode=ems_wa_t"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-green-300 via-green-400 to-green-500 hover:from-green-200 hover:via-green-300 hover:to-green-400 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          aria-label="הצטרפו לקבוצת הווטסאפ"
        >
          <Image
            src="/whatsapp.png"
            alt="WhatsApp"
            width={40}
            height={40}
          />
        </a>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-gray-600 text-white border-gray-600">
        <p>הצטרפו לקבוצת הווטסאפ!</p>
      </TooltipContent>
    </Tooltip>
  );
}
