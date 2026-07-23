import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Folder,
  Image as ImageIcon,
  Info,
  Loader2,
  Save,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { adminService } from '../../services/adminServiceMethods'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const AdminCreateCategory: React.FC = () => {
  const navigate = useNavigate()
  const nameInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleFile = (file?: File) => {
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please choose a JPG, PNG, WEBP, or GIF image.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be 5MB or smaller.')
      return
    }

    setImageFile(file)
    setImagePreview((current) => {
      if (current.startsWith('blob:')) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview((current) => {
      if (current.startsWith('blob:')) URL.revokeObjectURL(current)
      return ''
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('Category name is required.')
      nameInputRef.current?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', trimmedName)
      formData.append('description', description.trim())
      formData.append('isActive', String(isActive))
      formData.append('featured', String(featured))
      if (imageFile) formData.append('image', imageFile)

      const response = await adminService.createCategory(formData)
      if (!response.success) {
        throw new Error(response.message || 'Failed to create category')
      }

      toast.success('Category created successfully.')
      navigate('/admin/categories')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create category')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex items-center gap-3 text-sm text-slate-500">
          <button type="button" onClick={() => navigate('/admin/categories')} className="transition hover:text-blue-600">Categories</button>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-700">Create New Category</span>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button type="button" onClick={() => navigate('/admin/categories')} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" aria-label="Back to categories">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Create New Category</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Add a new category to organize your products</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:gap-6">
          <div className="contents">
            <section className="order-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-start-1 xl:row-start-1">
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Folder className="h-5 w-5" /></span>
                <div><h2 className="font-semibold text-slate-900">Category Information</h2><p className="text-xs text-slate-500">The basics customers see in your catalog</p></div>
              </div>
              <div className="contents">
                <div>
                  <label htmlFor="category-name" className="mb-2 block text-sm font-medium text-slate-700">Category Name <span className="text-red-500">*</span></label>
                  <input ref={nameInputRef} id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter category name" autoComplete="off" required className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="category-description" className="block text-sm font-medium text-slate-700">Description</label><span className="text-xs text-slate-400">{description.length}/255</span></div>
                  <textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 255))} placeholder="Enter category description" rows={6} className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>
              </div>
            </section>

            <section className="order-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-start-1 xl:row-start-2">
              <div className="mb-4 flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Info className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Category Details</h2><p className="text-xs text-slate-500">Keep your catalog organized and easy to discover</p></div></div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-600">Category URLs and search metadata are generated by the current catalog system from the category name. Add a clear, customer-friendly description above to help shoppers understand what belongs in this category.</div>
            </section>

            <section className="order-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-start-1 xl:row-start-3">
              <div className="mb-4 flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Check className="h-5 w-5" /></span><h2 className="font-semibold text-slate-900">Category Settings</h2></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className={'flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition ' + (isActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-slate-300')}>
                  <span className="flex items-center gap-3"><span className={'inline-flex h-11 w-11 items-center justify-center rounded-xl ' + (isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500')}><Check className="h-5 w-5" /></span><span><span className="block font-medium text-slate-900">Active</span><span className="mt-0.5 block text-xs text-slate-500">Category will be visible in your store</span></span></span>
                  <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </label>
                <label className={'flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition ' + (featured ? 'border-violet-200 bg-violet-50/50' : 'border-slate-200 bg-white hover:border-slate-300')}>
                  <span className="flex items-center gap-3"><span className={'inline-flex h-11 w-11 items-center justify-center rounded-xl ' + (featured ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500')}><Star className="h-5 w-5" /></span><span><span className="block font-medium text-slate-900">Featured</span><span className="mt-0.5 block text-xs text-slate-500">Show this category in featured sections</span></span></span>
                  <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                </label>
              </div>
            </section>
          </div>

          <div className="contents">
            <section className="order-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-start-2 xl:row-start-1 xl:row-span-2">
              <div className="mb-4 flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><ImageIcon className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Category Image <span className="font-normal text-slate-500">(Optional)</span></h2><p className="text-xs text-slate-500">Use a clear visual shoppers can recognize</p></div></div>
              <input ref={fileInputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleFileInput} className="hidden" />
              <div onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFile(event.dataTransfer.files?.[0]) }} className={'rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ' + (isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/40')}>
                <Upload className="mx-auto h-9 w-9 text-slate-400" /><p className="mt-3 font-medium text-slate-800">Drag &amp; drop image here</p><p className="my-2 text-sm text-slate-500">or</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-700"><Upload className="h-4 w-4" /> Upload Image</button>
                <p className="mt-3 text-xs text-slate-500">PNG, JPG, WEBP, GIF up to 5MB</p>
              </div>
              <div className="mt-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
                <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100 sm:w-40">{imagePreview ? <img src={imagePreview} alt="Category preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-12 w-12 text-slate-300" />}</div>
                <div className="min-w-0 flex-1"><p className="font-medium text-slate-900">{imagePreview ? 'Image selected' : 'No image selected'}</p><p className="mt-1 text-sm leading-5 text-slate-500">{imagePreview ? imageFile?.name : 'Upload an image that represents this category.'}</p>{imagePreview && <button type="button" onClick={removeImage} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"><Trash2 className="h-4 w-4" /> Remove</button>}</div>
              </div>
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4"><div className="flex items-center gap-2 font-medium text-blue-800"><Info className="h-4 w-4" /> Image Tips</div><ul className="mt-2 space-y-1 text-sm leading-5 text-slate-600"><li>• Use a clear, high-quality image</li><li>• Recommended size: 800×600px</li><li>• Aspect ratio: 4:3 works best</li></ul></div>
            </section>

            <section className="order-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-start-2 xl:row-start-3 xl:sticky xl:top-24">
              <h2 className="mb-4 font-semibold text-slate-900">Actions</h2>
              <button type="submit" disabled={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{isSubmitting ? 'Creating Category...' : 'Create Category'}</button>
              <button type="button" onClick={() => navigate('/admin/categories')} disabled={isSubmitting} className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
            </section>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminCreateCategory




