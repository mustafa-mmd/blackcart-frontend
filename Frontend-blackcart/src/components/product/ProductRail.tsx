import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { StorefrontProduct } from '../../types'
import ProductCard from './ProductCard'

export interface ProductRailCategory {
  _id: string
  name: string
  slug: string
}

interface ProductRailProps {
  id: string
  title: string
  subtitle?: string
  products: StorefrontProduct[]
  viewAllUrl: string
  viewAllLabel?: string
  isLoading?: boolean
  categories?: ProductRailCategory[]
  selectedCategory?: string
  onCategoryChange?: (slug: string) => void
  backgroundClassName?: string
  emptyState?: string
}

const railItemClass = 'w-full shrink-0 basis-[62%] snap-start sm:basis-[44%] md:basis-[31%] xl:basis-[calc((100%-4.5rem)/4)]'

const ProductRail = ({
  id,
  title,
  subtitle,
  products,
  viewAllUrl,
  viewAllLabel,
  isLoading = false,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  backgroundClassName = 'bg-white',
  emptyState,
}: ProductRailProps) => {
  const railRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrowState = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const maximumScroll = rail.scrollWidth - rail.clientWidth
    setCanScrollLeft(rail.scrollLeft > 4)
    setCanScrollRight(maximumScroll - rail.scrollLeft > 4)
  }, [])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const scheduleArrowUpdate = () => {
      if (animationFrameRef.current !== null) return
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null
        updateArrowState()
      })
    }

    const resizeObserver = new ResizeObserver(scheduleArrowUpdate)
    resizeObserver.observe(rail)
    rail.addEventListener('scroll', scheduleArrowUpdate, { passive: true })
    scheduleArrowUpdate()

    return () => {
      resizeObserver.disconnect()
      rail.removeEventListener('scroll', scheduleArrowUpdate)
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [products.length, updateArrowState])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollTo({ left: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [selectedCategory])

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current
    if (!rail) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.94,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  if (!isLoading && products.length === 0 && !emptyState) return null

  const resolvedViewAllLabel = viewAllLabel || `View All ${title}`

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`overflow-x-clip py-10 md:py-14 ${backgroundClassName}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
          <div className="min-w-0">
            <h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-gray-600 md:text-base">{subtitle}</p>}
          </div>
          <Link
            to={viewAllUrl}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-blue-700 outline-none transition hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 md:text-base"
            aria-label={resolvedViewAllLabel}
          >
            View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {categories.length > 0 && onCategoryChange && (
          <div
            className="mb-6 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={`${title} categories`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'all'}
              onClick={() => onCategoryChange('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                selectedCategory === 'all'
                  ? 'bg-gray-950 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category.slug}
                onClick={() => onCategoryChange(category.slug)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  selectedCategory === category.slug
                    ? 'bg-gray-950 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {emptyState && !isLoading && products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-gray-600">
            {emptyState}
          </div>
        ) : (
          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              disabled={!canScrollLeft}
              className="absolute -left-5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-lg outline-none transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-0 md:flex"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              disabled={!canScrollRight}
              className="absolute -right-5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-lg outline-none transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-0 md:flex"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>

            <div
              ref={railRef}
              className="flex min-w-0 snap-x snap-proximity gap-4 overflow-x-auto overflow-y-visible scroll-smooth pb-4 pr-4 [overscroll-behavior-inline:contain] [scrollbar-width:none] md:gap-6 md:pr-0 motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
              aria-label={`${title} products`}
            >
              {isLoading
                ? Array.from({ length: 5 }, (_, index) => (
                    <div key={index} className={railItemClass} aria-hidden="true">
                      <div className="min-h-[22rem] animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="aspect-square bg-gray-200" />
                        <div className="space-y-3 p-4">
                          <div className="h-3 w-1/3 rounded bg-gray-200" />
                          <div className="h-5 w-5/6 rounded bg-gray-200" />
                          <div className="h-4 w-2/3 rounded bg-gray-200" />
                          <div className="h-10 rounded-lg bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  ))
                : products.map((product, index) => (
                    <div key={product._id} className={`${railItemClass} [&>*]:h-full`}>
                      <ProductCard product={product} index={index} compact />
                    </div>
                  ))}

              {!isLoading && (
                <div className={railItemClass}>
                  <Link
                    to={viewAllUrl}
                    className="flex min-h-[22rem] h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 text-center text-blue-800 outline-none transition hover:border-blue-400 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    aria-label={resolvedViewAllLabel}
                  >
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-md">
                      <ArrowRight className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="text-lg font-bold">View All</span>
                    <span className="mt-1 text-sm text-blue-700">{title}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductRail
