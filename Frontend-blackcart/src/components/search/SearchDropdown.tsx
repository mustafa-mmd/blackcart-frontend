// src/components/search/SearchDropdown.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ChevronRight,
  Package,
  Tag,
  Loader2,
  ArrowUpRight,
} from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'
import { productService } from '../../services/productService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SuggestionProduct {
  _id: string
  name: string
  slug: string
  price: number
  discountPrice: number | null
  image: string | null
  brand: string
  rating: number
  numReviews: number
  inStock: boolean
  category: string
  categorySlug: string
}

interface SuggestionCategory {
  _id: string
  name: string
  slug: string
  image?: string
  description?: string
}

interface SearchDropdownProps {
  /** Pass true to render as the full mobile search page — no absolute positioning */
  isMobilePage?: boolean
  onClose?: () => void
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const RECENT_KEY = 'blackcart_recent_searches'
const MAX_RECENT = 6

const TRENDING_SEARCHES = ['Mouse', 'Keyboard', 'Headphones', 'Laptop', 'Monitor', 'USB Hub']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRecent(term: string) {
  const prev = loadRecent().filter((t) => t.toLowerCase() !== term.toLowerCase())
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)))
}

function removeRecent(term: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(loadRecent().filter((t) => t !== term)))
}

function getFullImageUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholder.png'
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com'
  return `${base}${url}`
}

