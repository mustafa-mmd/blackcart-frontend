import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  Ellipsis,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldAlert,
  Truck,
  WalletCards,
  XCircle,
} from 'lucide-react'
import { adminService, Order } from '../../services/adminServiceMethods'
import toast from 'react-hot-toast'

type Stats = {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
}

const defaultStats: Stats = {
  totalRevenue: 0,
  totalOrders: 0,
  pendingOrders: 0,
  processingOrders: 0,
  shippedOrders: 0,
  deliveredOrders: 0,
}

const AdminOrders: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>(defaultStats)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  })

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true)
      const response = await adminService.getAdminOrders({
        page,
        limit: pagination.limit,
        search: searchTerm.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })

      const data = response.data
      setOrders(data?.orders || [])
      setStats({ ...defaultStats, ...(data?.stats || {}) })
      setPagination({
        page: data?.pagination?.page || page,
        pages: data?.pagination?.pages || 1,
        total: data?.pagination?.total || 0,
        limit: data?.pagination?.limit || pagination.limit,
        hasNext: Boolean(data?.pagination?.hasNext),
        hasPrev: Boolean(data?.pagination?.hasPrev),
      })
      setSelectedOrders([])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => fetchOrders(1), searchTerm ? 350 : 0)
    return () => window.clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  const visibleOrders = useMemo(() => {
    if (paymentFilter === 'all') return orders
    return orders.filter((order) => {
      if (paymentFilter === 'paid') return order.isPaid
      if (paymentFilter === 'unpaid') return !order.isPaid
      if (paymentFilter === 'failed') return order.paymentRequest?.status === 'failed'
      return true
    })
  }, [orders, paymentFilter])

  const formatCurrency = (amount = 0) => 'PKR ' + amount.toLocaleString()
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date unavailable'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getCustomerName = (order: Order) => {
    const customer = typeof order.user === 'object' && order.user ? order.user : undefined
    return customer?.name || order.shippingAddress?.fullName || 'Guest customer'
  }

  const getCustomerEmail = (order: Order) => {
    const customer = typeof order.user === 'object' && order.user ? order.user : undefined
    return customer?.email || 'No email provided'
  }

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', classes: 'border-amber-200 bg-amber-50 text-amber-700', icon: <Clock3 className="h-4 w-4" /> }
      case 'processing':
        return { label: 'Processing', classes: 'border-blue-200 bg-blue-50 text-blue-700', icon: <PackageCheck className="h-4 w-4" /> }
      case 'shipped':
        return { label: 'Shipped', classes: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: <Truck className="h-4 w-4" /> }
      case 'delivered':
        return { label: 'Delivered', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: <CheckCircle2 className="h-4 w-4" /> }
      case 'cancelled':
        return { label: 'Cancelled', classes: 'border-red-200 bg-red-50 text-red-700', icon: <XCircle className="h-4 w-4" /> }
      default:
        return { label: status || 'Unknown', classes: 'border-slate-200 bg-slate-50 text-slate-600', icon: <AlertCircle className="h-4 w-4" /> }
    }
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId])
  }

  const handleSelectAll = () => {
    setSelectedOrders(selectedOrders.length === visibleOrders.length ? [] : visibleOrders.map((order) => order._id))
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (!selectedOrders.length) return
    try {
      toast.loading('Updating selected orders...', { id: 'orders-bulk-update' })
      await adminService.bulkUpdateOrders(selectedOrders, { status })
      toast.success('Orders updated successfully', { id: 'orders-bulk-update' })
      await fetchOrders(pagination.page)
    } catch (error) {
      console.error('Bulk order update failed:', error)
      toast.error('Failed to update selected orders', { id: 'orders-bulk-update' })
    }
  }

  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm('Cancel this order? This will update the order status.')) return
    try {
      setOpenMenuId(null)
      await adminService.bulkUpdateOrders([order._id], { status: 'cancelled' })
      toast.success('Order cancelled')
      await fetchOrders(pagination.page)
    } catch (error) {
      console.error('Cancel order failed:', error)
      toast.error('Failed to cancel order')
    }
  }

  const handleExportOrders = async () => {
    try {
      toast.loading('Preparing export...', { id: 'orders-export' })
      const response = await adminService.exportOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm.trim() || undefined,
      })
      const rows = response.data || []
      if (!rows.length) {
        toast.error('No orders to export', { id: 'orders-export' })
        return
      }
      const headers = Object.keys(rows[0])
      const csv = [headers.join(','), ...rows.map((row: any) => headers.map((header) => {
        const value = row[header]
        return typeof value === 'string' ? '"' + value.replace(/"/g, '""') + '"' : value
      }).join(','))].join('\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'orders_' + new Date().toISOString().split('T')[0] + '.csv'
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Orders exported successfully', { id: 'orders-export' })
    } catch (error) {
      console.error('Order export failed:', error)
      toast.error('Failed to export orders', { id: 'orders-export' })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('active')
    setPaymentFilter('all')
  }

  const statusOptions = [
    { value: 'active', label: 'Active Orders' },
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const paymentOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'failed', label: 'Failed' },
  ]

  const hasFilters = Boolean(searchTerm || statusFilter !== 'active' || paymentFilter !== 'all')
  const attentionCount = stats.pendingOrders

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((row) => <div key={row} className="h-16 rounded-xl bg-slate-100" />)}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500"><span className="font-medium text-blue-600">Orders</span><span>/</span><span>Order Management</span></div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Order Management</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Manage and track customer orders</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleExportOrders} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Download className="h-4 w-4" /> Export</button>
            <button type="button" onClick={() => fetchOrders(pagination.page)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" aria-label="Refresh orders"><RefreshCw className="h-4 w-4" /></button>
          </div>
        </header>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search orders</span>
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by order ID, customer name, or email..." className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
            </label>
            <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Order status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Payment status</span><select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">{paymentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <button type="button" onClick={clearFilters} disabled={!hasFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"><Filter className="h-4 w-4" /> Clear filters</button>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {[
            { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), note: 'From current orders', icon: <WalletCards className="h-5 w-5" />, tone: 'text-emerald-600 bg-emerald-50' },
            { label: 'Total Orders', value: String(stats.totalOrders), note: 'All visible orders', icon: <PackageCheck className="h-5 w-5" />, tone: 'text-blue-600 bg-blue-50' },
            { label: 'Pending', value: String(stats.pendingOrders), note: 'Needs attention', icon: <Clock3 className="h-5 w-5" />, tone: 'text-amber-600 bg-amber-50' },
            { label: 'Processing', value: String(stats.processingOrders), note: 'Being prepared', icon: <PackageCheck className="h-5 w-5" />, tone: 'text-blue-600 bg-blue-50' },
            { label: 'Delivered', value: String(stats.deliveredOrders), note: 'Completed orders', icon: <CheckCircle2 className="h-5 w-5" />, tone: 'text-emerald-600 bg-emerald-50' },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              {loading ? <div className="h-20 animate-pulse rounded-xl bg-slate-100" /> : <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500">{card.label}</p><p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">{card.value}</p><p className="mt-1 text-xs text-slate-500">{card.note}</p></div><span className={'inline-flex h-10 w-10 items-center justify-center rounded-xl ' + card.tone}>{card.icon}</span></div>}
            </div>
          ))}
        </section>

        {attentionCount > 0 && (
          <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><ShieldAlert className="h-5 w-5" /></span><div><p className="font-semibold text-amber-900">{attentionCount} order{attentionCount === 1 ? '' : 's'} needs your attention</p><p className="text-sm text-amber-800/80">Review pending orders and update their status.</p></div></div>
            <button type="button" onClick={() => setStatusFilter('pending')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100">View pending orders <ArrowRight className="h-4 w-4" /></button>
          </section>
        )}

        {selectedOrders.length > 0 && (
          <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-blue-900">{selectedOrders.length} order{selectedOrders.length === 1 ? '' : 's'} selected</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleExportOrders} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">Export</button>
              <button type="button" onClick={() => handleBulkStatusUpdate('processing')} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Update Status</button>
              <button type="button" onClick={() => setSelectedOrders([])} className="rounded-lg px-3 py-2 text-sm text-blue-700 hover:bg-blue-100">Clear</button>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div><h2 className="font-semibold text-slate-900">Orders</h2><p className="mt-1 text-sm text-slate-500">{loading ? 'Loading orders...' : 'Showing ' + (pagination.total ? ((pagination.page - 1) * pagination.limit + 1) : 0) + '–' + Math.min(pagination.page * pagination.limit, pagination.total) + ' of ' + pagination.total + ' orders'}</p></div>
            <span className="text-xs font-medium text-slate-400">{statusOptions.find((option) => option.value === statusFilter)?.label}</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? <div className="min-w-[900px] p-5">{renderSkeleton()}</div> : visibleOrders.length === 0 ? (
              <div className="px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><PackageCheck className="h-6 w-6" /></div><h3 className="mt-4 text-lg font-semibold text-slate-900">{orders.length ? 'No orders found' : 'No orders yet'}</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{orders.length ? 'Try adjusting your filters or search.' : 'Orders will appear here when customers complete purchases.'}</p>{orders.length > 0 && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Clear Filters</button>}</div>
            ) : (
              <table className="min-w-[980px] w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr><th className="w-12 px-5 py-4"><input type="checkbox" checked={selectedOrders.length === visibleOrders.length && visibleOrders.length > 0} onChange={handleSelectAll} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" aria-label="Select all orders" /></th><th className="px-4 py-4">Order</th><th className="px-4 py-4">Customer</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Payment</th><th className="px-4 py-4">Total</th><th className="px-5 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleOrders.map((order) => {
                    const status = getStatusMeta(order.orderStatus)
                    const isMenuOpen = openMenuId === order._id
                    return (
                      <tr key={order._id} className="transition hover:bg-slate-50/70">
                        <td className="px-5 py-5 align-top"><input type="checkbox" checked={selectedOrders.includes(order._id)} onChange={() => handleSelectOrder(order._id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" aria-label={'Select ' + (order.invoiceNumber || order._id)} /></td>
                        <td className="px-4 py-5 align-top"><button type="button" onClick={() => navigate('/admin/orders/' + order._id)} className="text-left"><p className="font-semibold text-slate-900 hover:text-blue-700">{order.invoiceNumber || '#' + order._id.slice(-6)}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{formatDate(order.createdAt)} · {formatTime(order.createdAt)}</p></button></td>
                        <td className="px-4 py-5 align-top"><p className="font-semibold text-slate-900">{getCustomerName(order)}</p><p className="mt-1 text-sm text-slate-500">{getCustomerEmail(order)}</p></td>
                        <td className="px-4 py-5 align-top"><span className={'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ' + status.classes}>{status.icon}{status.label}</span></td>
                        <td className="px-4 py-5 align-top"><p className="font-medium capitalize text-slate-800">{(order.paymentMethod || 'unknown').replace('_', ' ')}</p><span className={'mt-1 inline-flex rounded-md border px-2 py-1 text-xs font-semibold ' + (order.isPaid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700')}>{order.isPaid ? 'Paid' : 'Unpaid'}</span></td>
                        <td className="px-4 py-5 align-top"><p className="font-bold text-slate-900">{formatCurrency(order.totalPrice)}</p></td>
                        <td className="px-5 py-5 align-top"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => navigate('/admin/orders/' + order._id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100" aria-label="View order"><Eye className="h-4 w-4" /></button><div className="relative"><button type="button" onClick={() => setOpenMenuId(isMenuOpen ? null : order._id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" aria-label="More order actions" aria-expanded={isMenuOpen}><MoreHorizontal className="h-4 w-4" /></button>{isMenuOpen && <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={() => { setOpenMenuId(null); navigate('/admin/orders/edit/' + order._id) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Edit3 className="h-4 w-4 text-slate-500" /> Edit Order</button><button type="button" onClick={() => { setOpenMenuId(null); navigate('/admin/orders/edit/' + order._id) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4 text-blue-600" /> Update Status</button>{!order.isPaid && <button type="button" onClick={() => { setOpenMenuId(null); navigate('/admin/payment-proofs?orderId=' + order._id) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><WalletCards className="h-4 w-4 text-amber-600" /> Mark Payment</button>}{order.orderStatus !== 'cancelled' && <><div className="my-1 border-t border-slate-100" /><button type="button" onClick={() => handleCancelOrder(order)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"><XCircle className="h-4 w-4" /> Cancel Order</button></>}</div>}</div></div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>Showing {pagination.total ? ((pagination.page - 1) * pagination.limit + 1) : 0}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders</span>
            <div className="flex items-center gap-2"><button type="button" disabled={!pagination.hasPrev || loading} onClick={() => fetchOrders(pagination.page - 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-2 font-semibold text-white">{pagination.page}</span><button type="button" disabled={!pagination.hasNext || loading} onClick={() => fetchOrders(pagination.page + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminOrders

