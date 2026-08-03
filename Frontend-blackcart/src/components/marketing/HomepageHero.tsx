import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CreditCard, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import bannerService, { type HeroBanner } from '../../services/bannerService'
import { getImageUrl } from '../../utils/imageUtils'

const TrustItems = () => (
  <div className="absolute bottom-7 left-6 z-10 hidden items-center gap-7 text-xs font-semibold text-slate-200 sm:flex md:left-10">
    <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Secure Payments</span>
    <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Fast Delivery</span>
  </div>
)

const FallbackHero = () => (
  <section className="relative flex aspect-[4/5] flex-col justify-center overflow-hidden rounded-2xl bg-[#0b1220] px-6 py-8 text-white sm:aspect-auto sm:min-h-[calc(100vh-120px)] sm:px-10 md:py-12 lg:min-h-[calc(100vh-128px)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(37,99,235,0.45),transparent_28%),radial-gradient(circle_at_62%_92%,rgba(249,115,22,0.18),transparent_25%)]" />
    <div className="relative z-10 max-w-[520px]">
      <span className="inline-flex rounded-md bg-orange-500/15 px-3 py-1 text-xs font-bold tracking-wide text-orange-300">PREMIUM TECH ESSENTIALS</span>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Upgrade Your Setup</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-slate-200 sm:text-lg">Premium tech essentials for work, study and everyday use.</p>
      <Link to="/products" className="mt-7 inline-flex h-12 items-center gap-3 rounded-lg bg-[#2563eb] px-6 text-sm font-bold shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">
        Shop Now <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    <TrustItems />
  </section>
)

const bannerAlignment = (banner: HeroBanner) => {
  if (banner.textAlignment === 'center') return 'items-center text-center'
  if (banner.textAlignment === 'right') return 'items-end text-right'
  return 'items-start text-left'
}

const HomepageHero = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const { data: banners = [] } = useQuery({
    queryKey: ['publicBanners', 'homepage'],
    queryFn: () => bannerService.getBanners({ type: 'homepage' }),
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (activeIndex >= banners.length) setActiveIndex(0)
  }, [activeIndex, banners.length])

  useEffect(() => {
    if (banners.length <= 1) return undefined
    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveIndex((index) => (index + 1) % banners.length)
    }, 6_000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  const banner = banners[activeIndex]
  if (!banner) return <FallbackHero />

  const desktopImage = getImageUrl(banner.url)
  const mobileImage = getImageUrl(banner.mobileUrl || banner.url)
  const buttonUrl = banner.buttonUrl || banner.link || '/products'
  const buttonAlignment = banner.textAlignment === 'center' ? 'justify-center' : banner.textAlignment === 'right' ? 'justify-end' : 'justify-start'

  return (
    <section
      aria-label={banner.accessibilityLabel || banner.name || 'Homepage promotion'}
      className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#0b1220] text-white sm:aspect-auto sm:min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-128px)]"
    >
      <picture className="absolute inset-0">
        <source media="(max-width: 639px)" srcSet={mobileImage} />
        <img
          key={desktopImage}
          src={desktopImage}
          alt={banner.altText || banner.name || 'BlackCart promotion'}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </picture>
      {banner.overlayEnabled !== false && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: banner.overlayColor || '#020617',
            opacity: Math.min(90, Math.max(0, banner.overlayOpacity ?? 35)) / 100,
          }}
        />
      )}
      <div className={`relative z-10 flex h-full flex-col justify-center px-6 py-8 sm:min-h-[calc(100vh-120px)] sm:px-10 md:py-12 lg:min-h-[calc(100vh-128px)] ${bannerAlignment(banner)}`} style={{ color: banner.textColor || '#ffffff' }}>
        <div className="max-w-[560px]">
          {banner.headline && <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{banner.headline}</h1>}
          {banner.subheading && <p className="mt-4 text-base leading-7 opacity-90 sm:text-lg">{banner.subheading}</p>}
          <div className={`mt-7 flex flex-wrap gap-3 ${buttonAlignment}`}>
            {banner.buttonText && (
              <Link to={buttonUrl} className="inline-flex h-12 items-center gap-3 rounded-lg bg-[#2563eb] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500">
                {banner.buttonText} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {banner.secondaryButtonText && banner.secondaryButtonUrl && (
              <Link to={banner.secondaryButtonUrl} className="inline-flex h-12 items-center rounded-lg border border-white/50 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">
                {banner.secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2" aria-label="Homepage banner slides">
          {banners.map((item, index) => (
            <button
              key={item._id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show banner ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default HomepageHero
