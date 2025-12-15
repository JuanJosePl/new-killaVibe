import { MessageCircle, Instagram } from "lucide-react"

export function SocialLinks() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp */}
      <a
        href="https://wa.me/message/O4FKBMAABGC5L1"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/killavibes_/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Seguir en Instagram"
      >
        <Instagram className="h-7 w-7" />
      </a>

      {/* Threads */}
      <a
        href="https://www.threads.com/@killavibes_"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl dark:bg-white dark:text-black"
        aria-label="Seguir en Threads"
      >
        <span className="text-xl font-bold">@</span>
      </a>
    </div>
  )
}
