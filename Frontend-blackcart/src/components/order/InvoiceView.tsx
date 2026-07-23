// src/components/order/InvoiceView.tsx
import React, { useRef } from 'react'
import {
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  User,
} from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { Order } from '../../types'
import { formatDate, formatOrderDate } from '../../utils/dateFormatter'
import { formatPrice } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'

interface InvoiceViewProps {
  order: Order
  onPrint?: () => void
  onDownload?: () => void
  onShare?: () => void
  onEmail?: () => void
}

const seller = {
  name: 'BlackCart.store',
  tagline: "Pakistan's Trusted E-commerce Platform",
  addressLine1: 'Islamia Town Street# 3rd',
  addressLine2: 'Peshawar, Khyber Pakhtunkhwa, Pakistan',
  email: 'blackcart.ak25@gmail.com',
  phone: '+92 314 696 5599',
  whatsapp: '+92 314 696 5599',
  website: 'www.blackcart.store',
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
  const paymentMethodRaw = order.paymentMethod || 'COD'
  const paymentMethod = paymentMethodRaw.toLowerCase().includes('cod') ? 'Cash on Delivery (COD)' : paymentMethodRaw
  const paymentBadge = paymentMethodRaw.toUpperCase().includes('COD') ? 'COD' : paymentMethodRaw.toUpperCase()
  const paymentStatus = order.isPaid ? 'Paid' : 'Pending'
  const shippingMethod = order.shippingMethod || 'Standard Delivery'
  const deliveryEstimate = order.deliveryEstimate || (String(shippingMethod).toLowerCase().includes('express') ? '2-3 working days after dispatch' : '4-7 working days after dispatch')
  const shippingAddress = order.shippingAddress || ({} as any)
  const discount = order.coupon?.discount || 0
  const safeImage = (image?: string) => image || 'https://via.placeholder.com/160x120?text=BlackCart'

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${invoiceNumber}`,
    onAfterPrint: () => {
      toast.success('Invoice sent to printer')
      if (onPrint) onPrint()
    }
  })

  const buildDownloadHTML = () => {
    const exportContent = componentRef.current?.cloneNode(true) as HTMLElement | undefined
    exportContent?.querySelectorAll('[data-invoice-actions]').forEach(element => element.remove())
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice ${invoiceNumber}</title>
  </head>
  <body>${exportContent?.innerHTML || ''}</body>
</html>`
  }

  const handleDownload = () => {
    if (!componentRef.current) return
    const blob = new Blob([buildDownloadHTML()], { type: 'text/html;charset=utf-8' })
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
    const subject = `Invoice ${invoiceNumber} from BlackCart.store`
    const body = `Please find your invoice attached.\n\nOrder ID: ${order._id}\nInvoice Number: ${invoiceNumber}\nTotal Amount: ${formatPrice(order.totalPrice)}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    toast.success('Email client opened')
    if (onEmail) onEmail()
  }

  return (
    <div ref={componentRef} className="bc-invoice-shell">
      <style>{`
        .bc-invoice-shell {
          --bc-navy: #071427;
          --bc-blue: #075bff;
          --bc-blue-dark: #003fc9;
          --bc-soft-blue: #edf5ff;
          --bc-slate: #56657a;
          --bc-border: #dce6f2;
          --bc-gold: #d49316;
          --bc-green: #0f9f54;
          background: #ffffff;
          color: var(--bc-navy);
          border: 1px solid var(--bc-border);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 18px 45px rgba(7, 20, 39, 0.08);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        }
        .bc-invoice-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 18px 28px;
          border-bottom: 1px solid var(--bc-border);
          background: linear-gradient(180deg, #ffffff, #f8fbff);
        }
        .bc-invoice-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--bc-border);
          border-radius: 10px;
          background: #fff;
          color: var(--bc-navy);
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
        }
        .bc-invoice-action:hover {
          border-color: #93b8ff;
          box-shadow: 0 10px 22px rgba(7, 91, 255, 0.12);
          transform: translateY(-1px);
        }
        .bc-invoice-page {
          padding: 34px 38px 0;
          background: radial-gradient(circle at top left, rgba(7, 91, 255, .08), transparent 34%), #fff;
        }
        .bc-invoice-top {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 24px;
          align-items: start;
        }
        .bc-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .bc-brand-mark {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, #075bff, #003fc9);
          color: #fff;
          box-shadow: 0 14px 30px rgba(7, 91, 255, .25);
        }
        .bc-brand-title {
          font-size: 38px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -1.2px;
          margin: 0;
        }
        .bc-brand-title span { color: var(--bc-blue); }
        .bc-tagline {
          margin: 9px 0 0;
          color: var(--bc-slate);
          font-weight: 600;
          font-size: 16px;
        }
        .bc-invoice-title {
          text-align: right;
        }
        .bc-invoice-title h1 {
          margin: 0 0 14px;
          font-size: 46px;
          line-height: .95;
          font-weight: 950;
          letter-spacing: -1px;
          color: var(--bc-navy);
        }
        .bc-invoice-meta {
          display: inline-grid;
          gap: 12px;
          min-width: 360px;
          border: 1px solid var(--bc-border);
          border-radius: 14px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, .82);
          box-shadow: 0 10px 25px rgba(7, 20, 39, .05);
        }
        .bc-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: var(--bc-slate);
          font-weight: 700;
        }
        .bc-meta-left {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .bc-meta-value {
          color: var(--bc-navy);
          font-weight: 900;
        }
        .bc-payment-pill {
          margin: 28px auto;
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #f3d89f;
          border-radius: 16px;
          background: linear-gradient(135deg, #fffaf0, #fff5dc);
          color: #9a5d00;
          padding: 14px 24px;
          box-shadow: 0 12px 30px rgba(212, 147, 22, .12);
        }
        .bc-payment-pill strong {
          display: block;
          font-size: 17px;
          letter-spacing: .3px;
        }
        .bc-payment-pill span {
          display: block;
          margin-top: 3px;
          font-size: 12px;
          font-weight: 700;
        }
        .bc-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
          margin-bottom: 24px;
        }
        .bc-info-card {
          border: 1px solid var(--bc-border);
          border-radius: 16px;
          background: rgba(255, 255, 255, .94);
          padding: 22px;
          min-height: 190px;
          box-shadow: 0 12px 28px rgba(7, 20, 39, .045);
        }
        .bc-card-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          color: var(--bc-blue-dark);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .6px;
        }
        .bc-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(145deg, #075bff, #003fc9);
        }
        .bc-info-name {
          margin: 0 0 14px;
          font-weight: 900;
          font-size: 17px;
        }
        .bc-line {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 10px 0;
          color: #1d2939;
          font-size: 14px;
          line-height: 1.55;
        }
        .bc-line svg { color: #66758b; flex: 0 0 auto; margin-top: 2px; }
        .bc-items-card {
          border: 1px solid var(--bc-border);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 22px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(7, 20, 39, .045);
        }
        .bc-items-head,
        .bc-item-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 120px 130px 130px;
          align-items: center;
          gap: 18px;
        }
        .bc-items-head {
          background: linear-gradient(135deg, #075bff, #003fc9);
          color: #fff;
          padding: 16px 22px;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .bc-item-row {
          padding: 20px 22px;
          border-bottom: 1px dashed var(--bc-border);
        }
        .bc-item-row:last-child { border-bottom: 0; }
        .bc-item-product {
          display: flex;
          align-items: center;
          gap: 18px;
          min-width: 0;
        }
        .bc-item-image {
          width: 118px;
          height: 92px;
          border-radius: 12px;
          border: 1px solid var(--bc-border);
          background: #f8fafc;
          object-fit: cover;
          flex: 0 0 auto;
        }
        .bc-item-name {
          margin: 0;
          max-width: 430px;
          color: var(--bc-navy);
          font-size: 16px;
          line-height: 1.35;
          font-weight: 900;
        }
        .bc-item-sub {
          margin: 9px 0 0;
          color: var(--bc-slate);
          font-size: 13px;
          font-weight: 600;
        }
        .bc-money {
          font-weight: 900;
          font-size: 16px;
          color: var(--bc-navy);
        }
        .bc-summary-wrap {
          display: grid;
          grid-template-columns: 1fr 430px;
          gap: 22px;
          align-items: start;
          margin-bottom: 22px;
        }
        .bc-details-card {
          border: 1px solid var(--bc-border);
          border-radius: 16px;
          background: #fff;
          padding: 22px;
          box-shadow: 0 12px 28px rgba(7, 20, 39, .045);
        }
        .bc-details-card.green { background: linear-gradient(135deg, #ffffff, #f3fff7); }
        .bc-details-card.blue { background: linear-gradient(135deg, #ffffff, #f3f8ff); }
        .bc-detail-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 12px;
          font-size: 16px;
          font-weight: 900;
        }
        .bc-detail-title.green { color: #057a3d; }
        .bc-detail-title.blue { color: var(--bc-blue-dark); }
        .bc-detail-text {
          color: #1d2939;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 600;
        }
        .bc-totals {
          border: 1px solid var(--bc-border);
          border-radius: 16px;
          background: #fff;
          padding: 18px;
          box-shadow: 0 12px 28px rgba(7, 20, 39, .045);
        }
        .bc-total-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 9px 0;
          color: #1d2939;
          font-weight: 700;
        }
        .bc-total-row.discount { color: var(--bc-green); }
        .bc-grand-total {
          margin-top: 10px;
          padding: 15px 18px;
          border: 1px solid #bcd4ff;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          background: linear-gradient(135deg, #f7fbff, #eef5ff);
          color: var(--bc-blue-dark);
          font-size: 21px;
          font-weight: 950;
        }
        .bc-thanks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          border: 1px solid var(--bc-border);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 22px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(7, 20, 39, .045);
        }
        .bc-thanks h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 950;
        }
        .bc-thanks p {
          margin: 0;
          color: var(--bc-slate);
          font-size: 13px;
          line-height: 1.65;
          font-weight: 600;
        }
        .bc-feature-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-top: 1px solid var(--bc-border);
          padding: 20px 0;
        }
        .bc-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          border-right: 1px solid var(--bc-border);
        }
        .bc-feature:last-child { border-right: 0; }
        .bc-feature strong {
          display: block;
          font-size: 13px;
          font-weight: 900;
        }
        .bc-feature span {
          display: block;
          margin-top: 3px;
          color: var(--bc-slate);
          font-size: 11px;
          line-height: 1.35;
        }
        .bc-invoice-footer {
          margin: 0 -38px;
          padding: 18px 38px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          background: linear-gradient(135deg, #061427, #001f3f);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }
        .bc-invoice-footer span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          opacity: .95;
        }
        @media (max-width: 860px) {
          .bc-invoice-page { padding: 24px 18px 0; }
          .bc-invoice-top,
          .bc-card-grid,
          .bc-summary-wrap,
          .bc-thanks { grid-template-columns: 1fr; }
          .bc-invoice-title { text-align: left; }
          .bc-invoice-title h1 { font-size: 36px; }
          .bc-brand-title { font-size: 30px; }
          .bc-invoice-meta { min-width: 0; width: 100%; }
          .bc-items-head { display: none; }
          .bc-item-row { grid-template-columns: 1fr; gap: 10px; }
          .bc-item-product { align-items: flex-start; }
          .bc-feature-row { grid-template-columns: repeat(2, 1fr); gap: 16px 0; }
          .bc-feature:nth-child(2) { border-right: 0; }
          .bc-invoice-footer { margin: 0 -18px; padding: 18px; flex-direction: column; }
        }
        @media print {
          @page { margin: 10mm; size: A4; }
          body { margin: 0 !important; background: #fff !important; }
          .bc-invoice-shell { border: 0; border-radius: 0; box-shadow: none; }
          .bc-invoice-actions { display: none !important; }
          .bc-invoice-page { padding: 0; }
          .bc-invoice-footer { margin-left: 0; margin-right: 0; }
          .bc-info-card, .bc-items-card, .bc-details-card, .bc-totals, .bc-thanks { break-inside: avoid; box-shadow: none; }
        }
      `}</style>

      <div data-invoice-actions className="bc-invoice-actions">
        <button onClick={handlePrint} className="bc-invoice-action" type="button"><Printer size={16} /> Print</button>
        <button onClick={handleDownload} className="bc-invoice-action" type="button"><Download size={16} /> Download Invoice</button>
        <button onClick={handleShare} className="bc-invoice-action" type="button"><Share2 size={16} /> Share</button>
        <button onClick={handleEmail} className="bc-invoice-action" type="button"><Mail size={16} /> Email</button>
      </div>

      <main className="bc-invoice-page">
        <section className="bc-invoice-top">
          <div>
            <div className="bc-brand">
              <div className="bc-brand-mark"><ShoppingCart size={38} /></div>
              <div>
                <h2 className="bc-brand-title">Black<span>Cart</span>.store</h2>
                <p className="bc-tagline">{seller.tagline}</p>
              </div>
            </div>
          </div>

          <div className="bc-invoice-title">
            <h1>INVOICE</h1>
            <div className="bc-invoice-meta">
              <div className="bc-meta-row">
                <span className="bc-meta-left"><FileText size={18} /> Invoice No:</span>
                <span className="bc-meta-value">{invoiceNumber}</span>
              </div>
              <div className="bc-meta-row">
                <span className="bc-meta-left"><Calendar size={18} /> Invoice Date:</span>
                <span className="bc-meta-value">{invoiceDate}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="bc-payment-pill">
          <CreditCard size={36} />
          <div>
            <strong>{paymentBadge} &nbsp;•&nbsp; {paymentStatus.toUpperCase()}</strong>
            <span>Payment Method: {paymentMethod}</span>
          </div>
        </div>

        <section className="bc-card-grid">
          <article className="bc-info-card">
            <div className="bc-card-heading"><span className="bc-card-icon"><User size={24} /></span> Bill To</div>
            <p className="bc-info-name">{shippingAddress.fullName || 'Customer'}</p>
            <p className="bc-line"><MapPin size={18} /> <span>{shippingAddress.address || 'Address not provided'}<br />{shippingAddress.city || ''}{shippingAddress.postalCode ? `, ${shippingAddress.postalCode}` : ''}<br />{shippingAddress.country || 'Pakistan'}</span></p>
            {shippingAddress.phone && <p className="bc-line"><Phone size={18} /> <span>Phone: {shippingAddress.phone}</span></p>}
          </article>

          <article className="bc-info-card">
            <div className="bc-card-heading"><span className="bc-card-icon"><Store size={24} /></span> Seller</div>
            <p className="bc-info-name">{seller.name}</p>
            <p className="bc-line"><MapPin size={18} /> <span>{seller.addressLine1}<br />{seller.addressLine2}</span></p>
            <p className="bc-line"><Mail size={18} /> <span>Email: {seller.email}</span></p>
            <p className="bc-line"><Phone size={18} /> <span>Phone: {seller.phone}</span></p>
          </article>
        </section>

        <section className="bc-items-card">
          <div className="bc-items-head">
            <div>Item</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div>Total</div>
          </div>
          {order.orderItems.map((item, index) => {
            const quantity = item.quantity || 1
            const unitPrice = item.price || 0
            return (
              <div className="bc-item-row" key={item._id || index}>
                <div className="bc-item-product">
                  <img
                    src={safeImage(item.image)}
                    alt={item.name}
                    className="bc-item-image"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x120?text=BlackCart' }}
                  />
                  <div>
                    <p className="bc-item-name">{item.name}</p>
                    {item.selectedColor?.name && <p className="bc-item-sub">Color: {item.selectedColor.name}</p>}
                    {item.sku && <p className="bc-item-sub">SKU: {item.sku}</p>}
                  </div>
                </div>
                <div className="bc-money">{quantity}</div>
                <div className="bc-money">{formatPrice(unitPrice)}</div>
                <div className="bc-money">{formatPrice(unitPrice * quantity)}</div>
              </div>
            )
          })}
        </section>

        <section className="bc-summary-wrap">
          <div className="bc-card-grid" style={{ marginBottom: 0 }}>
            <article className="bc-details-card blue">
              <h3 className="bc-detail-title blue"><Truck size={28} /> Delivery Information</h3>
              <div className="bc-detail-text">
                <strong>Delivery Method:</strong> {shippingMethod}<br />
                <strong>Estimated Delivery:</strong> {deliveryEstimate}<br />
                Delivery across Pakistan
              </div>
            </article>

            <article className="bc-details-card green">
              <h3 className="bc-detail-title green"><ShieldCheck size={28} /> Payment Information</h3>
              <div className="bc-detail-text">
                <strong>Payment Method:</strong> {paymentMethod}<br />
                <strong>Payment Status:</strong> <span style={{ color: order.isPaid ? '#0f9f54' : '#e07900' }}>{paymentStatus}</span><br />
                Please keep this invoice for your records.
              </div>
            </article>
          </div>

          <aside className="bc-totals">
            <div className="bc-total-row"><span>Subtotal</span><strong>{formatPrice(order.itemsPrice || order.orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0))}</strong></div>
            <div className="bc-total-row"><span>Shipping</span><strong>{formatPrice(order.shippingPrice || 0)}</strong></div>
            {order.taxPrice > 0 && <div className="bc-total-row"><span>Tax</span><strong>{formatPrice(order.taxPrice)}</strong></div>}
            {order.codCharges && order.codCharges > 0 && <div className="bc-total-row"><span>COD Charges</span><strong>{formatPrice(order.codCharges)}</strong></div>}
            {discount > 0 && <div className="bc-total-row discount"><span>Discount ({order.coupon?.code})</span><strong>-{formatPrice(discount)}</strong></div>}
            <div className="bc-grand-total"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
          </aside>
        </section>

        <section className="bc-thanks">
          <div>
            <h3>Thank you for shopping with BlackCart.store!</h3>
            <p>Your order has been received successfully. For order updates or support, contact us anytime during working hours.</p>
          </div>
          <div>
            <p className="bc-line"><Phone size={18} /> <span>{seller.phone}</span></p>
            <p className="bc-line"><Mail size={18} /> <span>{seller.email}</span></p>
            <p className="bc-line"><MapPin size={18} /> <span>{seller.addressLine1}, Peshawar, Pakistan</span></p>
          </div>
        </section>

        <section className="bc-feature-row">
          <div className="bc-feature"><ShieldCheck size={30} color="#075bff" /><div><strong>100% Secure Payments</strong><span>Your payment information is safe with us.</span></div></div>
          <div className="bc-feature"><RotateCcw size={30} color="#075bff" /><div><strong>7-Day Easy Returns</strong><span>Hassle-free returns within 7 days.</span></div></div>
          <div className="bc-feature"><Truck size={30} color="#075bff" /><div><strong>Nationwide Delivery</strong><span>Fast and reliable delivery across Pakistan.</span></div></div>
          <div className="bc-feature"><Phone size={30} color="#075bff" /><div><strong>Customer Support</strong><span>We are here to help during working hours.</span></div></div>
        </section>

        <footer className="bc-invoice-footer">
          <span>{seller.website}</span>
          <span><Phone size={16} /> {seller.phone}</span>
          <span>WhatsApp: {seller.whatsapp}</span>
          <span><Mail size={16} /> {seller.email}</span>
        </footer>
      </main>
    </div>
  )
}

export default InvoiceView
