import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Scale, AlertCircle, CheckCircle, XCircle, BookOpen } from 'lucide-react'

const TermsOfService: React.FC = () => {
  const terms = [
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: 'Guest Shopping',
      points: [
        'No customer account or login is required to shop',
        'Provide accurate delivery and contact information at checkout',
        'Keep your order number private for order support',
        'Contact us promptly if order details need correction',
        'Customers must be legally able to place an order'
      ]
    },
    {
      icon: <Scale className="h-6 w-6 text-green-600" />,
      title: 'Product Purchases',
      points: [
        'Prices are subject to change without notice',
        'All prices are in Pakistani Rupees (PKR)',
        'Additional taxes and shipping charges may apply',
        'Product availability is subject to stock',
        'We reserve the right to cancel orders for any reason'
      ]
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
      title: 'Payment Terms',
      points: [
        'Multiple payment methods available (COD, cards, bank transfer)',
        'Payment must be completed before order processing',
        'Refunds processed within 5-7 business days',
        'Chargebacks may result in account suspension',
        'We use secure payment gateways for transactions'
      ]
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-teal-600" />,
      title: 'Shipping & Delivery',
      points: [
        'Normal delivery is PKR 200 and takes 4-6 working days',
        'Express delivery is PKR 350 and takes 2-3 working days',
        'Shipping costs calculated at checkout',
        'Risk of loss transfers upon delivery confirmation',
        'Signature may be required for delivery',
        'We are not responsible for delays beyond our control'
      ]
    },
    {
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      title: 'Returns & Refunds',
      points: [
        '3-day return policy for eligible products',
        'Products must be in original condition',
        'Return shipping may be customer responsibility',
        'Refunds issued to original payment method',
        'Digital products are non-refundable'
      ]
    },
    {
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      title: 'Intellectual Property',
      points: [
        'All website content is owned by BlackCart',
        'Trademarks and logos are proprietary',
        'No unauthorized use of our intellectual property',
        'User-generated content license granted to us',
        'Respect third-party intellectual property rights'
      ]
    }
  ]

  const prohibitedConduct = [
    'Using the service for illegal purposes',
    'Attempting to gain unauthorized access',
    'Uploading viruses or malicious code',
    'Harassing other users',
    'Impersonating others',
    'Violating any laws or regulations'
  ]

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
              <Scale className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Please read these terms carefully before using our website or services.
            </p>
            <p className="text-sm text-white/60 mt-4">
              Effective Date: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Agreement Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-lg mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing or using BlackCart's website and services, you agree to be bound by these Terms of Service. 
            If you disagree with any part of these terms, you may not access our services.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Important:</strong> These terms constitute a legal agreement between you and BlackCart. 
              We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.
            </p>
          </div>
        </motion.div>

        {/* Main Terms */}
        <div className="space-y-8">
          {terms.map((term, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {term.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{term.title}</h2>
                </div>
              </div>
              
              <ul className="space-y-3">
                {term.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Prohibited Conduct */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 bg-white rounded-xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Prohibited Conduct</h2>
          <p className="text-gray-600 mb-6">
            You agree not to engage in any of the following prohibited activities:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prohibitedConduct.map((conduct, index) => (
              <div key={index} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-gray-700">{conduct}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Violation:</strong> We reserve the right to suspend or terminate your account and access to our services 
              for any violation of these terms.
            </p>
          </div>
        </motion.div>

        {/* Limitation of Liability & Termination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Limitation of Liability</h3>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, BlackCart shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages resulting from your use of or inability to use our services.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                <span>Maximum liability limited to purchase price</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                <span>Not liable for third-party services</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                <span>No liability for force majeure events</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Termination</h3>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                Upon termination, your right to use our services will immediately cease. If you wish to terminate 
                your account, you may simply discontinue using our services or contact us to delete your account.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Governing Law</h3>
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              These Terms shall be governed and construed in accordance with the laws of Pakistan, 
              without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-700">
              Any disputes arising under or in connection with these Terms shall be subject to the 
              exclusive jurisdiction of the courts located in Peshawar, Pakistan.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TermsOfService
