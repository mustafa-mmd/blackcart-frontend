import React from 'react'
import { motion } from 'framer-motion'
import { Truck, Package, Clock, MapPin, Shield, AlertCircle } from 'lucide-react'

const ShippingPolicy: React.FC = () => {
  const shippingOptions = [
    {
      icon: <Truck className="h-6 w-6 text-blue-600" />,
      title: 'Standard Shipping',
      price: 'PKR 200 - 500',
      time: '3-7 business days',
      features: [
        'Tracking available',
        'Signature required',
        'Insurance up to PKR 5,000',
        'Free for orders over PKR 10,000'
      ]
    },
    {
      icon: <Package className="h-6 w-6 text-green-600" />,
      title: 'Express Shipping',
      price: 'PKR 500 - 1,000',
      time: '1-3 business days',
      features: [
        'Priority processing',
        'Real-time tracking',
        'Signature required',
        'Insurance up to PKR 10,000',
        'Free for orders over PKR 20,000'
      ]
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      title: 'Same Day Delivery',
      price: 'PKR 1,000+',
      time: 'Same day (if ordered before 2 PM)',
      features: [
        'Karachi, Lahore, Islamabad only',
        'Order by 2 PM for same day',
        'Premium priority handling',
        'Full insurance coverage',
        'Direct customer contact'
      ]
    }
  ]

  const deliveryAreas = [
    {
      area: 'Major Cities',
      cities: 'Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad',
      time: '2-3 business days'
    },
    {
      area: 'Other Cities',
      cities: 'Peshawar, Quetta, Multan, Hyderabad, Gujranwala',
      time: '3-5 business days'
    },
    {
      area: 'Remote Areas',
      cities: 'All other locations in Pakistan',
      time: '5-14 business days'
    }
  ]

  const shippingRestrictions = [
    'International shipping not currently available',
    'No PO Box deliveries',
    'Adult signature required for high-value items',
    'Certain remote areas may have limited service',
    'Hazardous materials cannot be shipped'
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
              <Truck className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Policy</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Fast, reliable, and secure shipping across Pakistan. Learn about our delivery options and policies.
            </p>
            <p className="text-sm text-white/60 mt-4">
              We deliver to all major cities and remote areas across Pakistan
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Shipping Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Shipping Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-200"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-50 rounded-full">
                    {option.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{option.title}</h3>
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-blue-600">{option.price}</p>
                  <p className="text-gray-600">{option.time}</p>
                </div>
                <ul className="space-y-3">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Delivery Areas & Times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 bg-white rounded-xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Delivery Areas & Estimated Times</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Area</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Cities</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Estimated Delivery Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliveryAreas.map((area, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-800">{area.area}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{area.cities}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-gray-800">{area.time}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Order Processing & Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Processing</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Order Confirmation</h4>
                  <p className="text-gray-600">Within 1 hour of payment confirmation</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Order Processing</h4>
                  <p className="text-gray-600">1-2 business days for verification and packaging</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Shipment</h4>
                  <p className="text-gray-600">Handed to courier with tracking information</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Delivery</h4>
                  <p className="text-gray-600">Delivery attempt within estimated timeframe</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Package Tracking</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">How to Track Your Order</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                    <span>Check your email for tracking number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                    <span>Open the Track Order page on BlackCart.store</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                    <span>Use tracking number on courier website</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-1">Delivery Attempts</p>
                    <p className="text-yellow-800 text-sm">
                      Courier will attempt delivery 3 times. After failed attempts, package returns to warehouse 
                      and restocking fee may apply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Restrictions & Insurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping Restrictions</h3>
            <div className="space-y-4">
              {shippingRestrictions.map((restriction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-600">{restriction}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Package Insurance</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                All shipments include basic insurance coverage. Additional insurance available for high-value items.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <strong>Note:</strong> For lost or damaged packages during transit, please contact us within 
                  48 hours of expected delivery date with photos and documentation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Shipping?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our customer support team is available to assist with any shipping-related questions or concerns.
          </p>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Shipping Support:</strong> shipping@blackcart.pk
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> +92 3146965599
            </p>
            <p className="text-gray-700">
              <strong>Hours:</strong> Mon-Fri, 9AM-6PM PKT
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ShippingPolicy
