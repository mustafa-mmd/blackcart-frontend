import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, Headphones, Keyboard, Monitor, Mouse, Music2, RefreshCw, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { productService } from '../services/productService'
import { getBrowsingHistory } from '../utils/browsingHistory'
import ProductRail from '../components/product/ProductRail'
import HomepageHero from '../components/marketing/HomepageHero'

const categoryIcons = [Mouse, Keyboard, Headphones, Monitor, Music2, Sparkles]

const HomePage = () => {
  const history = useMemo(() => getBrowsingHistory(), [])
  const { data: response, isLoading, error, refetch } = useQuery({ queryKey: ['homeSections', history.categorySlugs.join(',')], queryFn: () => productService.getHomeSections({ recentCategories: history.categorySlugs, limit: 12 }), retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false })
  const sections = response?.data
  const categories = sections?.categories.slice(0, 6) ?? []
  const categorySections = sections?.categorySections ?? []
  const features = [{ icon: Truck, title: 'Fast Delivery', text: 'Quick delivery across Pakistan' }, { icon: CreditCard, title: 'Secure Payments', text: '100% secure payment options' }, { icon: RefreshCw, title: 'Easy Returns', text: 'Simple returns and refunds' }, { icon: ShieldCheck, title: 'Quality Products', text: 'Genuine products with warranty' }]
  return <div className="bg-[#f8fafc] text-[#0f172a]">
    <Helmet><title>BlackCart ? Premium Computer Accessories in Pakistan</title><meta name="description" content="Shop premium computer accessories with delivery across Pakistan." /></Helmet>
    <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <HomepageHero />
      <section className="pt-8 md:pt-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold tracking-tight">Shop by Category</h2><Link to="/categories" className="text-sm font-semibold text-[#2563eb]">View All Categories</Link></div><div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-6 md:overflow-visible">{categories.map((category, index) => { const Icon = categoryIcons[index % categoryIcons.length]; const section = categorySections.find(item => item.category.slug === category.slug); const image = section?.products[0]?.images?.[0] || section?.products[0]?.image; const imageUrl = typeof image === 'string' ? image : image?.url; return <Link key={category._id} to={`/categories/${category.slug}`} className="group min-w-[142px] rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md md:min-w-0"><div className="mx-auto flex h-20 items-center justify-center overflow-hidden rounded-lg bg-slate-50">{imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-contain p-2" /> : <Icon className="h-8 w-8 text-[#2563eb]" />}</div><span className="mt-3 block text-sm font-semibold text-slate-900">{category.name}</span></Link> })}</div></section>
    </div>
    {error ? <section className="mx-auto max-w-[1280px] px-4 pb-8 text-center"><div className="rounded-xl border border-slate-200 bg-white p-8"><p className="text-slate-600">Products are temporarily unavailable.</p><button type="button" onClick={() => void refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" /> Try Again</button></div></section> : <><ProductRail id="just-launched" title="Just Launched" subtitle="Discover the latest additions to BlackCart." products={sections?.justLaunched.products ?? []} viewAllUrl="/products?newArrivals=true" isLoading={isLoading} /><ProductRail id="best-offers" title="Best Offers" subtitle="Limited-time deals on tech essentials." products={sections?.bestOffers.products ?? []} viewAllUrl="/products?onSale=true&sort=discountPercentage&order=desc" isLoading={isLoading} backgroundClassName="bg-white" /><ProductRail id="best-sellers" title="Best Sellers" subtitle="Popular picks customers are loving." products={sections?.bestSellers.products ?? []} viewAllUrl="/products?sort=soldCount&order=desc" isLoading={isLoading} /></>}
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8"><div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:p-5">{features.map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3 px-2 py-2"><Icon className="h-7 w-7 shrink-0 text-[#0b1220]" /><div><h2 className="text-sm font-bold">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{text}</p></div></div>)}</div></section>
    {!error && <ProductRail id="recommended-for-you" title="Recommended For You" subtitle="Picked based on your interests." products={sections?.recommended.products ?? []} viewAllUrl="/products" isLoading={isLoading} backgroundClassName="bg-white" />}
  </div>
}

export default HomePage