function formatPrice(price: number): string {
  return `PKR ${price.toLocaleString('en-PK')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

const SearchDropdown: React.FC<SearchDropdownProps> = ({ isMobilePage = false, onClose }) => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [recent, setRecent] = useState<string[]>(loadRecent)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const [results, setResults] = useState<{
    products: SuggestionProduct[]
    categories: SuggestionCategory[]
    total: number
  }>({ products: [], categories: [], total: 0 })

  const debouncedQuery = useDebounce(query, 300)

  // ── Fetch suggestions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 1) {
      setResults({ products: [], categories: [], total: 0 })
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    ;(async () => {
      try {
        // Use getSearchSuggestions if available, else fall back to searchProducts
        const svc = productService as any
        let data: { products: SuggestionProduct[]; categories: SuggestionCategory[]; total: number }

        if (typeof svc.getSearchSuggestions === 'function') {
          const res = await svc.getSearchSuggestions(debouncedQuery, 6)
          data = res.success ? res.data : { products: [], categories: [], total: 0 }
        } else {
          // Fallback: regular search, normalize shape
          const res = await productService.searchProducts(debouncedQuery, { limit: 6 })
          const rawProducts = res.data?.products || []
          data = {
            products: rawProducts.slice(0, 6).map((p: any) => ({
              _id: p._id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              discountPrice: p.discountPrice || null,
              image: p.images?.[0]?.url || null,
              brand: p.brand,
              rating: p.rating || 0,
              numReviews: p.numReviews || 0,
              inStock: p.stock > 0,
              category: p.category || 'Uncategorized',
              categorySlug: p.categorySlug || '',
            })),
            categories: [],
            total: res.data?.pagination?.total || rawProducts.length,
          }
        }

        if (!cancelled) {
          setResults(data)
          setIsLoading(false)
          setActiveIndex(-1)
        }
      } catch {
        if (!cancelled) {
          setResults({ products: [], categories: [], total: 0 })
          setIsLoading(false)
        }
      }
    })()

    return () => { cancelled = true }
  }, [debouncedQuery])

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMobilePage) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isMobilePage])

  // ── Auto-focus on mobile page ──────────────────────────────────────────────
  useEffect(() => {
    if (isMobilePage) setTimeout(() => inputRef.current?.focus(), 80)
  }, [isMobilePage])

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const goToResults = useCallback(
    (term: string) => {
      if (!term.trim()) return
      saveRecent(term.trim())
      setRecent(loadRecent())
      setIsFocused(false)
      setQuery('')
      onClose?.()
      navigate(`/products?search=${encodeURIComponent(term.trim())}`)
    },
    [navigate, onClose]
  )

  const goToProduct = useCallback(
    (slug: string) => {
      setIsFocused(false)
      setQuery('')
      onClose?.()
      navigate(`/products/${slug}`)
    },
    [navigate, onClose]
  )

  const goToCategory = useCallback(
    (slug: string) => {
      setIsFocused(false)
      setQuery('')
      onClose?.()
      navigate(`/categories/${slug}`)
    },
    [navigate, onClose]
  )

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const flatItems: Array<
    { type: 'product'; data: SuggestionProduct } | { type: 'category'; data: SuggestionCategory }
  > = [
    ...results.products.map((p) => ({ type: 'product' as const, data: p })),
    ...results.categories.map((c) => ({ type: 'category' as const, data: c })),
  ]

  const hasResults = results.products.length > 0 || results.categories.length > 0
  // +1 for the "View all results" row
  const maxIdx = flatItems.length > 0 ? flatItems.length : -1

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, maxIdx))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex === flatItems.length) {
        goToResults(query)
      } else if (activeIndex >= 0) {
        const item = flatItems[activeIndex]
        if (item.type === 'product') goToProduct((item.data as SuggestionProduct).slug)
        else goToCategory((item.data as SuggestionCategory).slug)
      } else {
        goToResults(query)
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) goToResults(query)
  }

  const clearQuery = () => {
    setQuery('')
    setResults({ products: [], categories: [], total: 0 })
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation()
    removeRecent(term)
    setRecent(loadRecent())
  }

  // ── Highlight matched text ─────────────────────────────────────────────────
  const highlight = (text: string, term: string) => {
    if (!term.trim()) return <span>{text}</span>
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    const parts = text.split(regex)
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-yellow-100 text-yellow-800 rounded-sm px-0.5 font-semibold not-italic"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    )
  }

  const renderStars = (rating: number) => (
    <span className="text-amber-400 text-xs">
      {'★'.repeat(Math.floor(rating))}
      {'☆'.repeat(5 - Math.floor(rating))}
    </span>
  )

  // ── Visibility ────────────────────────────────────────────────────────────
  const isOpen = isMobilePage || isFocused
  const showEmpty = isOpen && !query.trim()
  const showResults = isOpen && query.trim().length > 0

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={`relative ${
        isMobilePage ? 'w-full' : 'hidden lg:flex flex-1 max-w-xl mx-6 items-center'
      }`}
    >
      {/* ── Input ── */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1) }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands, categories…"
            autoComplete="off"
            aria-label="Search products"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className={`
              w-full pl-9 pr-9 py-2.5 text-sm
              border border-gray-300 rounded-xl
              bg-gray-50 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              focus:bg-white transition-all duration-200
              ${isMobilePage ? 'text-base py-3' : ''}
            `}
          />
          <div className="absolute right-3 flex items-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={clearQuery}
                aria-label="Clear search"
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className={`
            bg-white overflow-hidden
            ${isMobilePage
              ? 'relative mt-3 rounded-2xl border border-gray-100 shadow-md'
              : 'absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border border-gray-200 z-[9999]'
            }
          `}
        >
          {/* ── EMPTY STATE ── */}
          {showEmpty && (
            <div className="py-3">
              {recent.length > 0 && (
                <section className="mb-1">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Recent searches
                    </span>
                    <button
                      onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]) }}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  {recent.map((term) => (
                    <div
                      key={term}
                      onClick={() => goToResults(term)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2.5 text-sm text-gray-700 min-w-0">
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{term}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemoveRecent(e, term)}
                        aria-label={`Remove "${term}" from recent`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 ml-2 shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 mx-4 mt-1 mb-2" />
                </section>
              )}

              <section>
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Trending now
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => goToResults(term)}
                      className="
                        px-3 py-1.5 text-xs rounded-full font-medium
                        bg-gray-100 text-gray-700
                        hover:bg-blue-50 hover:text-blue-700
                        border border-gray-200 hover:border-blue-200
                        transition-all duration-150
                      "
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── LIVE RESULTS ── */}
          {showResults && (
            <div>
              {/* Loading skeleton */}
              {isLoading && !hasResults && (
                <div className="py-3 px-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-11 h-11 rounded-lg bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-16 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* No results */}
              {!isLoading && !hasResults && (
                <div className="py-10 text-center">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">
                    No results for <span className="font-bold text-gray-900">"{query}"</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">
                    Try different keywords or browse all categories
                  </p>
                  <button
                    onClick={() => navigate('/categories')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
                  >
                    Browse all categories <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Product results */}
              {results.products.length > 0 && (
                <section>
                  <div className="px-4 pt-3 pb-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      Products
                      {results.total > results.products.length && (
                        <span className="ml-1 text-gray-400 normal-case font-normal">
                          ({results.total.toLocaleString()} total)
                        </span>
                      )}
                    </span>
                  </div>

                  {results.products.map((product, idx) => {
                    const isActive = activeIndex === idx
                    const imgSrc = imgErrors[product._id]
                      ? '/images/placeholder.png'
                      : getFullImageUrl(product.image)

                    return (
                      <div
                        key={product._id}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => goToProduct(product.slug)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                          ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        `}
                      >
                        {/* Image */}
                        <div className="w-11 h-11 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={() =>
                              setImgErrors((prev) => ({ ...prev, [product._id]: true }))
                            }
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate leading-snug">
                            {highlight(product.name, query)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-gray-500 truncate max-w-[80px]">
                              {product.brand}
                            </span>
                            {product.numReviews > 0 && (
                              <>
                                <span className="text-gray-300 text-xs">·</span>
                                {renderStars(product.rating)}
                                <span className="text-xs text-gray-400">
                                  ({product.numReviews})
                                </span>
                              </>
                            )}
                            {!product.inStock && (
                              <>
                                <span className="text-gray-300 text-xs">·</span>
                                <span className="text-xs text-red-500 font-medium">
                                  Out of stock
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          {product.discountPrice ? (
                            <>
                              <p className="text-sm font-semibold text-green-600">
                                {formatPrice(product.discountPrice)}
                              </p>
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </section>
              )}

              {/* Category results */}
              {results.categories.length > 0 && (
                <section>
                  {results.products.length > 0 && (
                    <div className="border-t border-gray-100 mx-4" />
                  )}
                  <div className="px-4 pt-3 pb-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Categories
                    </span>
                  </div>

                  {results.categories.map((cat, idx) => {
                    const itemIdx = results.products.length + idx
                    const isActive = activeIndex === itemIdx

                    return (
                      <div
                        key={cat._id}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => goToCategory(cat.slug)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                          ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        `}
                      >
                        <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {cat.image ? (
                            <img
                              src={getFullImageUrl(cat.image)}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <Tag className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {highlight(cat.name, query)}
                          </p>
                          {cat.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                      </div>
                    )
                  })}
                </section>
              )}

              {/* View all results row */}
              {hasResults && !isLoading && (
                <>
                  <div className="border-t border-gray-100 mx-4" />
                  <div
                    role="option"
                    aria-selected={activeIndex === flatItems.length}
                    onClick={() => goToResults(query)}
                    className={`
                      flex items-center justify-between px-4 py-3 cursor-pointer transition-colors
                      ${activeIndex === flatItems.length ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <span className="text-sm font-medium text-blue-600">
                      View all results for{' '}
                      <span className="font-bold">"{query}"</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      {results.total > 0 && (
                        <span className="text-xs text-gray-500">
                          {results.total.toLocaleString()} products
                        </span>
                      )}
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchDropdown