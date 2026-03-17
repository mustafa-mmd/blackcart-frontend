import React from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const ReturnsPolicy: React.FC = () => {
  const returnConditions = [
    {
      condition: 'Defective or Damaged Product',
      eligible: true,
      timeframe: '14 days from delivery',
      requirements: 'Photos of damage, original packaging'
    },
    {
      condition: 'Wrong Product Shipped',
      eligible: true,
      timeframe: '7 days from delivery',
      requirements: 'Photos of received product'
    },
    {
      condition: 'Change of Mind',
      eligible: true,
      timeframe: '14 days from delivery',
      requirements: 'Unused, original condition, all accessories'
    },
    {
      condition: 'Opened Software/Electronics',
      eligible: false,
      timeframe: 'N/A',
      requirements: 'Non-returnable after opening'
    },
    {
      condition: 'Customized Products',
      eligible: false,
      timeframe: 'N/A',
      requirements: 'Made-to-order items'
    },
    {
      condition: 'Personal Care Items',
      eligible: false,
      timeframe: 'N/A',
      requirements: 'Hygiene and safety reasons'
    }
  ]

  const returnProcess = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Contact customer support or use return portal',
      timeframe: 'Within return window'
    },
    {
      step: 2,
      title: 'Return Authorization',
      description: 'Receive RMA number and instructions',
      timeframe: '1-2 business days'
    },
    {
      step: 3,
      title: 'Package Item',
      description: 'Include all accessories, manuals, and original packaging',
      timeframe: 'Customer responsibility'
    },
    {
      step: 4,
      title: 'Ship Return',
      description: 'Use provided shipping label or arrange return',
      timeframe: '5 days after authorization'
    },
    {
      step: 5,
      title: 'Inspection',
      description: 'Quality check at our warehouse',
      timeframe: '3-5 business days'
    },
    {
      step: 6,
      title: 'Refund/Exchange',
      description: 'Refund processed or exchange shipped',
      timeframe: '3-7 business days'
    }
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
              <RotateCcw className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns & Refunds Policy</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              We want you to be completely satisfied with your purchase. Learn about our return and refund procedures.
            </p>
            <p className="text-sm text-white/60 mt-4">
              14-Day Return Policy for Most Products
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Policy Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-lg mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-1">Return Window</h3>
              <p className="text-gray-600">14 days from delivery date</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-1">Condition</h3>
              <p className="text-gray-600">Unused with original packaging</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <RotateCcw className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-1">Refund Time</h3>
              <p className="text-gray-600">3-7 business days after inspection</p>
            </div>
          </div>
        </motion.div>

        {/* Return Eligibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Return Eligibility</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Condition</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Eligible</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Timeframe</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Requirements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {returnConditions.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800">{item.condition}</span>
                    </td>
                    <td className="py-4 px-4">
                      {item.eligible ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                          <XCircle className="h-4 w-4" />
                          Not Eligible
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.timeframe}</td>
                    <td className="py-4 px-4 text-gray-600">{item.requirements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Return Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Return Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {returnProcess.map((step) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.step * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{step.timeframe}</div>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Refund Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Refund Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Refund Methods</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    <span>Original payment method (3-7 business days)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    <span>Store credit (immediate)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    <span>Bank transfer (5-10 business days)</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Deductions</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full" />
                    <span>Return shipping costs (for change of mind)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full" />
                    <span>Restocking fee for opened electronics (10%)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Exchange Policy</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Exchange Options</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                    <span>Same product, different size/color</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                    <span>Different product of equal or greater value</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                    <span>Price difference refunded or charged</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-1">Important Notes</p>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>Exchange subject to product availability</li>
                      <li>Original shipping costs non-refundable</li>
                      <li>New shipping charges apply for exchanges</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact & Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Returns?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our returns team is here to assist you every step of the way.
            </p>
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong>Returns Department:</strong> returns@blackcart.pk
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> +92 300 1234567 (Ext: 3)
              </p>
              <p className="text-gray-700">
                <strong>RMA Requests:</strong> Visit "My Orders" in your account
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReturnsPolicy