// src/pages/orders/InvoicePage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Download, Share2, Mail, ArrowLeft, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import InvoiceView from '../../components/order/InvoiceView'
import { orderService } from '../../services/orderService'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const InvoicePage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const componentRef = useRef<HTMLDivElement>(null)

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      console.log('📡 Fetching order for invoice:', orderId)
      
      const response = await orderService.getOrderById(orderId!)
      const orderData = response.data
      
      console.log('✅ Order loaded:', orderData)
      
      setOrder(orderData)
    } catch (error: any) {
      console.error('❌ Failed to load invoice:', error)
      toast.error(error.response?.data?.message || 'Failed to load invoice')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${order?.invoiceNumber || 'order'}`,
    onAfterPrint: () => toast.success('Invoice printed successfully')
  })

  const handleDownload = async () => {
    try {
      setDownloading(true)
      toast.loading('Preparing invoice...', { id: 'invoice-download' })
      
      // Get invoice data from API
      const response = await orderService.getInvoice(orderId!)
      const invoiceData = response.data
      
      // Create HTML content
      const exportContent = componentRef.current?.cloneNode(true) as HTMLElement | undefined
      exportContent?.querySelectorAll('[data-invoice-actions]').forEach(element => element.remove())
      const printContent = exportContent?.innerHTML || ''
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
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${order?.invoiceNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 40px; 
                max-width: 800px; 
                margin: 0 auto;
                background: white;
              }
              ${styles}
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `
      
      // Create download
      const blob = new Blob([html], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${order?.invoiceNumber}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Invoice downloaded', { id: 'invoice-download' })
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download invoice', { id: 'invoice-download' })
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${order?.invoiceNumber}`,
        text: `Invoice for order ${order?._id}`,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const handleEmail = async () => {
    try {
      setSendingEmail(true)
      
      // Create mailto link
      const subject = `Invoice ${order?.invoiceNumber} from BlackCart.store`
      const body = `Dear ${order?.shippingAddress?.fullName},\n\nPlease find your invoice attached.\n\nOrder ID: ${order?._id}\nInvoice Number: ${order?.invoiceNumber}\nTotal Amount: PKR ${order?.totalPrice?.toLocaleString()}\n\nThank you for shopping with BlackCart.store!`
      
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      
      toast.success('Email client opened')
    } catch (error) {
      console.error('Email error:', error)
      toast.error('Failed to open email client')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">The invoice you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 print:px-0 print:py-0">
        {/* Screen Header */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Order
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <FileText className="h-6 w-6 text-blue-600 mr-2" />
                  <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
                </div>
                <p className="text-gray-600">
                  Order #{order.invoiceNumber || order._id.slice(-8)} • {order.orderStatus}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2">
                  {order.isPaid ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Pending Payment
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Preparing...' : 'Download'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleEmail}
              disabled={sendingEmail}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              {sendingEmail ? 'Opening...' : 'Email'}
            </button>
          </div>
        </div>

        {/* Invoice Component */}
        <div ref={componentRef} className="print:shadow-none">
          <InvoiceView order={order} />
        </div>

        {/* Help Section */}
        <div className="mt-8 print:hidden">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">Need Help with Your Invoice?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about this invoice, contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:accounts@blackcart.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                accounts@blackcart.com
              </a>
              <a
                href="tel:+9242111222333"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                +92 3146965599
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:shadow-none,
            .print\\:shadow-none * {
              visibility: visible;
            }
            .print\\:shadow-none {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            button, .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default InvoicePage
