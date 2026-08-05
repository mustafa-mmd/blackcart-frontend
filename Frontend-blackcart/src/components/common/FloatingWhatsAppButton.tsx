import { useLocation } from 'react-router-dom'
import { BrandIcon } from './BrandIcon'

const WHATSAPP_URL = 'https://wa.me/923146965599'

export function FloatingWhatsAppButton() {
  const { pathname } = useLocation()
  const isProductPage = /^\/products\/[^/]+/.test(pathname)

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with BlackCart.store on WhatsApp at +92 314 696 5599"
      className={`group fixed right-3 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] outline-none transition duration-200 hover:scale-105 hover:bg-[#20bd5a] focus-visible:ring-4 focus-visible:ring-green-200 md:bottom-6 md:right-6 md:h-16 md:w-16 ${isProductPage ? 'bottom-20' : 'bottom-4'}`}
    >
      <BrandIcon brand="whatsapp" className="h-7 w-7 md:h-9 md:w-9" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-gray-950 px-3 py-2 text-sm font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
        Chat on WhatsApp
      </span>
    </a>
  )
}
