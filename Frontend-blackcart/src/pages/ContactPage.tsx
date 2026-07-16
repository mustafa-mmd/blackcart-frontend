
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  HeadphonesIcon as Headset,
  ChevronDown,
  HelpCircle,
  MessageSquare
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { BrandIcon } from '../components/common/BrandIcon'
import { STORE_SOCIAL_LINKS } from '../config/storeContact'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().optional()
})

type ContactFormData = z.infer<typeof contactSchema>

const ContactPage: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  
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
    } catch (error: unknown) {
      console.error('Contact form error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  const contactCards = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: 'Email Us',
      value: 'blackcart.ak25@gmail.com',
      description: 'Response within 24 hours',
      href: 'mailto:blackcart.ak25@gmail.com'
    },
    {
      icon: <Phone className="h-6 w-6 text-green-600" />,
      title: 'Call Us',
      value: '+92 314 6965599',
      description: 'Mon-Fri, 9AM-6PM',
      href: 'tel:+923146965599'
    },
    {
      icon: <BrandIcon brand="whatsapp" className="h-6 w-6 text-emerald-600" />,
      title: 'WhatsApp Support',
      value: 'Chat Online',
      description: 'Instant reply during business hours',
      href: 'https://wa.me/923146965599'
    },
    {
      icon: <MapPin className="h-6 w-6 text-red-600" />,
      title: 'Visit Showroom',
      value: 'Peshawar, Pakistan',
      description: 'Islamia Town Street# 3rd',
      href: '#showroom-map'
    }
  ]

  const faqs = [
    {
      question: 'How can I track my order?',
      answer: 'Use the tracking number sent to your email on our Track Order page or the courier website.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery, Credit/Debit Cards (Visa, MasterCard), Bank Transfers, and Mobile Wallets (JazzCash, Easypaisa).'
    },
    {
      question: 'Do you offer warranty on products?',
      answer: 'Yes, most products come with manufacturer warranty. Warranty period varies by product category.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Contact BlackCart — Customer Support Pakistan</title>
        <meta name="description" content="Get in touch with BlackCart's customer support team. We're here to help with your orders, returns, and product questions across Pakistan. Contact us today." />
        <meta property="og:title" content="Contact BlackCart | Customer Support" />
        <meta property="og:description" content="Contact BlackCart for order support, returns, and product enquiries. Fast response for customers across Pakistan." />
        <meta property="og:url" content="https://blackcart.store/contact" />
        <link rel="canonical" href="https://blackcart.store/contact" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="bg-blue-600/30 text-blue-200 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-3 inline-block border border-blue-500/20">
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Need Help? Contact Us</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light">
              We are dedicated to providing the best computer accessories support in Pakistan. Reach out to us anytime!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {contactCards.map((card, index) => (
            <motion.a
              key={index}
              href={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-md hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="p-3 bg-gray-50 rounded-full group-hover:scale-110 transition-transform mb-3">
                {card.icon}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-1">{card.title}</h3>
              <p className="text-blue-600 font-bold text-xs md:text-sm mb-1 truncate max-w-full">{card.value}</p>
              <p className="text-xs text-gray-500">{card.description}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Column - Contact Info & Socials */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Headset className="h-5 w-5 text-blue-600" />
                Store Information
              </h2>
              
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 h-10 w-10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Business Hours</h3>
                    <p className="text-sm text-gray-600 mt-1">Monday - Friday: 9AM - 6PM</p>
                    <p className="text-sm text-gray-600">Saturday: 10AM - 4PM</p>
                    <p className="text-sm text-gray-400 mt-0.5">Sunday: Closed</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 h-10 w-10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Showroom Address</h3>
                    <p className="text-sm text-gray-600 mt-1">Islamia Town Street# 3rd</p>
                    <p className="text-sm text-gray-600">Peshawar, Khyber Pakhtunkhwa, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Connections */}
            <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Connect With Us</h2>
              <p className="text-sm text-gray-500 mb-5">Follow us on social networks for updates and special coupons</p>
              
              <div className="grid grid-cols-1 gap-2.5">
                {STORE_SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.brand}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-gray-200/60 rounded-xl p-3 hover:bg-blue-50/50 hover:border-blue-200 transition group cursor-pointer"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition group-hover:bg-blue-600">
                      <BrandIcon brand={social.brand} className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{social.name}</span>
                      <span className="block text-xs text-gray-500 truncate">{social.username}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-xl p-8 border border-gray-200/80 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                Send us a Message
              </h2>
              <p className="text-gray-500 mb-8 text-sm md:text-base">
                Got a question, suggestion or business proposal? Drop us a line!
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm ${
                        errors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                      }`}
                      placeholder="e.g. Aizaz Khan"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm ${
                        errors.email ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="e.g. +92 314 6965599"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('subject')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm ${
                      errors.subject ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                    }`}
                    placeholder="What is this regarding?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm ${
                      errors.message ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                    }`}
                    placeholder="Describe your request in detail..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send className="h-4.5 w-4.5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Google Map Section */}
            <div id="showroom-map" className="bg-white rounded-xl overflow-hidden border border-gray-200/80 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-red-600" />
                Find Us On Google Maps
              </h3>
              <div className="w-full h-72 rounded-lg overflow-hidden">
                <iframe 
                  title="BlackCart Peshawar Showroom Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.7288636730315!2d71.49216347596547!3d34.00018597317585!2m3!1f0!2f0!3f0!3m2!1i1020!2i768!4f13.1!3m3!1m2!1s0x38d9172bf4b9cb95%3A0x633f81e35fa8ff95!2sIslamia%20Town%2C%20Peshawar%2C%20Khyber%20Pakhtunkhwa%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                  className="w-full h-full border-0" 
                  allowFullScreen={true} 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* FAQ Accordion Section */}
            <div className="bg-white rounded-xl p-8 border border-gray-200/80 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-blue-600" />
                FAQ Quick Answers
              </h2>
              <div className="divide-y divide-gray-200/80">
                {faqs.map((faq, index) => {
                  const isOpen = expandedFaq === index
                  return (
                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                        className="flex justify-between items-center w-full text-left font-medium text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
