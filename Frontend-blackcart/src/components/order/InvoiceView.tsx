// src/components/order/InvoiceView.tsx
import React, { useRef } from 'react'
import { Printer, Download, Share2, Mail, FileText, Calendar, Hash, User, MapPin, Phone, Package, CreditCard, Truck, CheckCircle } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { Order } from '../../types'
import { formatDate, formatOrderDate } from '../../utils/dateFormatter'
import { formatCurrency, formatPrice } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'

interface InvoiceViewProps {
  order: Order
  onPrint?: () => void
  onDownload?: () => void
  onShare?: () => void
  onEmail?: () => void
}

const InvoiceView: React.FC<InvoiceViewProps> = ({
  order,
  onPrint,
  onDownload,
  onShare,
  onEmail,
}) => {
  const componentRef = useRef<HTMLDivElement>(null)
  
  const invoiceNumber = order.invoiceNumber || order.pakistanData?.formattedInvoiceNumber || `INV-${order._id.slice(-8).toUpperCase()}`
  const invoiceDate = formatOrderDate(order.createdAt)
  const paymentMethod = order.paymentMethod?.toUpperCase() || 'Unknown'

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${invoiceNumber}`,
    onAfterPrint: () => {
      toast.success('Invoice sent to printer')
      if (onPrint) onPrint()
    }
  })

  const handleDownload = () => {
    if (!componentRef.current) return
    
    // Get the HTML content
    const content = componentRef.current.innerHTML
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules || [])
            .map(rule => rule.cssText)
            .join('')
        } catch {
          return ''
        }
      })
      .join('')
    
    // Create full HTML document
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            ${styles}
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `
    
    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoiceNumber}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Invoice downloaded')
    if (onDownload) onDownload()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoiceNumber}`,
        text: `Invoice for order ${order._id}`,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
    if (onShare) onShare()
  }

  const handleEmail = () => {
    // Create mailto link
    const subject = `Invoice ${invoiceNumber} from BlackCart`
    const body = `Please find your invoice attached.\n\nOrder ID: ${order._id}\nInvoice Number: ${invoiceNumber}\nTotal Amount: ${formatPrice(order.totalPrice)}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    toast.success('Email client opened')
    if (onEmail) onEmail()
  }

  return (
    <div ref={componentRef} className="bg-white rounded-xl border border-gray-200">
      {/* Invoice Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tax Invoice</h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Hash className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">{invoiceNumber}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">{invoiceDate}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4 mr-2" />
              {order.isPaid ? 'Paid' : 'Pending Payment'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Download HTML
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-6">
        {/* Seller & Buyer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Seller Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Seller Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-bold text-gray-900 text-lg mb-2">BlackCart Store</p>
              <p className="text-gray-600 mb-1">123 Main Street, Gulberg</p>
              <p className="text-gray-600 mb-1">Lahore, Punjab 54000</p>
              <p className="text-gray-600 mb-1">Pakistan</p>
              <p className="text-gray-600">Email: support@blackcart.com</p>
              <p className="text-gray-600">Phone: 042-111-222-333</p>
              <p className="text-gray-600 mt-2">GST: PK1234567890123</p>
            </div>
          </div>

          {/* Buyer Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              Buyer Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-bold text-gray-900 mb-2">{order.shippingAddress.fullName}</p>
              <div className="flex items-start mb-1">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">{order.shippingAddress.address}</p>
              </div>
              <p className="text-gray-600 ml-6 mb-1">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600 ml-6 mb-1">{order.shippingAddress.country}</p>
              <div className="flex items-center ml-6">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <p className="text-gray-600">{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-purple-600" />
            Order Items
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.orderItems.map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=No+Image'
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment & Shipping Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Payment Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{paymentMethod}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid On:</span>
                  <span className="font-medium">{formatDate(order.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-green-600" />
              Shipping Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping Method:</span>
                <span className="font-medium">{order.shippingMethod || 'Standard'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium capitalize">{order.orderStatus}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-medium text-blue-600">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">{formatPrice(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (16% GST):</span>
              <span className="font-medium">{formatPrice(order.taxPrice)}</span>
            </div>
            {order.codCharges && order.codCharges > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">COD Charges:</span>
                <span className="font-medium">{formatPrice(order.codCharges)}</span>
              </div>
            )}
            {order.coupon && order.coupon.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({order.coupon.code}):</span>
                <span>-{formatPrice(order.coupon.discount)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Terms & Conditions</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• This is a computer-generated invoice and does not require a signature.</li>
            <li>• Goods once sold will not be taken back unless found defective.</li>
            <li>• All disputes are subject to Lahore jurisdiction only.</li>
            <li>• Prices are inclusive of all applicable taxes.</li>
            <li>• E. & O.E.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InvoiceView