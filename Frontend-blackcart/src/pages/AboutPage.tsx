import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  Target, Users, Globe, Award, Shield, Heart,
  Check, TrendingUp, Clock, Package, Headphones, Star
} from 'lucide-react'
import { Link } from 'react-router-dom'

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Ali Khan',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'Former e-commerce executive with 10+ years experience',
    },
    {
      name: 'Sara Ahmed',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w-400&h=400&fit=crop&crop=face',
      bio: 'Supply chain and logistics expert',
    },
    {
      name: 'Ahmed Raza',
      role: 'Tech Lead',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      bio: 'Full-stack developer with MERN expertise',
    },
    {
      name: 'Fatima Shah',
      role: 'Customer Success',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
      bio: '5+ years in customer service excellence',
    },
  ]

  const milestones = [
    { year: '2020', title: 'Founded', description: 'BlackCart started with a vision to revolutionize e-commerce in Pakistan' },
    { year: '2021', title: 'First 10,000 Users', description: 'Reached our first major milestone with 10,000 registered users' },
    { year: '2022', title: 'Nationwide Delivery', description: 'Expanded delivery network to all major cities in Pakistan' },
    { year: '2023', title: '100K+ Products', description: 'Catalog expanded to over 100,000 quality products' },
    { year: '2024', title: 'Mobile App Launch', description: 'Launched native mobile apps for iOS and Android' },
  ]

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Customer First',
      description: 'Everything we do revolves around our customers\' satisfaction',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Trust & Transparency',
      description: 'We believe in building relationships based on trust',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Innovation',
      description: 'Constantly evolving to provide better shopping experiences',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Community Focus',
      description: 'Supporting local businesses and communities across Pakistan',
    },
  ]

  const stats = [
    { icon: <Users className="h-6 w-6" />, value: '500K+', label: 'Happy Customers' },
    { icon: <Package className="h-6 w-6" />, value: '100K+', label: 'Products' },
    { icon: <Globe className="h-6 w-6" />, value: '100+', label: 'Cities Served' },
    { icon: <Award className="h-6 w-6" />, value: '4.8/5', label: 'Customer Rating' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>About BlackCart — Pakistan's Computer Accessories Store</title>
        <meta name="description" content="Learn about BlackCart, Pakistan's trusted online store for premium computer accessories and gaming peripherals. Our mission, story, and commitment to quality." />
        <meta property="og:title" content="About BlackCart | Pakistan's Computer Accessories Store" />
        <meta property="og:description" content="BlackCart is Pakistan's dedicated online store for computer accessories and gaming peripherals. Learn about our story and mission." />
        <meta property="og:url" content="https://blackcart.store/about" />
        <link rel="canonical" href="https://blackcart.store/about" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container-lg section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-yellow-300">BlackCart</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Pakistan's Trusted E-commerce Platform - Bringing Quality Products to Your Doorstep
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
                Start Shopping
              </Link>
              <Link to="/contact" className="bg-transparent border-2 border-white hover:bg-white/10 py-3 px-8 rounded-lg text-lg transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container-lg section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2020, BlackCart began with a simple mission: to make online shopping accessible, 
                  reliable, and enjoyable for every Pakistani. We noticed a gap in the market for a platform 
                  that combined wide product selection with excellent customer service.
                </p>
                <p>
                  What started as a small team of passionate individuals has grown into one of Pakistan's 
                  leading e-commerce platforms. Today, we serve hundreds of thousands of customers across 
                  the country, delivering everything from daily essentials to premium products.
                </p>
                <p>
                  Our commitment to quality, transparency, and customer satisfaction has been the cornerstone 
                  of our success. We work directly with trusted suppliers and brands to ensure every product 
                  meets our high standards.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
                alt="BlackCart Team"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Our Vision</div>
                    <div className="text-sm text-gray-600">
                      To be Pakistan's most trusted shopping destination
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container-lg section-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="container-lg section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at BlackCart
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6 text-center hover:shadow-strong transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <div className="text-primary-600">{value.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team
      <section className="py-16 bg-gray-50">
        <div className="container-lg section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate individuals working behind the scenes to make your shopping experience exceptional
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6 text-center hover:shadow-strong transition-all hover:-translate-y-1"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <div className="text-primary-600 font-medium mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Milestones */}
      <section className="py-16">
        <div className="container-lg section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Key milestones in our growth story
            </p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 hidden lg:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col lg:flex-row items-center ${
                    index % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg hidden lg:block"></div>
                  
                  {/* Content */}
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="card p-6">
                      <div className="text-sm font-semibold text-primary-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Year */}
                  <div className="mt-4 lg:mt-0 lg:w-1/2 lg:px-12">
                    <div className={`text-2xl font-bold text-gray-900 ${
                      index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'
                    }`}>
                      {milestone.year}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container-lg section-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Shop with Confidence?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust BlackCart for their shopping needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-all"
            >
              Create Your Account
            </Link>
            <Link
              to="/products"
              className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage