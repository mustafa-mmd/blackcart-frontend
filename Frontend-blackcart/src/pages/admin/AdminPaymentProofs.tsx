import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  Filter,
  Image as ImageIcon,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import toast from 'react-hot-toast'

interface PaymentProof {
  _id: string
  orderId: string
  imageUrl: string
  bankName: string
  transactionRef: string
  transactionDate: string
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
}

interface ProofOrder {
  _id: string
  invoiceNumber: string
  totalPrice: number
  user: { _id: string; name: string; email: string; phone: string }
  paymentProof: PaymentProof
  paymentMethod?: string
  createdAt: string
}

const defaultStats = { pending: 0, approved: 0, rejected: 0, total: 0 }

const AdminPaymentProofs: React.FC = () => {
  const [proofs, setProofs] = useState<ProofOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedProof, setSelectedProof] = useState<ProofOrder | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [stats, setStats] = useState(defaultStats)

  const loadProofs = async (pageNum = page) => {
    try {
      setLoading(true)
      const response = await adminService.getPendingPaymentProofs({
        page: pageNum,
        limit: 10,
        status: filter !== 'all' ? filter : undefined,
        search: search.trim() || undefined,
      } as any)
      const data = response.data || {}
      setProofs(data.orders || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotalCount(data.pagination?.total || 0)
      setStats({ ...defaultStats, ...(data.stats || {}) })
      setPage(pageNum)
    } catch (error: any) {
      console.error('Error loading payment proofs:', error)
      toast.error(error?.response?.data?.message || 'Failed to load payment proofs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadProofs(1), search ? 350 : 0)
    return () => window.clearTimeout(timeoutId)
  }, [filter, search])

  const formatAmount = (amount = 0) => 'PKR ' + amount.toLocaleString()
  const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unavailable'
  const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''

  const filteredProofs = useMemo(() => {
    const query = search.trim().toLowerCase()
    return proofs.filter((proof) => {
      if (filter !== 'all' && proof.paymentProof?.status !== filter) return false
      if (!query) return true
      return [
        proof._id,
        proof.invoiceNumber,
        proof.user?.name,
        proof.user?.email,
        proof.paymentProof?.transactionRef,
      ].some((value) => value?.toLowerCase().includes(query))
    })
  }, [proofs, filter, search])

  const clearFilters = () => {
    setSearch('')
    setFilter('pending')
  }

  const hasFilters = Boolean(search || filter !== 'pending')

  const getStatusMeta = (status: string) => {
    if (status === 'approved') return { label: 'Approved', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: <CheckCircle2 className="h-4 w-4" /> }
    if (status === 'rejected') return { label: 'Rejected', classes: 'border-red-200 bg-red-50 text-red-700', icon: <XCircle className="h-4 w-4" /> }
    return { label: 'Pending Review', classes: 'border-amber-200 bg-amber-50 text-amber-700', icon: <Clock3 className="h-4 w-4" /> }
  }

  const openReview = (proof: ProofOrder) => {
    setOpenMenuId(null)
    setSelectedProof(proof)
    setReviewNotes(proof.paymentProof?.reviewNotes || '')
  }

  const closeReview = () => {
    if (reviewing) return
    setSelectedProof(null)
    setReviewNotes('')
  }

  const handleVerify = async (orderId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !reviewNotes.trim()) {
      toast.error('Please provide a reason before rejecting this proof')
      return
    }
    try {
      setReviewing(true)
      await adminService.verifyManualPayment(orderId, { status, reviewNotes: reviewNotes.trim() || undefined })
      toast.success(status === 'approved' ? 'Payment proof approved' : 'Payment proof rejected')
      closeReview()
      await loadProofs(page)
    } catch (error: any) {
      console.error('Error verifying payment proof:', error)
      toast.error(error?.response?.data?.message || 'Failed to verify payment proof')
    } finally {
      setReviewing(false)
    }
  }

  const handleDownloadProof = async (imageUrl: string, orderId: string) => {
    if (!imageUrl) return
    try {
      toast.loading('Downloading proof...', { id: 'proof-download' })
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'payment-proof-' + orderId + '.jpg'
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Proof downloaded', { id: 'proof-download' })
    } catch (error) {
      toast.error('Download failed', { id: 'proof-download' })
      window.open(imageUrl, '_blank')
    }
  }

  const renderSkeleton = () => (
    <div className="space-y-3 p-5">
      {[1, 2, 3, 4].map((row) => <div key={row} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500"><span className="font-medium text-blue-600">Payment Proofs</span><span>/</span><span>Proof Review</span></div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Payment Proofs</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Review and verify bank transfer payment proofs</p>
          </div>
          <button type="button" onClick={() => loadProofs(page)} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw className={'h-4 w-4 ' + (loading ? 'animate-spin' : '')} /> Refresh</button>
        </header>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-end">
            <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search proofs</span><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order ID, invoice, or customer..." className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span><select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"><option value="pending">Pending Review</option><option value="all">All Proofs</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
            <button type="button" onClick={clearFilters} disabled={!hasFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"><Filter className="h-4 w-4" /> Clear filters</button>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            { label: 'Pending Review', value: stats.pending, note: 'Requires verification', icon: <Clock3 className="h-5 w-5" />, tone: 'text-amber-600 bg-amber-50' },
            { label: 'Approved', value: stats.approved, note: 'Verified payments', icon: <ShieldCheck className="h-5 w-5" />, tone: 'text-emerald-600 bg-emerald-50' },
            { label: 'Rejected', value: stats.rejected, note: 'Declined proofs', icon: <XCircle className="h-5 w-5" />, tone: 'text-red-600 bg-red-50' },
            { label: 'Total Proofs', value: stats.total, note: 'All submitted proofs', icon: <FileCheck2 className="h-5 w-5" />, tone: 'text-blue-600 bg-blue-50' },
          ].map((card) => <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">{loading ? <div className="h-20 animate-pulse rounded-xl bg-slate-100" /> : <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500">{card.label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p><p className="mt-1 text-xs text-slate-500">{card.note}</p></div><span className={'inline-flex h-10 w-10 items-center justify-center rounded-xl ' + card.tone}>{card.icon}</span></div>}</div>)}
        </section>

        {stats.pending > 0 && (
          <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><AlertCircle className="h-5 w-5" /></span><div><p className="font-semibold text-amber-900">{stats.pending} payment proof{stats.pending === 1 ? '' : 's'} need your attention</p><p className="text-sm text-amber-800/80">Review submitted bank transfer proofs before confirming customer payments.</p></div></div>
            <button type="button" onClick={() => setFilter('pending')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100">Review Pending <ChevronRight className="h-4 w-4" /></button>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><h2 className="font-semibold text-slate-900">Payment Proof Review</h2><p className="mt-1 text-sm text-slate-500">{loading ? 'Loading proofs...' : 'Showing ' + (totalCount ? ((page - 1) * 10 + 1) : 0) + '–' + Math.min(page * 10, totalCount) + ' of ' + totalCount + ' proofs'}</p></div><span className="text-xs font-medium text-slate-400">Bank transfer verification</span></div>
          {loading ? renderSkeleton() : filteredProofs.length === 0 ? <div className="px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><FileCheck2 className="h-6 w-6" /></div><h3 className="mt-4 text-lg font-semibold text-slate-900">{filter === 'pending' ? 'No Pending Proofs' : 'No Payment Proofs Found'}</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{filter === 'pending' ? "You're all caught up. No payment proofs require review." : 'No payment proofs match your current search or filter.'}</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Clear Filters</button>}</div> : (
            <>
              <div className="hidden overflow-x-auto lg:block"><table className="min-w-[1000px] w-full text-left"><thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Proof</th><th className="px-4 py-4">Customer</th><th className="px-4 py-4">Order</th><th className="px-4 py-4">Amount</th><th className="px-4 py-4">Submitted</th><th className="px-4 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredProofs.map((proof) => { const status = getStatusMeta(proof.paymentProof?.status || 'pending'); const menuOpen = openMenuId === proof._id; return <tr key={proof._id} className="transition hover:bg-slate-50/70"><td className="px-5 py-5 align-top"><div className="flex items-center gap-3"><div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">{proof.paymentProof?.imageUrl ? <img src={proof.paymentProof.imageUrl} alt="Payment proof thumbnail" className="h-full w-full object-cover" /> : <ImageIcon className="m-3 h-6 w-6 text-slate-400" />}</div><div><p className="font-semibold text-slate-900">{proof.paymentProof?._id || 'Proof ' + proof._id.slice(-6)}</p><p className="mt-1 text-xs text-slate-500">Bank Transfer</p></div></div></td><td className="px-4 py-5 align-top"><p className="font-semibold text-slate-900">{proof.user?.name || 'Guest customer'}</p><p className="mt-1 text-sm text-slate-500">{proof.user?.email || 'No email provided'}</p></td><td className="px-4 py-5 align-top"><p className="font-semibold text-slate-900">{proof.invoiceNumber || proof._id.slice(-8).toUpperCase()}</p><p className="mt-1 text-xs text-slate-500">{formatDate(proof.createdAt)}</p></td><td className="px-4 py-5 align-top"><p className="font-bold text-slate-900">{formatAmount(proof.totalPrice)}</p><p className="mt-1 text-xs text-slate-500">{proof.paymentProof?.bankName || 'Bank transfer'}</p></td><td className="px-4 py-5 align-top"><p className="text-sm font-medium text-slate-800">{formatDate(proof.paymentProof?.createdAt || proof.createdAt)}</p><p className="mt-1 text-xs text-slate-500">{formatTime(proof.paymentProof?.createdAt || proof.createdAt)}</p></td><td className="px-4 py-5 align-top"><span className={'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ' + status.classes}>{status.icon}{status.label}</span></td><td className="px-5 py-5 align-top"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => openReview(proof)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"><Eye className="h-4 w-4" /> Review</button><div className="relative"><button type="button" onClick={() => setOpenMenuId(menuOpen ? null : proof._id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" aria-label="More proof actions"><MoreHorizontal className="h-4 w-4" /></button>{menuOpen && <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={() => openReview(proof)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Eye className="h-4 w-4 text-blue-600" /> Open review</button>{proof.paymentProof?.imageUrl && <button type="button" onClick={() => { setOpenMenuId(null); handleDownloadProof(proof.paymentProof.imageUrl, proof._id) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4 text-slate-500" /> Download proof</button>}</div>}</div></div></td></tr> })}</tbody></table></div>
              <div className="space-y-3 p-4 lg:hidden">{filteredProofs.map((proof) => { const status = getStatusMeta(proof.paymentProof?.status || 'pending'); return <article key={proof._id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{proof.paymentProof?._id || 'Payment proof'}</p><p className="mt-1 text-xs text-slate-500">{proof.invoiceNumber || proof._id.slice(-8).toUpperCase()}</p></div><span className={'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold ' + status.classes}>{status.icon}{status.label}</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-500">Customer</p><p className="mt-1 font-semibold text-slate-800">{proof.user?.name || 'Guest customer'}</p></div><div><p className="text-xs text-slate-500">Amount</p><p className="mt-1 font-bold text-slate-900">{formatAmount(proof.totalPrice)}</p></div><div><p className="text-xs text-slate-500">Submitted</p><p className="mt-1 font-medium text-slate-800">{formatDate(proof.paymentProof?.createdAt || proof.createdAt)}</p></div><div><p className="text-xs text-slate-500">Bank</p><p className="mt-1 font-medium text-slate-800">{proof.paymentProof?.bankName || 'Bank transfer'}</p></div></div><button type="button" onClick={() => openReview(proof)} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"><Eye className="h-4 w-4" /> Review proof</button></article> })}</div>
            </>
          )}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5"><span>Showing {totalCount ? ((page - 1) * 10 + 1) : 0}–{Math.min(page * 10, totalCount)} of {totalCount} proofs</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1 || loading} onClick={() => loadProofs(page - 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-2 font-semibold text-white">{page}</span><button type="button" disabled={page >= totalPages || loading} onClick={() => loadProofs(page + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div>
        </section>
      </div>

      {selectedProof && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 sm:p-6">
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
            <div className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Payment Proof Review</p><h2 className="mt-1 text-xl font-bold text-slate-900">Verify submitted payment</h2></div><button type="button" onClick={closeReview} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close review"><X className="h-5 w-5" /></button></div>
              <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.85fr)] sm:p-6">
                <div><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-slate-900">Uploaded proof</h3>{selectedProof.paymentProof?.imageUrl && <button type="button" onClick={() => window.open(selectedProof.paymentProof.imageUrl, '_blank')} className="text-sm font-medium text-blue-600 hover:text-blue-700">Open full size</button>}</div><div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:min-h-[460px]">{selectedProof.paymentProof?.imageUrl ? <img src={selectedProof.paymentProof.imageUrl} alt="Uploaded payment proof" className="max-h-[560px] w-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <div className="text-center text-slate-500"><ImageIcon className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-2">No proof image available</p></div>}</div><div className="mt-3 flex gap-2">{selectedProof.paymentProof?.imageUrl && <button type="button" onClick={() => handleDownloadProof(selectedProof.paymentProof.imageUrl, selectedProof._id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Download proof</button>}</div></div>
                <div className="space-y-4"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-slate-500">Customer</p><p className="mt-1 font-semibold text-slate-900">{selectedProof.user?.name || 'Guest customer'}</p><p className="mt-1 text-xs text-slate-500">{selectedProof.user?.email || 'No email provided'}</p></div><div><p className="text-xs text-slate-500">Amount</p><p className="mt-1 font-bold text-slate-900">{formatAmount(selectedProof.totalPrice)}</p></div><div><p className="text-xs text-slate-500">Invoice</p><p className="mt-1 font-semibold text-slate-900">{selectedProof.invoiceNumber || 'N/A'}</p></div><div><p className="text-xs text-slate-500">Payment method</p><p className="mt-1 font-medium capitalize text-slate-800">{(selectedProof.paymentMethod || 'bank transfer').replace('_', ' ')}</p></div><div><p className="text-xs text-slate-500">Bank</p><p className="mt-1 font-medium text-slate-800">{selectedProof.paymentProof?.bankName || 'N/A'}</p></div><div><p className="text-xs text-slate-500">Transaction ref</p><p className="mt-1 break-all font-medium text-slate-800">{selectedProof.paymentProof?.transactionRef || 'N/A'}</p></div><div className="col-span-2"><p className="text-xs text-slate-500">Submitted</p><p className="mt-1 font-medium text-slate-800">{formatDate(selectedProof.paymentProof?.transactionDate || selectedProof.createdAt)} · {formatTime(selectedProof.paymentProof?.transactionDate || selectedProof.createdAt)}</p></div></div></div>{selectedProof.paymentProof?.status === 'pending' ? <><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Review notes <span className="font-normal text-slate-500">(required for rejection)</span></span><textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} rows={4} placeholder="Add a reason or verification note..." className="w-full resize-none rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label><div className="flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => handleVerify(selectedProof._id, 'approved')} disabled={reviewing} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{reviewing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve Payment</button><button type="button" onClick={() => handleVerify(selectedProof._id, 'rejected')} disabled={reviewing || !reviewNotes.trim()} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"><XCircle className="h-4 w-4" /> Reject Proof</button></div></> : <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-800">Current status: {getStatusMeta(selectedProof.paymentProof?.status || 'pending').label}</p>{selectedProof.paymentProof?.reviewNotes && <p className="mt-2">Notes: {selectedProof.paymentProof.reviewNotes}</p>}</div>}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPaymentProofs

