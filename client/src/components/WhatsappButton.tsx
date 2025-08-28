import Image from 'next/image';

export default function WhatsappButton() {
  return (
    <a
      href="https://chat.whatsapp.com/ERQpzom4KKSKCdLgxAts6C"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-green-300 via-green-400 to-green-500 hover:from-green-200 hover:via-green-300 hover:to-green-400 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group"
      aria-label="הצטרפו לקבוצת הווטסאפ"
    >
      <Image
        src="/whatsapp.png"
        alt="WhatsApp"
        width={40}
        height={40}
      />
      <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        הצטרפו לקבוצת הווטסאפ!
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-600"></div>
      </div>
    </a>
  );
}
