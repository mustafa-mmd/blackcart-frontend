import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Shield, FileText, Truck, RotateCcw } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container-lg section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-xl">BC</span>
              </div>
              <span className="text-2xl font-bold">BlackCart</span>
            </div>
            <p className="text-gray-400 mb-6">
              Pakistan's premier e-commerce destination for laptops & computer accessories. 
              Shop from thousands of products with secure payments and fast delivery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <Shield className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <Truck className="h-4 w-4" />
                  <span>Shipping Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <RotateCcw className="h-4 w-4" />
                  <span>Returns Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>Contact Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">
                  123 Tech Street, Phase 5, DHA, Karachi, Pakistan
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">+92 300 1234567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">support@blackcart.pk</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-3">
                Subscribe to our newsletter for the latest offers and product updates.
              </p>
              <div className="flex flex-col sm:flex-row">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 text-gray-900 rounded-t-lg sm:rounded-tr-none sm:rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-b-lg sm:rounded-bl-none sm:rounded-r-lg transition-colors whitespace-nowrap font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} BlackCart Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <Link to="/shipping-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Shipping
              </Link>
              <Link to="/returns-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Returns
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact
              </Link>
              <Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">
                FAQ
              </Link>
            </div>
          </div>
          <p className="mt-4 text-center text-gray-500 text-sm">
            Pakistan's Trusted E-commerce Platform | Secure Payments | Nationwide Delivery | 24/7 Support
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer