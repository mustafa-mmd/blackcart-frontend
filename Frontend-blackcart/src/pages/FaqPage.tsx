
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  HelpCircle, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  Shield,
  Package,
  RotateCcw,
  ChevronDown,
  Mail,
  MessageSquare
} from 'lucide-react'
import { Link } from 'react-router-dom'

const FaqPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleItem = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const categories = [
    { id: 'ordering', name: 'Ordering & Payment', icon: <ShoppingBag className="h-5 w-5" /> },
    { id: 'shipping', name: 'Shipping & Delivery', icon: <Truck className="h-5 w-5" /> },
    { id: 'returns', name: 'Returns & Refunds', icon: <RotateCcw className="h-5 w-5" /> },
    { id: 'products', name: 'Products & Warranty', icon: <Package className="h-5 w-5" /> },
    { id: 'payment', name: 'Payment Methods', icon: <CreditCard className="h-5 w-5" /> },
  ]

  const faqs = [
    // Ordering & Payment
    {
      id: 1,
      category: 'ordering',
      question: 'How do I place an order?',
      answer: 'Browse products, add them to your cart, and proceed to checkout. No customer account or login is required.'
    },
    {
      id: 2,
      category: 'ordering',
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery, Credit/Debit Cards (Visa, MasterCard), Bank Transfers, and Mobile Wallets (JazzCash, Easypaisa).'
    },
    {
      id: 3,
      category: 'ordering',
      question: 'Is it safe to use my credit card on your website?',
      answer: 'Yes, we use SSL encryption and secure payment gateways to ensure your payment information is protected.'
    },

    // Shipping & Delivery
    {
      id: 4,
      category: 'shipping',
      question: 'How long does delivery take?',
      answer: 'Choose Normal Delivery for PKR 200 (4-6 working days) or Express Delivery for PKR 350 (2-3 working days) at checkout.'
    },
    {
      id: 5,
      category: 'shipping',
      question: 'How can I track my order?',
      answer: 'Use the tracking number sent to your email on our Track Order page or on the courier website.'
    },
    {
      id: 6,
      category: 'shipping',
      question: 'Do you deliver outside Pakistan?',
      answer: 'Currently, we only deliver within Pakistan. We are working on expanding our international delivery options.'
    },

    // Returns & Refunds
    {
      id: 7,
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'Eligible products can be returned within 3 days of delivery. Products must be unused and in original condition with all accessories and packaging.'
    },
    {
      id: 8,
      category: 'returns',
      question: 'How long do refunds take?',
      answer: 'Refunds are processed within 5-7 business days after we receive the returned item. The time to appear in your account depends on your bank.'
    },
    {
      id: 9,
      category: 'returns',
      question: 'Who pays for return shipping?',
      answer: 'For defective or incorrect items, we cover return shipping. For change of mind returns, the customer pays return shipping.'
    },

    // Products & Warranty
    {
      id: 10,
      category: 'products',
      question: 'Do products come with warranty?',
      answer: 'Yes, most products come with manufacturer warranty. Laptops typically have 1-3 years warranty, accessories 6 months to 1 year.'
    },
    {
      id: 11,
      category: 'products',
      question: 'Can I get technical support for products?',
      answer: 'Yes. Contact our support team at blackcart.ak25@gmail.com, +92 314 696 5599, or WhatsApp.'
    },
    {
      id: 12,
      category: 'products',
      question: 'Are your products genuine/original?',
      answer: 'We only sell 100% genuine products from authorized distributors and manufacturers.'
    },

    // Account & Security
    {
      id: 13,
      category: 'ordering',
      question: 'Do I need an account to shop?',
      answer: 'No. BlackCart.store supports guest shopping and checkout without a customer login.'
    },
    {
      id: 14,
      category: 'ordering',
      question: 'How do I correct my order contact information?',
      answer: 'Contact us at blackcart.ak25@gmail.com or +92 3146965599 as soon as possible.'
    },
    {
      id: 15,
      category: 'ordering',
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information.'
    },

    // Payment Methods
    {
      id: 16,
      category: 'payment',
      question: 'Is Cash on Delivery available?',
      answer: 'Yes, Cash on Delivery is available for most locations in Pakistan. Minimum order amount may apply.'
    },
    {
      id: 17,
      category: 'payment',
      question: 'Do you offer installment plans?',
      answer: 'Yes, we offer installment plans through selected banks. Check the product page for available installment options.'
    },
    {
      id: 18,
      category: 'payment',
      question: 'Can I pay via bank transfer?',
      answer: 'Yes, you can pay via bank transfer. Our account details will be provided at checkout. Order will be shipped after payment confirmation.'
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !activeCategory || faq.category === activeCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Frequently Asked Questions | BlackCart Pakistan</title>
        <meta name="description" content="Find answers to common questions about shopping at BlackCart.store: orders, payments, delivery, and returns. Quick help for Pakistani customers." />
        <meta property="og:title" content="FAQ | BlackCart Pakistan" />
        <meta property="og:description" content="Answers to your questions about BlackCart orders, payments, delivery across Pakistan, and easy returns." />
        <meta property="og:url" content="https://blackcart.store/faq" />
        <link rel="canonical" href="https://blackcart.store/faq" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <span className="bg-blue-600/30 text-blue-200 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-3 inline-block border border-blue-500/20">
              Help Center
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light mb-8">
              Quickly find answers to your questions or browse through popular topics below.
            </p>

            {/* Search Bar */}
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for questions, keywords, or topics..."
                className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-2xl shadow-lg border-0 outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm sticky top-24">
            <h3 className="text-base font-bold text-gray-900 mb-4 px-2 uppercase tracking-wider text-xs text-gray-400">
              Browse Categories
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  !activeCategory 
                    ? 'bg-blue-50 text-blue-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <HelpCircle className="h-5 w-5" />
                <span>All Categories</span>
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={activeCategory === category.id ? 'text-blue-600' : 'text-gray-400'}>
                    {category.icon}
                  </span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - Accordion list */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
                {activeCategory 
                  ? categories.find(c => c.id === activeCategory)?.name 
                  : 'Popular Questions'}
              </h2>
              
              <div className="divide-y divide-gray-100">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map(faq => {
                    const isExpanded = expandedItems.includes(faq.id)
                    return (
                      <div key={faq.id} className="py-4.5 first:pt-0 last:pb-0">
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="flex justify-between items-start gap-4 w-full text-left font-bold text-gray-800 hover:text-blue-600 transition-colors text-base md:text-lg"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown className={`h-5 w-5 text-gray-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 p-4 bg-gray-50/60 border border-gray-100 rounded-2xl text-gray-600 text-sm leading-relaxed">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-6">Try searching with different keywords or select a category.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setActiveCategory(null)
                      }}
                      className="bg-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Still Need Help Support Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  If you cannot find the answer to your question, feel free to contact our support desk. We are online during business hours!
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link
                  to="/contact"
                  className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl transition"
                >
                  Message Form
                </Link>
                <a
                  href="https://wa.me/923146965599"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center gap-2"
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Help Guides / Quick Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/shipping-policy"
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col h-full group"
              >
                <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <Truck className="h-6 w-6" />
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Shipping Policy</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Detailed info on delivery locations, shipping fees (Express/Normal), and timeline estimates.</p>
              </Link>

              <Link
                to="/returns-policy"
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col h-full group"
              >
                <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <RotateCcw className="h-6 w-6" />
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Returns Policy</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Easy step-by-step procedure to return products within our 3-day eligible policy window.</p>
              </Link>

              <Link
                to="/privacy-policy"
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col h-full group"
              >
                <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <Shield className="h-6 w-6" />
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Privacy Policy</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Learn how we securely encrypt transactions and protect your personal information at BlackCart.</p>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default FaqPage
