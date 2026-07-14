import { Link } from 'react-router-dom'
import type { HeroBanner } from '../../services/bannerService'

interface InlinePromoBannerProps {
  banner?: HeroBanner
}

const resolveBannerUrl = (url: string) => {
  if (url.startsWith('http')) return url
  const apiBase = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com'
  return `${apiBase}${url}`
}

const InlinePromoBanner = ({ banner }: InlinePromoBannerProps) => {
  if (!banner) return null

  const desktopUrl = resolveBannerUrl(banner.url)
  const mobileUrl = resolveBannerUrl(banner.mobileUrl || banner.url)
  const artwork = (
    <div className="relative h-[min(70vh,34rem)] overflow-hidden rounded-2xl bg-slate-950 md:h-auto md:aspect-[16/5]">
      <img
        src={mobileUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl md:hidden"
      />
      <picture className="relative block h-full w-full">
        <source media="(max-width: 767px)" srcSet={mobileUrl} />
        <img
          src={desktopUrl}
          alt={banner.title || 'BlackCart promotion'}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain md:object-cover"
        />
      </picture>
    </div>
  )

  return (
    <aside className="bg-gray-50 py-6 md:py-8" aria-label={banner.title || 'BlackCart promotion'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {banner.link ? (
          banner.link.startsWith('http') ? (
            <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
              {artwork}
            </a>
          ) : (
            <Link to={banner.link} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
              {artwork}
            </Link>
          )
        ) : artwork}
      </div>
    </aside>
  )
}

export default InlinePromoBanner
