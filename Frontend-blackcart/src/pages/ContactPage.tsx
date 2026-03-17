import React from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  HeadphonesIcon as Headset
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().optional()
})

type ContactFormData = z.infer<typeof contactSchema>

const ContactPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      toast.success(result.message || 'Message sent successfully! We\'ll get back to you soon.');
      reset();
    } else {
      throw new Error(result.message || 'Failed to send message');
    }
  } catch (error: any) {
    console.error('Contact form error:', error);
    toast.error(error.message || 'Failed to send message. Please try again.');
  }
};

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: 'Email Support',
      details: ['support@blackcart.pk', 'sales@blackcart.pk'],
      description: 'We respond within 24 hours'
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: 'Phone Support',
      details: ['+92 300 1234567', '+92 321 9876543'],
      description: 'Mon-Fri, 9AM-6PM'
    },
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: 'Office Address',
      details: ['123 Tech Street, Phase 5', 'DHA, Karachi, Pakistan'],
      description: 'Visit our showroom'
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: 'Working Hours',
      details: ['Monday - Friday: 9AM - 6PM', 'Saturday: 10AM - 4PM'],
      description: 'Sunday: Closed'
    }
  ]

  const faqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order using the tracking number sent to your email or through your account dashboard.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash on delivery, bank transfer, credit/debit cards, and mobile wallets like JazzCash and Easypaisa.'
    },
    {
      question: 'Do you offer warranty on products?',
      answer: 'Yes, most products come with manufacturer warranty. Warranty period varies by product category.'
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Have questions? We're here to help. Get in touch with our team.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Headset className="h-6 w-6 text-blue-600" />
                  Contact Information
                </h2>
                
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="p-3 bg-blue-50 rounded-lg">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{info.title}</h3>
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-gray-600 mb-1">{detail}</p>
                        ))}
                        <p className="text-sm text-gray-500 mt-1">{info.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Live Chat */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Live Chat Support</h3>
                </div>
                <p className="mb-4 text-white/90">
                  Chat with our support team in real-time for instant help.
                </p>
                <button className="w-full bg-white text-green-700 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg transition-colors">
                  Start Live Chat
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+92 300 1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    {...register('subject')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="How can we help you?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Please describe your inquiry in detail..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View All FAQs →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage