import React, { useState } from 'react'
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
  ChevronUp
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
    { id: 'account', name: 'Account & Security', icon: <Shield className="h-5 w-5" /> },
    { id: 'payment', name: 'Payment Methods', icon: <CreditCard className="h-5 w-5" /> },
  ]

  const faqs = [
    // Ordering & Payment
    {
      id: 1,
      category: 'ordering',
      question: 'How do I place an order?',
      answer: 'You can place an order by browsing products, adding them to cart, and proceeding to checkout. You need to create an account or checkout as guest.'
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
      answer: 'Delivery times vary by location. Within major cities: 2-3 business days. Other cities: 3-7 business days. Remote areas: 7-14 business days.'
    },
    {
      id: 5,
      category: 'shipping',
      question: 'How can I track my order?',
      answer: 'You can track your order using the tracking number sent to your email, or through your account dashboard under "My Orders".'
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
      answer: 'We offer a 14-day return policy for most products. Products must be in original condition with all accessories and packaging.'
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
      answer: 'Yes, we provide technical support for all products sold. Contact our support team via email, phone, or live chat.'
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
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page. Enter your email and follow the instructions sent to your inbox.'
    },
    {
      id: 14,
      category: 'account',
      question: 'How do I update my account information?',
      answer: 'Go to "My Account" → "Profile Settings" to update your personal information, address, and contact details.'
    },
    {
      id: 15,
      category: 'account',
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <HelpCircle className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Find quick answers to common questions about shopping with BlackCart
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                !activeCategory 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                    <span className="text-sm text-gray-500 mt-1">
                      {categories.find(c => c.id === faq.category)?.name}
                    </span>
                  </div>
                  {expandedItems.includes(faq.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedItems.includes(faq.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try searching with different keywords or browse categories</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory(null)
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Still Need Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Contact Support
              </Link>
              <button className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border border-blue-200 transition-colors">
                Live Chat
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link
            to="/shipping-policy"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <Truck className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Shipping Policy</h3>
            </div>
            <p className="text-gray-600">Learn about our shipping methods, delivery times, and costs</p>
          </Link>

          <Link
            to="/returns-policy"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <RotateCcw className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Returns Policy</h3>
            </div>
            <p className="text-gray-600">Understand our return, exchange, and refund procedures</p>
          </Link>

          <Link
            to="/privacy-policy"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Privacy Policy</h3>
            </div>
            <p className="text-gray-600">Read about how we protect your personal information</p>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default FaqPage