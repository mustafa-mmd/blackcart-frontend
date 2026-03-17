import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      icon: <Database className="h-6 w-6 text-blue-600" />,
      title: 'Information We Collect',
      content: [
        'Personal information (name, email, phone number) provided during registration',
        'Shipping and billing addresses',
        'Payment information (securely processed via payment gateways)',
        'Order history and preferences',
        'Device and browser information for analytics'
      ]
    },
    {
      icon: <Eye className="h-6 w-6 text-green-600" />,
      title: 'How We Use Your Information',
      content: [
        'Process orders and deliver products',
        'Communicate order updates and promotions',
        'Improve our website and services',
        'Prevent fraud and ensure security',
        'Comply with legal obligations'
      ]
    },
    {
      icon: <Lock className="h-6 w-6 text-purple-600" />,
      title: 'Data Security',
      content: [
        'SSL encryption for all data transmission',
        'Secure payment processing via certified gateways',
        'Regular security audits and updates',
        'Access controls and authentication measures',
        'Data backup and recovery systems'
      ]
    },
    {
      icon: <UserCheck className="h-6 w-6 text-orange-600" />,
      title: 'Your Rights',
      content: [
        'Right to access your personal data',
        'Right to correct inaccurate information',
        'Right to delete your account and data',
        'Right to opt-out of marketing communications',
        'Right to data portability'
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      title: 'Third-Party Services',
      content: [
        'Payment processors (Stripe, PayPal, etc.)',
        'Shipping and logistics partners',
        'Analytics and marketing tools',
        'Customer support platforms',
        'Cloud hosting and storage providers'
      ]
    },
    {
      icon: <FileText className="h-6 w-6 text-teal-600" />,
      title: 'Cookies Policy',
      content: [
        'Essential cookies for website functionality',
        'Analytics cookies to improve user experience',
        'Preference cookies to remember your settings',
        'Marketing cookies for personalized ads',
        'You can manage cookie preferences in browser settings'
      ]
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
              <Shield className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-white/60 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-lg mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 mb-4">
            At BlackCart, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy describes how we collect, use, and safeguard your data when you use our website and services.
          </p>
          <p className="text-gray-600">
            By using our services, you agree to the collection and use of information in accordance with this policy. 
            We may update this policy from time to time, and we will notify you of any significant changes.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
              </div>
              
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Data Retention & Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Data Retention</h3>
            <p className="text-gray-600 mb-4">
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, 
              including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                <span>Order data: 7 years for tax purposes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                <span>Account data: Until account deletion request</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                <span>Marketing data: Until opt-out request</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Children's Privacy</h3>
            <p className="text-gray-600 mb-4">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you are a parent or guardian and believe your child has provided us with 
              personal information, please contact us.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> If we learn that we have collected personal data from a child without verification 
                of parental consent, we will take steps to remove that information from our servers.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Us</h3>
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer:
            </p>
            <div className="space-y-2">
              <p className="text-gray-800">
                <strong>Email:</strong> privacy@blackcart.pk
              </p>
              <p className="text-gray-800">
                <strong>Phone:</strong> +92 300 1234567
              </p>
              <p className="text-gray-800">
                <strong>Address:</strong> 123 Tech Street, Phase 5, DHA, Karachi, Pakistan
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PrivacyPolicy