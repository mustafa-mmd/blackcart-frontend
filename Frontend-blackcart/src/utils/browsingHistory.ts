const RECENT_PRODUCTS_KEY = 'blackcart_recent_product_ids'
const RECENT_CATEGORIES_KEY = 'blackcart_recent_category_slugs'
const MAX_RECENT_PRODUCTS = 10
const MAX_RECENT_CATEGORIES = 5

export interface BrowsingHistory {
  productIds: string[]
  categorySlugs: string[]
}

const readList = (key: string): string[] => {
  if (typeof window === 'undefined') return []

  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
      : []
  } catch {
    return []
  }
}

const writeList = (key: string, values: string[]) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(values))
  } catch {
    // Browsing history is an optional enhancement; storage may be unavailable.
  }
}

const prependUnique = (values: string[], value: string, maximum: number) => [
  value,
  ...values.filter((item) => item !== value),
].slice(0, maximum)

const normalizeCategorySlug = (value?: string) => {
  if (!value) return ''
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-')
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) ? normalized : ''
}

export const getBrowsingHistory = (): BrowsingHistory => ({
  productIds: readList(RECENT_PRODUCTS_KEY).slice(0, MAX_RECENT_PRODUCTS),
  categorySlugs: readList(RECENT_CATEGORIES_KEY)
    .map(normalizeCategorySlug)
    .filter(Boolean)
    .slice(0, MAX_RECENT_CATEGORIES),
})

export const recordProductView = (productId: string, categorySlug?: string) => {
  const normalizedProductId = productId.trim().slice(0, 100)
  const normalizedCategorySlug = normalizeCategorySlug(categorySlug)

  if (normalizedProductId) {
    writeList(
      RECENT_PRODUCTS_KEY,
      prependUnique(readList(RECENT_PRODUCTS_KEY), normalizedProductId, MAX_RECENT_PRODUCTS),
    )
  }

  if (normalizedCategorySlug) {
    writeList(
      RECENT_CATEGORIES_KEY,
      prependUnique(
        readList(RECENT_CATEGORIES_KEY),
        normalizedCategorySlug,
        MAX_RECENT_CATEGORIES,
      ),
    )
  }
}
