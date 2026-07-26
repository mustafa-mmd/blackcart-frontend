// Frontend-blackcart/src/pages/admin/AdminCreateProduct.tsx
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2,
  Package,
  Tag,
  BookOpen,
  BarChart,
  Award,
  Save,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  Palette,
  Images,
  Boxes,
  Sparkles,
  MoreVertical,
  ImagePlus,
  UploadCloud,
  Download,
  Copy,
  MoveUp,
  MoveDown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import Loader from '../../components/common/Loader'

interface Specification {
  key: string
  value: string
}

interface ProductFormData {
  name: string
  description: string
  shortDescription: string
  price: number
  discountPrice?: number
  categoryId: string
  brand: string
  sku: string
  stock: number
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  specifications: Specification[]
  features: string[]
}

interface Category {
  _id: string
  name: string
  slug: string
  isActive: boolean
  featured: boolean
  productCount?: number
}

interface PendingImage {
  id: string
  file?: File
  remote?: { url: string; public_id: string; alt?: string }
  previewUrl: string
}

interface ColorVariantDraft {
  id: string
  name: string
  value: string
  sku: string
  stock: string
  imageIds: string[]
  active: boolean
}
type BulkMode = 'specifications' | 'features'
type DuplicateAction = 'skip' | 'replace' | 'duplicate'

interface SpecificationPreviewRow extends Specification {
  source: string
  duplicate: boolean
  action: DuplicateAction
}

interface FeaturePreviewRow {
  value: string
  source: string
  duplicate: boolean
  action: DuplicateAction
}

interface BulkPreviewState {
  mode: BulkMode
  specifications: SpecificationPreviewRow[]
  features: FeaturePreviewRow[]
  rejected: string[]
}

const SPECIFICATION_TEMPLATES = {
  'Gaming Mouse': {
    specifications: [
      { key: 'Brand', value: 'Generic' },
      { key: 'Connectivity', value: 'Bluetooth + 2.4GHz' },
      { key: 'DPI', value: '1600' },
      { key: 'Battery', value: 'Rechargeable' },
      { key: 'Charging Port', value: 'USB-C' }
    ],
    features: ['Silent Click', 'Ergonomic Design', 'USB-C Charging', 'Plug & Play', 'Multi-Device Support']
  },
  'Mechanical Keyboard': {
    specifications: [
      { key: 'Switch Type', value: 'Mechanical' },
      { key: 'Connectivity', value: 'USB / Wireless' },
      { key: 'Backlight', value: 'RGB' },
      { key: 'Layout', value: 'Compact' },
      { key: 'Warranty', value: '1 Year' }
    ],
    features: ['RGB Backlight', 'Tactile Typing', 'Durable Keycaps', 'Anti-Ghosting', 'Compact Layout']
  },
  'Laptop Stand': {
    specifications: [
      { key: 'Material', value: 'Aluminum / ABS' },
      { key: 'Adjustable Height', value: 'Yes' },
      { key: 'Compatibility', value: 'Laptop & Tablet' },
      { key: 'Foldable', value: 'Yes' },
      { key: 'Weight', value: 'Portable' }
    ],
    features: ['Foldable', 'Ergonomic Design', 'Anti-slip Base', 'Portable', 'Adjustable Angles']
  },
  'Power Bank': {
    specifications: [
      { key: 'Capacity', value: '10000mAh' },
      { key: 'Input', value: 'USB-C' },
      { key: 'Output', value: 'Fast Charging' },
      { key: 'Ports', value: 'Multiple' },
      { key: 'Warranty', value: '1 Year' }
    ],
    features: ['Fast Charging', 'Portable Design', 'Multiple Ports', 'LED Indicator', 'Safe Charging']
  },
  'Earbuds': {
    specifications: [
      { key: 'Connectivity', value: 'Bluetooth' },
      { key: 'Battery Life', value: 'Up to 20 Hours' },
      { key: 'Charging Case', value: 'Included' },
      { key: 'Microphone', value: 'Built-in' },
      { key: 'Warranty', value: '1 Year' }
    ],
    features: ['Clear Sound', 'Touch Controls', 'Comfort Fit', 'Noise Reduction', 'Long Battery Life']
  }
} as const

const SPECIFICATION_SUGGESTIONS = [
  'Brand', 'Warranty', 'Weight', 'Material', 'Battery', 'Battery Capacity', 'Battery Life',
  'Battery Type', 'Charging Port', 'Bluetooth Version', 'Connectivity', 'DPI', 'Wireless Range',
  'Compatibility', 'Dimensions'
]

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

interface DroppedImageData {
  urls: string[]
  sourceUrl?: string
}

const normalizeExternalImageUrl = (value: string): string | null => {
  const trimmed = value.trim().replace(/^["']|["']$/g, '')
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null

  const candidate = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed
  try {
    const parsed = new URL(candidate)
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}

const extractDroppedImageData = (dataTransfer: DataTransfer): DroppedImageData => {
  const candidates: string[] = []
  let sourceUrl: string | undefined
  const addCandidate = (value: string | null | undefined) => {
    if (!value) return
    const normalized = normalizeExternalImageUrl(value)
    if (normalized) candidates.push(normalized)
  }

  const html = dataTransfer.getData('text/html')
  if (html) {
    const documentFragment = new DOMParser().parseFromString(html, 'text/html')
    documentFragment.querySelectorAll('img, source').forEach((element) => {
      ;['src', 'data-src', 'data-lazy-src', 'data-original', 'data-image'].forEach((attribute) => {
        addCandidate(element.getAttribute(attribute))
      })

      ;['srcset', 'data-srcset'].forEach((attribute) => {
        const srcset = element.getAttribute(attribute)
        srcset?.split(',').forEach((entry) => addCandidate(entry.trim().split(/\s+/)[0]))
      })
    })

    documentFragment.querySelectorAll<HTMLElement>('[style*="background-image"]').forEach((element) => {
      const match = element.style.backgroundImage.match(/url\((['"]?)(.*?)\1\)/i)
      addCandidate(match?.[2])
    })

    const linkedPage = documentFragment.querySelector<HTMLAnchorElement>('a[href]')?.href
    sourceUrl = normalizeExternalImageUrl(linkedPage || '') || undefined
  }

  ;['text/uri-list', 'text/x-moz-url', 'text/plain'].forEach((type) => {
    const value = dataTransfer.getData(type)
    value.split(/\r?\n/).forEach((line) => {
      if (!line.trim().startsWith('#')) addCandidate(line)
    })
  })

  return { urls: Array.from(new Set(candidates)), sourceUrl }
}

const AdminCreateProduct: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<PendingImage[]>([])
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const previewUrlsRef = useRef(new Set<string>())
  const pointerDragIdRef = useRef<string | null>(null)
  const [specifications, setSpecifications] = useState<Specification[]>([{ key: '', value: '' }])
  const [features, setFeatures] = useState<string[]>([''])
  const [specSearch, setSpecSearch] = useState('')
  const [featureSearch, setFeatureSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [remoteImageUrl, setRemoteImageUrl] = useState('')
  const [isImportingImage, setIsImportingImage] = useState(false)
  const [colorVariants, setColorVariants] = useState<ColorVariantDraft[]>([])
  const [draggedColorId, setDraggedColorId] = useState<string | null>(null)
  const [openImagePicker, setOpenImagePicker] = useState<string | null>(null)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        console.log('📡 Fetching categories...')
        const response = await adminService.getCategories()
        
        if (response.success) {
          console.log(`✅ Loaded ${response.data?.categories?.length || 0} categories`)
          setCategories(response.data?.categories || [])
        } else {
          toast.error('Failed to load categories')
        }
      } catch (error: unknown) {
        console.error('Error fetching categories:', error)
        toast.error(getErrorMessage(error, 'Failed to load categories'))
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  useEffect(() => () => {
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    previewUrlsRef.current.clear()
  }, [])

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    defaultValues: {
      isFeatured: false,
      isActive: true,
      stock: 0,
      price: 0,
      tags: [],
      specifications: [{ key: '', value: '' }],
      features: [''],
      categoryId: ''
    }
  })

  const addLocalImages = (selectedFiles: File[]) => {
    const availableSlots = Math.max(10 - images.length, 0)
    const files = selectedFiles.slice(0, availableSlots)
    console.log(`📁 Selected ${files.length} files`);

    if (selectedFiles.length > availableSlots) {
      toast.error(`You can upload a maximum of 10 images. ${availableSlots} slot(s) remaining.`)
    }
    
    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    const validFiles: File[] = []
    
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPEG, PNG, WebP, and GIF are allowed.`)
        return
      }
      
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`)
        return
      }
      
      validFiles.push(file)
    })
    
    if (validFiles.length === 0) {
      return
    }

    console.log(`✅ Added ${validFiles.length} valid images`)
    const pendingImages = validFiles.map((file, index) => {
      const previewUrl = URL.createObjectURL(file)
      previewUrlsRef.current.add(previewUrl)
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
        file,
        previewUrl,
      }
    })
    setImages(previous => [...previous, ...pendingImages])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    addLocalImages(Array.from(e.target.files))
    e.target.value = ''
  }

  const importRemoteImageUrls = async (rawUrls: string[], sourceUrl?: string, clearInput = false) => {
    const urls = Array.from(new Set(rawUrls.map(normalizeExternalImageUrl).filter((url): url is string => Boolean(url))))
    if (!urls.length) {
      toast.error('No public image URL was found. Save the image to your device, then upload the saved file.')
      return
    }

    const availableSlots = Math.max(10 - images.length, 0)
    if (!availableSlots) {
      toast.error('You can upload a maximum of 10 images')
      return
    }

    const selectedUrls = urls.slice(0, availableSlots)
    const importedImages: PendingImage[] = []
    const failures: string[] = []

    try {
      setIsImportingImage(true)
      for (const url of selectedUrls) {
        try {
          const response = await adminService.importRemoteProductImage(url, sourceUrl)
          const imported = response.data
          if (!imported?.url || !imported.public_id) throw new Error('The image import did not return a valid file')
          importedImages.push({
            id: `remote-${imported.public_id}-${Date.now()}-${importedImages.length}`,
            remote: imported,
            previewUrl: imported.url,
          })
        } catch (error) {
          failures.push(getErrorMessage(error, 'Marketplace blocked the image import'))
        }
      }

      if (importedImages.length) {
        setImages((previous) => [...previous, ...importedImages].slice(0, 10))
        if (clearInput) setRemoteImageUrl('')
        toast.success(`${importedImages.length} web image${importedImages.length === 1 ? '' : 's'} imported securely`)
      }

      if (failures.length) {
        toast.error(
          importedImages.length
            ? `${failures.length} image${failures.length === 1 ? '' : 's'} could not be imported.`
            : `${failures[0]} Try opening the image itself in a new tab and paste that URL, or use "Save image as" and upload the file.`,
          { duration: 7000 }
        )
      }
    } finally {
      setIsImportingImage(false)
    }
  }

  const handleImageDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    if (isImportingImage) return

    const droppedFiles = Array.from(event.dataTransfer.files)
    if (droppedFiles.length) {
      addLocalImages(droppedFiles)
      return
    }

    const dropped = extractDroppedImageData(event.dataTransfer)
    await importRemoteImageUrls(dropped.urls, dropped.sourceUrl)
  }

  const handleRemoteImageImport = async () => {
    const url = remoteImageUrl.trim()
    if (!url) return toast.error('Enter a public image URL')
    await importRemoteImageUrls([url], undefined, true)
  }

  const suggestColorSku = (name: string) => {
    const base = String(watch('sku') || 'COLOR').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const suffix = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    return suffix ? (base || 'COLOR') + '-' + suffix : ''
  }

  const addColorVariant = () => setColorVariants((previous) => [...previous, {
    id: 'color-' + Date.now(),
    name: '',
    value: '#000000',
    sku: '',
    stock: '',
    imageIds: [],
    active: true,
  }])

  const updateColorVariant = (id: string, updates: Partial<ColorVariantDraft>) => {
    setColorVariants((previous) => previous.map((variant) => variant.id === id ? { ...variant, ...updates } : variant))
  }

  const handleColorNameChange = (id: string, name: string) => {
    setColorVariants((previous) => previous.map((variant) => {
      const previousSuggestedSku = suggestColorSku(variant.name)
      const shouldSuggestSku = !variant.sku || variant.sku === previousSuggestedSku
      return variant.id === id ? { ...variant, name, sku: shouldSuggestSku ? suggestColorSku(name) : variant.sku } : variant
    }))
  }

  const moveColorVariant = (id: string, direction: -1 | 1) => {
    setColorVariants((previous) => {
      const index = previous.findIndex((variant) => variant.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= previous.length) return previous
      const next = [...previous]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next
    })
  }

  const duplicateColorVariant = (id: string) => {
    setColorVariants((previous) => {
      const source = previous.find((variant) => variant.id === id)
      if (!source) return previous
      const copy = { ...source, id: 'color-' + Date.now(), name: source.name ? source.name + ' Copy' : '', sku: source.sku ? (source.sku + '-COPY').slice(0, 80) : '' }
      const index = previous.findIndex((variant) => variant.id === id)
      const next = [...previous]
      next.splice(index + 1, 0, copy)
      return next
    })
  }

  const removeColorVariant = (id: string) => {
    setColorVariants((previous) => previous.filter((variant) => variant.id !== id))
    setOpenImagePicker((current) => current === id ? null : current)
  }

  const handleColorDrop = (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedColorId
    if (!sourceId || sourceId === targetId) return
    setColorVariants((previous) => {
      const from = previous.findIndex((variant) => variant.id === sourceId)
      const to = previous.findIndex((variant) => variant.id === targetId)
      if (from < 0 || to < 0) return previous
      const next = [...previous]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setDraggedColorId(null)
  }

  const assignImagesToUnassigned = () => {
    if (!images.length) {
      toast.error('Upload product images before assigning them to colors.')
      return
    }
    setColorVariants((previous) => previous.map((variant) => variant.imageIds.length ? variant : { ...variant, imageIds: [images[0].id] }))
    toast.success('Assigned the first uploaded image to colors without an image.')
  }

  const handleColorImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) addLocalImages(Array.from(event.target.files))
    event.target.value = ''
  }

  const exportColors = () => {
    const payload = colorVariants.map((variant) => {
      const payloadVariant = { ...variant }
      delete payloadVariant.id
      return payloadVariant
    })
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'blackcart-color-variants.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImportColors = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      const imported = Array.isArray(parsed) ? parsed : parsed.colors
      if (!Array.isArray(imported)) throw new Error('Expected a JSON array of colors.')
      const next = imported.map((variant, index) => ({
        id: 'color-import-' + Date.now() + '-' + index,
        name: String(variant.name || ''),
        value: /^#[0-9a-f]{6}$/i.test(String(variant.value || '')) ? String(variant.value).toUpperCase() : '#000000',
        sku: String(variant.sku || ''),
        stock: variant.stock === null || variant.stock === undefined ? '' : String(variant.stock),
        imageIds: [],
        active: variant.active !== false,
      }))
      setColorVariants((previous) => [...previous, ...next])
      toast.success(next.length + ' color variant' + (next.length === 1 ? '' : 's') + ' imported.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Import a valid color JSON file.'))
    }
  }
  const handleRemoveImage = (index: number) => {
    const image = images[index]
    if (image?.file) {
      URL.revokeObjectURL(image.previewUrl)
      previewUrlsRef.current.delete(image.previewUrl)
    }
    setImages(previous => previous.filter((_, imageIndex) => imageIndex !== index))
    if (image) {
      setColorVariants((previous) => previous.map((variant) => ({
        ...variant,
        imageIds: variant.imageIds.filter((id) => id !== image.id),
      })))
    }
    console.log(`🗑️ Removed image at index ${index}`)
  }

  const reorderImage = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return
    setImages(previous => {
      const sourceIndex = previous.findIndex(image => image.id === sourceId)
      const targetIndex = previous.findIndex(image => image.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return previous
      const reordered = [...previous]
      const [movedImage] = reordered.splice(sourceIndex, 1)
      reordered.splice(targetIndex, 0, movedImage)
      return reordered
    })
  }

  const moveImage = (sourceIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= images.length) return
    reorderImage(images[sourceIndex].id, images[targetIndex].id)
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, imageId: string) => {
    setDraggedImageId(imageId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', imageId)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedImageId
    if (sourceId) reorderImage(sourceId, targetId)
    setDraggedImageId(null)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, imageId: string) => {
    event.preventDefault()
    pointerDragIdRef.current = imageId
    setDraggedImageId(imageId)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const sourceId = pointerDragIdRef.current
    if (!sourceId) return
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-image-id]')
    const targetId = target?.dataset.imageId
    if (targetId) reorderImage(sourceId, targetId)
  }

  const endPointerDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    pointerDragIdRef.current = null
    setDraggedImageId(null)
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }])
    console.log('➕ Added new specification field')
  }

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      const newSpecs = specifications.filter((_, i) => i !== index)
      setSpecifications(newSpecs)
      setValue('specifications', newSpecs, { shouldValidate: true })
      console.log(`🗑️ Removed specification at index ${index}`)
    }
  }

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications]
    newSpecs[index][field] = value
    setSpecifications(newSpecs)
    setValue('specifications', newSpecs, { shouldValidate: true })
  }

  const moveSpecification = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= specifications.length) return
    const newSpecs = [...specifications]
    const [moved] = newSpecs.splice(index, 1)
    newSpecs.splice(targetIndex, 0, moved)
    setSpecifications(newSpecs)
    setValue('specifications', newSpecs, { shouldValidate: true })
  }

  const addFeature = () => {
    setFeatures([...features, ''])
    console.log('➕ Added new feature field')
  }

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index)
      setFeatures(newFeatures)
      setValue('features', newFeatures, { shouldValidate: true })
      console.log(`🗑️ Removed feature at index ${index}`)
    }
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
    setValue('features', newFeatures, { shouldValidate: true })
  }

  const moveFeature = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= features.length) return
    const newFeatures = [...features]
    const [moved] = newFeatures.splice(index, 1)
    newFeatures.splice(targetIndex, 0, moved)
    setFeatures(newFeatures)
    setValue('features', newFeatures, { shouldValidate: true })
  }

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleExportSpecifications = () => {
    const rows = specifications
      .map((spec) => ({ key: spec.key.trim(), value: spec.value.trim() }))
      .filter((spec) => spec.key || spec.value)
      .map((spec) => `${spec.key}: ${spec.value}`)

    if (!rows.length) {
      toast.error('Add at least one specification before exporting.')
      return
    }

    downloadTextFile('product-specifications.txt', rows.join('\n'))
    toast.success('Specifications exported.')
  }

  const exportFeatures = () => {
    const rows = features
      .map((feature) => feature.trim())
      .filter(Boolean)

    if (!rows.length) {
      toast.error('Add at least one feature before exporting.')
      return
    }

    downloadTextFile('product-features.txt', rows.join('\n'))
    toast.success('Features exported.')
  }

  const recentSpecKeys = specifications
    .map((spec) => spec.key.trim())
    .filter(Boolean)
    .slice(-20)

  const normalizeSmartText = (value: string) => value
    .replace(/^[-•✓*]+\s*/g, '')
    .replace(/\busb\s*c\b/gi, 'USB-C')
    .replace(/\bbluetooth\b/gi, 'Bluetooth')
    .replace(/\s+/g, ' ')
    .trim()

  const addSuggestedSpecification = (key: string) => {
    const cleanKey = normalizeSmartText(key)
    if (!cleanKey) return

    const existingIndex = specifications.findIndex((spec) => spec.key.trim().toLowerCase() === cleanKey.toLowerCase())
    if (existingIndex >= 0) {
      toast('Specification already exists. You can edit it below.')
      setSpecSearch(cleanKey)
      return
    }

    const nextSpecs = [...specifications.filter((spec) => spec.key.trim() || spec.value.trim()), { key: cleanKey, value: '' }]
    setSpecifications(nextSpecs)
    setValue('specifications', nextSpecs, { shouldValidate: true })
    setSpecSearch(cleanKey)
  }

  const loadTemplate = (template: keyof typeof SPECIFICATION_TEMPLATES) => {
    const selectedTemplate = SPECIFICATION_TEMPLATES[template]
    const nextSpecs = selectedTemplate.specifications.map((spec) => ({ ...spec }))
    const nextFeatures = [...selectedTemplate.features]
    setSpecifications(nextSpecs)
    setFeatures(nextFeatures)
    setValue('specifications', nextSpecs, { shouldValidate: true })
    setValue('features', nextFeatures, { shouldValidate: true })
    toast.success(`${template} template loaded.`)
  }

  const parseSpecificationLines = (input: string): Specification[] => input
    .split(/\r?\n/)
    .map((line) => normalizeSmartText(line))
    .filter(Boolean)
    .map((line) => {
      const separatorMatch = line.match(/^(.+?)\s*[:=|\-]\s*(.+)$/)
      if (separatorMatch) {
        return { key: normalizeSmartText(separatorMatch[1]), value: normalizeSmartText(separatorMatch[2]) }
      }
      const parts = line.split(' ').filter(Boolean)
      if (parts.length >= 2) {
        return { key: normalizeSmartText(parts[0]), value: normalizeSmartText(parts.slice(1).join(' ')) }
      }
      return null
    })
    .filter((spec): spec is Specification => Boolean(spec && spec.key && spec.value))

  const openSmartPaste = (mode: BulkMode) => {
    const pasted = window.prompt(
      mode === 'specifications'
        ? 'Paste specifications, one per line. Example: Brand: Logitech'
        : 'Paste features, one per line. Example: Rechargeable Battery'
    )

    if (!pasted) return

    if (mode === 'specifications') {
      const parsedSpecs = parseSpecificationLines(pasted)
      if (!parsedSpecs.length) {
        toast.error('No valid specifications found. Try Brand: Logitech format.')
        return
      }
      const existingKeys = new Set(specifications.map((spec) => spec.key.trim().toLowerCase()).filter(Boolean))
      const uniqueSpecs = parsedSpecs.filter((spec) => !existingKeys.has(spec.key.trim().toLowerCase()))
      const nextSpecs = [...specifications.filter((spec) => spec.key.trim() || spec.value.trim()), ...uniqueSpecs]
      setSpecifications(nextSpecs)
      setValue('specifications', nextSpecs, { shouldValidate: true })
      toast.success(`Imported ${uniqueSpecs.length} specifications.`)
      return
    }

    const existingFeatures = new Set(features.map((feature) => feature.trim().toLowerCase()).filter(Boolean))
    const parsedFeatures = pasted
      .split(/\r?\n/)
      .map((line) => normalizeSmartText(line))
      .filter(Boolean)
      .filter((feature) => !existingFeatures.has(feature.toLowerCase()))

    if (!parsedFeatures.length) {
      toast.error('No new features found.')
      return
    }

    const nextFeatures = [...features.filter((feature) => feature.trim()), ...parsedFeatures]
    setFeatures(nextFeatures)
    setValue('features', nextFeatures, { shouldValidate: true })
    toast.success(`Imported ${parsedFeatures.length} features.`)
  }

  const generateFromDescription = () => {
    const description = `${watch('shortDescription') || ''} ${watch('description') || ''}`.trim()
    if (!description) {
      toast.error('Add a short or full description first.')
      return
    }

    const generatedSpecs: Specification[] = []
    const generatedFeatures: string[] = []
    const lowerDescription = description.toLowerCase()

    if (lowerDescription.includes('bluetooth') || lowerDescription.includes('2.4ghz')) {
      generatedSpecs.push({ key: 'Connectivity', value: lowerDescription.includes('bluetooth') && lowerDescription.includes('2.4ghz') ? 'Bluetooth + 2.4GHz' : lowerDescription.includes('bluetooth') ? 'Bluetooth' : '2.4GHz' })
      generatedFeatures.push('Wireless Connectivity')
    }
    const batteryMatch = description.match(/(\d+\s*mAh)/i)
    if (batteryMatch) {
      generatedSpecs.push({ key: 'Battery', value: `${batteryMatch[1].replace(/\s+/g, '')} Rechargeable` })
      generatedFeatures.push('Rechargeable Battery')
    }
    const dpiMatch = description.match(/(\d{3,5})\s*DPI/i)
    if (dpiMatch) generatedSpecs.push({ key: 'DPI', value: dpiMatch[1] })
    if (/usb\s*-?\s*c/i.test(description)) {
      generatedSpecs.push({ key: 'Charging Port', value: 'USB-C' })
      generatedFeatures.push('USB-C Charging')
    }
    if (lowerDescription.includes('ergonomic')) generatedFeatures.push('Ergonomic Design')
    if (lowerDescription.includes('silent')) generatedFeatures.push('Silent Click')
    if (lowerDescription.includes('windows') || lowerDescription.includes('mac')) {
      generatedSpecs.push({ key: 'Compatibility', value: lowerDescription.includes('windows') && lowerDescription.includes('mac') ? 'Windows, macOS' : lowerDescription.includes('windows') ? 'Windows' : 'macOS' })
    }

    if (!generatedSpecs.length && !generatedFeatures.length) {
      toast.error('Could not detect specs/features from the description. Use Smart Paste instead.')
      return
    }

    const existingKeys = new Set(specifications.map((spec) => spec.key.trim().toLowerCase()).filter(Boolean))
    const existingFeatures = new Set(features.map((feature) => feature.trim().toLowerCase()).filter(Boolean))
    const nextSpecs = [
      ...specifications.filter((spec) => spec.key.trim() || spec.value.trim()),
      ...generatedSpecs.filter((spec) => !existingKeys.has(spec.key.trim().toLowerCase()))
    ]
    const nextFeatures = [
      ...features.filter((feature) => feature.trim()),
      ...generatedFeatures.filter((feature) => !existingFeatures.has(feature.toLowerCase()))
    ]

    setSpecifications(nextSpecs.length ? nextSpecs : specifications)
    setFeatures(nextFeatures.length ? nextFeatures : features)
    setValue('specifications', nextSpecs, { shouldValidate: true })
    setValue('features', nextFeatures, { shouldValidate: true })
    toast.success('Generated suggestions from description.')
  }

  const safeSplit = (value: unknown): string[] => {
    if (!value) return [];
    
    if (Array.isArray(value)) {
      return value
        .map(item => String(item).trim())
        .filter(item => item.length > 0);
    }
    
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    return [];
  }

  const onSubmit = async (data: ProductFormData) => {
    console.log('🚀 Starting form submission');
    const normalizedColorNames = colorVariants.map((variant) => variant.name.trim().toLocaleLowerCase('en')).filter(Boolean)
    if (normalizedColorNames.length !== new Set(normalizedColorNames).size) {
      toast.error('Color names must be unique.')
      return
    }
    if (colorVariants.some((variant) => !variant.name.trim())) {
      toast.error('Each color variant needs a name.')
      return
    }
    
    try {
      setIsSubmitting(true);
      
      // Validate images
      if (images.length === 0) {
        toast.error('Please select at least one product image');
        setIsSubmitting(false);
        return;
      }
      
      // Validate category selection
      if (!data.categoryId) {
        toast.error('Please select a category');
        setIsSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle special cases for arrays and objects
          if (key === 'specifications' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'features' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'tags' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'categoryId') {
            // Ensure categoryId is sent
            formData.append('categoryId', value);
            console.log(`✅ Added categoryId:`, value);
          } else if (key === 'discountPrice') {
            const discountPrice = Number(value)
            if (Number.isFinite(discountPrice) && discountPrice > 0) {
              formData.append(key, String(discountPrice))
            }
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      const localImages = images.filter((image): image is PendingImage & { file: File } => Boolean(image.file))
      const remoteImages = images.filter((image): image is PendingImage & { remote: NonNullable<PendingImage['remote']> } => Boolean(image.remote))
      localImages.forEach((image) => formData.append('images', image.file, image.file.name))
      if (remoteImages.length) formData.append('preuploadedImages', JSON.stringify(remoteImages.map((image) => image.remote)))
      formData.append('imageOrder', JSON.stringify(images.map((image) => ({
        kind: image.file ? 'local' : 'remote',
        index: image.file ? localImages.findIndex((candidate) => candidate.id === image.id) : remoteImages.findIndex((candidate) => candidate.id === image.id),
      }))))
      formData.append('colorVariants', JSON.stringify(colorVariants.map((variant) => ({
        name: variant.name,
        value: variant.value,
        sku: variant.sku,
        stock: variant.stock,
        imageIndexes: variant.imageIds.map((imageId) => images.findIndex((image) => image.id === imageId)).filter((index) => index >= 0),
      }))))
      
      // Debug form data
      console.log('📦 FormData contents:');
      for (const pair of formData.entries()) {
        const [key, value] = pair;
        if (value instanceof File) {
          console.log(`  ${key}: File - ${value.name}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      // Make the request
      console.log('📡 Sending to API...');
      const response = await adminService.createProduct(formData);
      console.log('✅ API Response:', response);
      
      if (response.success) {
        toast.success('✅ Product created successfully!');
        
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to create product');
      }
      
    } catch (error: unknown) {
      console.error('❌ API Error:', error);
      
      const errorMessage = getErrorMessage(error, 'Failed to create product');
      
      if (errorMessage.includes('Category')) {
        toast.error('Invalid category selected. Please choose a valid category.');
      } else if (errorMessage.includes('Session expired')) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        toast.error(errorMessage);
      }
      
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/products')
    }
  }

  const price = watch('price')
  const shortDescription = watch('shortDescription') || ''

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
          <span>Products</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-700">Create New Product</span>
        </div>

        {/* Header */}
        <div className="mb-5 lg:mb-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/products')}
                className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Create New Product</h1>
                <p className="mt-1 text-sm text-slate-500">Add a new product to your store</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 xl:gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Package className="h-5 w-5 mr-2" />
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'Product name is required',
                        minLength: { value: 3, message: 'Name must be at least 3 characters' },
                        maxLength: { value: 200, message: 'Name must be less than 200 characters' }
                      })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        {...register('sku', { 
                          required: 'SKU is required',
                          pattern: {
                            value: /^[A-Z0-9-]+$/,
                            message: 'SKU must contain only uppercase letters, numbers, and hyphens'
                          }
                        })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="e.g., PROD-001"
                      />
                      {errors.sku && (
                        <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand *
                      </label>
                      <input
                        type="text"
                        {...register('brand', { 
                          required: 'Brand is required',
                          maxLength: { value: 100, message: 'Brand must be less than 100 characters' }
                        })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        placeholder="Enter brand name"
                      />
                      {errors.brand && (
                        <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <div className="relative">
                        {loadingCategories ? (
                          <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                            <Loader size="sm" />
                            <span className="ml-2 text-gray-500">Loading categories...</span>
                          </div>
                        ) : (
                          <select
                            {...register('categoryId', { 
                              required: 'Category is required'
                            })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 appearance-none"
                          >
                            <option value="">Select a category</option>
                            {categories
                              .filter(cat => cat.isActive)
                              .map(cat => (
                                <option key={cat._id} value={cat._id}>
                                  {cat.name} {cat.productCount ? `(${cat.productCount})` : ''}
                                </option>
                              ))}
                          </select>
                        )}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                      {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        {...register('stock', { 
                          required: 'Stock is required',
                          min: { value: 0, message: 'Stock cannot be negative' },
                          valueAsNumber: true
                        })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                      {errors.stock && (
                        <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (PKR) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-xs font-semibold text-slate-500">PKR</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...register('price', { 
                            required: 'Price is required',
                            min: { value: 0.01, message: 'Price must be greater than 0' },
                            valueAsNumber: true
                          })}
                          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-12 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Price (PKR) <span className="font-normal text-gray-500">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-xs font-semibold text-slate-500">PKR</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('discountPrice', { 
                            min: { value: 0, message: 'Discount price must be positive' },
                            setValueAs: value => value === '' ? undefined : Number(value),
                            validate: (value) => {
                              if (value && value >= price) {
                                return 'Discount price must be less than regular price'
                              }
                              return true
                            }
                          })}
                          placeholder="Leave blank for no discount"
                          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-12 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                      {errors.discountPrice && (
                        <p className="mt-1 text-sm text-red-600">{errors.discountPrice.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Description
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description *
                    </label>
                    <textarea
                      {...register('shortDescription', { 
                        required: 'Short description is required',
                        maxLength: { value: 160, message: 'Short description must be less than 160 characters' }
                      })}
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Brief product description (shown in listings)"
                    />
                    <div className="mt-1 text-right text-xs text-slate-400">{shortDescription.length} / 160</div>
                    {errors.shortDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description
                    </label>
                    <textarea
                      {...register('description', {
                        maxLength: { value: 5000, message: 'Description must be less than 5000 characters' }
                      })}
                      rows={6}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Detailed product description..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <BarChart className="h-5 w-5 mr-2" />
                      Specifications
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">Manual mode stays available. Smart Paste creates many rows fast.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={addSpecification} className="inline-flex items-center rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"><Plus className="h-4 w-4 mr-1" />Add Specification</button>
                    <button type="button" onClick={() => openSmartPaste('specifications')} className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"><Sparkles className="h-4 w-4 mr-1" />Smart Paste</button>
                    <button type="button" onClick={() => openSmartPaste('specifications')} className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4 mr-1" />Import</button>
                    <button type="button" onClick={handleExportSpecifications} className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4 mr-1" />Export</button>
                  </div>
                </div>
                <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <input value={specSearch} onChange={(event) => setSpecSearch(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Search specifications or suggestions..." />
                  <button type="button" onClick={generateFromDescription} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100">Generate from Description</button>
                </div>
                <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                  <p className="mb-2 text-xs font-semibold text-blue-900">Templates & recently used</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(SPECIFICATION_TEMPLATES) as Array<keyof typeof SPECIFICATION_TEMPLATES>).map(template => <button key={template} type="button" onClick={() => loadTemplate(template)} className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">{template}</button>)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...recentSpecKeys, ...SPECIFICATION_SUGGESTIONS].filter((item, index, array) => array.indexOf(item) === index).filter(item => !specSearch || item.toLowerCase().includes(specSearch.toLowerCase())).slice(0, 12).map(item => <button key={item} type="button" onClick={() => addSuggestedSpecification(item)} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 hover:text-blue-700 hover:ring-blue-300">+ {item}</button>)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {specifications.map((spec, index) => {
                    if (specSearch && !`${spec.key} ${spec.value}`.toLowerCase().includes(specSearch.toLowerCase())) return null
                    return (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Specification name (e.g., Color, Weight)"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Value (e.g., Black, 1.5kg)"
                      />
                      <div className="flex shrink-0 flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveSpecification(index, -1)}
                          disabled={index === 0}
                          className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Move specification up"
                          aria-label="Move specification up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSpecification(index, 1)}
                          disabled={index === specifications.length - 1}
                          className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Move specification down"
                          aria-label="Move specification down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        disabled={specifications.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove specification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )})}
                </div>
              </div>

              {/* Features */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Features
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">Paste bullet lists and import them as clean editable feature rows.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={addFeature} className="inline-flex items-center rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"><Plus className="h-4 w-4 mr-1" />Add Feature</button>
                    <button type="button" onClick={() => openSmartPaste('features')} className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"><Sparkles className="h-4 w-4 mr-1" />Smart Paste Features</button>
                    <button type="button" onClick={() => openSmartPaste('features')} className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4 mr-1" />Import</button>
                    <button type="button" onClick={exportFeatures} className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4 mr-1" />Export</button>
                  </div>
                </div>
                <input value={featureSearch} onChange={(event) => setFeatureSearch(event.target.value)} className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Search features..." />
                
                <div className="space-y-3">
                  {features.map((feature, index) => {
                    if (featureSearch && !feature.toLowerCase().includes(featureSearch.toLowerCase())) return null
                    return (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Product feature (e.g., Water resistant, Wireless)"
                      />
                      <div className="flex shrink-0 flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveFeature(index, -1)}
                          disabled={index === 0}
                          className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Move feature up"
                          aria-label="Move feature up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFeature(index, 1)}
                          disabled={index === features.length - 1}
                          className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Move feature down"
                          aria-label="Move feature down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        disabled={features.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove feature"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )})}
                </div>
              </div>
            </div>

            {/* Right Column - Images & Settings */}
            <div className="space-y-6">
              {/* Images */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        data-image-id={image.id}
                        draggable
                        onDragStart={event => handleDragStart(event, image.id)}
                        onDragOver={event => event.preventDefault()}
                        onDrop={event => handleDrop(event, image.id)}
                        onDragEnd={() => setDraggedImageId(null)}
                        className={`rounded-xl border bg-white p-2 shadow-sm transition ${
                          draggedImageId === image.id
                            ? 'scale-95 border-blue-500 opacity-60'
                            : index === 0
                              ? 'border-blue-400 ring-2 ring-blue-100'
                              : 'border-gray-200'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={image.previewUrl}
                            alt={`${image.file?.name || 'Imported web image'}, position ${index + 1}`}
                            draggable="false"
                            className="h-28 w-full rounded-lg object-cover sm:h-32"
                          />
                          <button
                            type="button"
                            onPointerDown={event => handlePointerDown(event, image.id)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={endPointerDrag}
                            onPointerCancel={endPointerDrag}
                            className="touch-none absolute left-1.5 top-1.5 flex h-9 w-9 cursor-grab items-center justify-center rounded-lg bg-gray-950/80 text-white shadow active:cursor-grabbing"
                            aria-label={`Drag image ${index + 1} to reorder`}
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow transition hover:bg-red-700"
                            aria-label={`Remove image ${index + 1}`}
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className={`absolute bottom-1.5 left-1.5 rounded-md px-2 py-1 text-xs font-bold text-white ${index === 0 ? 'bg-blue-700' : 'bg-gray-950/75'}`}>
                            {index === 0 ? 'Primary' : `Position ${index + 1}`}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            disabled={index === 0}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={`Move image ${index + 1} left`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="min-w-0 truncate text-xs text-gray-500" title={image.file?.name || image.remote?.url}>
                            {index + 1} of {images.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            disabled={index === images.length - 1}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={`Move image ${index + 1} right`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {images.length < 10 && (
                      <label
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={handleImageDrop}
                        className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition hover:border-blue-400 hover:bg-blue-50 sm:h-[11.25rem] ${isImportingImage ? 'pointer-events-none opacity-60' : ''}`}
                      >
                        <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-center text-sm font-medium text-gray-700">
                          {isImportingImage ? 'Importing web image...' : 'Upload or drop product images'}
                        </span>
                        <span className="mt-1 text-xs text-gray-500">Max 5MB each · {10 - images.length} left</span>
                        <span className="mt-2 px-3 text-center text-[11px] text-gray-500">Supports local files and images dragged from Google, Alibaba, AliExpress, or Daraz.</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Import a public web image</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="url"
                        value={remoteImageUrl}
                        onChange={(event) => setRemoteImageUrl(event.target.value)}
                        placeholder="https://example.com/product.jpg"
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={handleRemoteImageImport}
                        disabled={isImportingImage}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {isImportingImage ? 'Importing…' : 'Import image'}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">HTTPS/HTTP direct image links only. The server validates type, size, redirects, and private network addresses before saving to Cloudinary. If a marketplace blocks importing, open the image itself in a new tab or save it locally first.</p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-500">
                      Drag images to reorder them. On mobile, drag the grip or use the arrow buttons. The first image is the main storefront image.
                    </p>
                    {images.length > 0 && (
                      <p className="text-green-600 mt-1">
                        {images.length} image(s) to upload
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Palette className="h-5 w-5" /></div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-950">Product Colors</h2>
                      <p className="mt-1 text-sm text-slate-500">Add and manage all available color options for this product.</p>
                    </div>
                  </div>
                  <button type="button" onClick={addColorVariant} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"><Plus className="h-4 w-4" /> Add New Color</button>
                </div>

                <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { icon: Sparkles, title: 'Flexible Options', text: 'Add unlimited color variants', tone: 'bg-blue-50 text-blue-600' },
                    { icon: Images, title: 'Image Support', text: 'Assign images to each color', tone: 'bg-violet-50 text-violet-600' },
                    { icon: Boxes, title: 'Stock Tracking', text: 'Manage stock per variant', tone: 'bg-emerald-50 text-emerald-600' },
                    { icon: CheckCircle2, title: 'Better Experience', text: 'Help customers choose easily', tone: 'bg-orange-50 text-orange-600' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-3 bg-white p-3">
                      <span className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' + item.tone}><item.icon className="h-4 w-4" /></span>
                      <div><p className="text-xs font-semibold text-slate-800">{item.title}</p><p className="mt-0.5 text-[11px] text-slate-500">{item.text}</p></div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {colorVariants.map((variant, index) => {
                    const assignedImage = images.find((image) => variant.imageIds.includes(image.id))
                    const pickerOpen = openImagePicker === variant.id
                    return (
                      <div key={variant.id} draggable onDragStart={(event) => { setDraggedColorId(variant.id); event.dataTransfer.setData('text/plain', variant.id); event.dataTransfer.effectAllowed = 'move' }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleColorDrop(event, variant.id)} className={'rounded-xl border bg-white p-3 transition ' + (draggedColorId === variant.id ? 'border-blue-400 opacity-70 shadow-lg' : 'border-slate-200 hover:border-blue-200 hover:shadow-sm')}>
                        <div className="grid items-start gap-3 lg:grid-cols-[34px_70px_minmax(150px,1.1fr)_minmax(130px,.8fr)_minmax(190px,1.35fr)_minmax(160px,1fr)_104px]">
                          <div className="flex items-center gap-2 pt-2">
                            <button type="button" className="cursor-grab touch-none text-slate-400 hover:text-blue-600" title="Drag to reorder" aria-label={'Reorder color ' + (index + 1)}><GripVertical className="h-5 w-5" /></button>
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] font-semibold text-slate-500">Color Preview</p>
                            <span className="block h-12 w-12 rounded-lg border border-slate-200 shadow-inner" style={{ backgroundColor: variant.value }} title={variant.value} />
                          </div>
                          <label className="block text-xs font-semibold text-slate-600">Color Name <span className="text-red-500">*</span>
                            <div className="relative mt-1"><input value={variant.name} onChange={(event) => handleColorNameChange(variant.id, event.target.value.slice(0, 40))} placeholder="Midnight Black" className="h-10 w-full rounded-lg border border-slate-300 px-3 pr-12 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /><span className="pointer-events-none absolute right-2 top-3 text-[10px] font-normal text-slate-400">{variant.name.length}/40</span></div>
                          </label>
                          <label className="block text-xs font-semibold text-slate-600">Color Code
                            <div className="mt-1 flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-2"><input value={variant.value} onChange={(event) => updateColorVariant(variant.id, { value: event.target.value.toUpperCase().slice(0, 7) })} className="min-w-0 flex-1 border-0 px-1 text-sm font-medium uppercase text-slate-700 outline-none" maxLength={7} /><input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(variant.value) ? variant.value : '#000000'} onChange={(event) => updateColorVariant(variant.id, { value: event.target.value.toUpperCase() })} className="h-6 w-6 cursor-pointer rounded border-0 p-0" aria-label="Choose color" /></div>
                          </label>
                          <div className="relative">
                            <p className="text-xs font-semibold text-slate-600">Color image <span className="font-normal text-slate-400">(Optional)</span></p>
                            <div className="mt-1 flex items-center gap-2">
                              {assignedImage ? <img src={assignedImage.previewUrl} alt={variant.name || 'Assigned color'} className="h-12 w-16 rounded-lg border border-slate-200 object-cover" /> : <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400"><ImagePlus className="h-5 w-5" /></div>}
                              <div className="flex min-w-0 flex-1 flex-col gap-1"><button type="button" onClick={() => setOpenImagePicker(pickerOpen ? null : variant.id)} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-blue-200 px-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"><Images className="h-3.5 w-3.5" /> Choose from uploaded images</button><label className="inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Upload className="h-3.5 w-3.5" /> Upload new image<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleColorImageUpload} /></label></div>
                            </div>
                            {pickerOpen && <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold text-slate-700">Choose a color image</p><button type="button" onClick={() => setOpenImagePicker(null)} className="text-slate-400 hover:text-slate-700">�</button></div>{images.length ? <div className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto">{images.map((image) => <button type="button" key={image.id} onClick={() => { updateColorVariant(variant.id, { imageIds: [image.id] }); setOpenImagePicker(null) }} className={'rounded-lg border p-1 ' + (variant.imageIds.includes(image.id) ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300')}><img src={image.previewUrl} alt="Uploaded product" className="h-11 w-full rounded object-cover" /></button>)}</div> : <p className="py-4 text-center text-xs text-slate-500">Upload product images first.</p>}</div>}
                            {!assignedImage && images.length > 0 && <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-amber-600"><AlertTriangle className="h-3 w-3" /> Assign a color image for this variant.</p>}
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                            <label className="block text-xs font-semibold text-slate-600">SKU <input value={variant.sku} onChange={(event) => updateColorVariant(variant.id, { sku: event.target.value.slice(0, 80).toUpperCase() })} placeholder="Auto-generated" className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                            <label className="block text-xs font-semibold text-slate-600">Stock <input type="number" min="0" value={variant.stock} onChange={(event) => updateColorVariant(variant.id, { stock: event.target.value })} placeholder="0" className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                          </div>
                          <div className="flex items-start justify-between gap-2 pt-1 lg:flex-col lg:items-center">
                            <button type="button" role="switch" aria-checked={variant.active} onClick={() => updateColorVariant(variant.id, { active: !variant.active })} className={'flex h-6 w-11 items-center rounded-full p-1 transition ' + (variant.active ? 'bg-blue-600' : 'bg-slate-300')}><span className={'h-4 w-4 rounded-full bg-white shadow transition ' + (variant.active ? 'translate-x-5' : '')} /></button>
                            <span className="text-[10px] font-medium text-slate-500">{variant.active ? 'Active' : 'Inactive'}</span>
                            <details className="relative"><summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600"><MoreVertical className="h-4 w-4" /></summary><div className="absolute right-0 top-9 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={() => duplicateColorVariant(variant.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-blue-50"><Copy className="h-3.5 w-3.5" /> Duplicate</button><button type="button" onClick={() => moveColorVariant(variant.id, -1)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-blue-50"><MoveUp className="h-3.5 w-3.5" /> Move up</button><button type="button" onClick={() => moveColorVariant(variant.id, 1)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-blue-50"><MoveDown className="h-3.5 w-3.5" /> Move down</button><button type="button" onClick={() => removeColorVariant(variant.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Remove</button></div></details>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {colorVariants.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center"><Palette className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 text-sm font-semibold text-slate-700">No colors added yet</p><p className="mt-1 text-xs text-slate-500">Add a color variant to let customers choose it on the product page.</p></div>}
                </div>

                <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addLocalImages(Array.from(event.dataTransfer.files)) }} className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50">
                  <div className="flex items-center gap-3"><UploadCloud className="h-7 w-7 text-slate-500" /><div><p className="text-sm font-semibold text-slate-700">Drag &amp; drop color images here to upload</p><p className="mt-0.5 text-xs text-slate-500">Supported: JPG, PNG, WEBP � Max size 5MB</p></div></div><span className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"><Upload className="h-3.5 w-3.5" /> Upload Images</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleColorImageUpload} />
                </label>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.4fr_1fr]">
                  <div className="rounded-xl border border-slate-200 p-3"><p className="mb-2 text-xs font-semibold text-slate-800">Bulk Actions</p><div className="flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> Import Colors<input type="file" accept="application/json,.json" className="hidden" onChange={handleImportColors} /></label><button type="button" onClick={exportColors} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> Export Colors</button><button type="button" onClick={assignImagesToUnassigned} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"><ImagePlus className="h-3.5 w-3.5" /> Assign Images</button></div></div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"><p className="flex items-center gap-2 text-xs font-semibold text-blue-900"><CheckCircle2 className="h-4 w-4 text-blue-600" /> Need help?</p><p className="mt-1 text-xs leading-5 text-blue-800">Customers will select a color on the product page. Assigned images can be shown automatically when a color is selected.</p></div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white"><div className="p-3"><p className="text-[11px] font-semibold text-slate-500">Total Colors</p><p className="mt-1 text-xl font-bold text-slate-900">{colorVariants.length}</p></div><div className="p-3"><p className="text-[11px] font-semibold text-slate-500">Total Stock</p><p className="mt-1 text-xl font-bold text-slate-900">{colorVariants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)}</p></div></div>
                </div>
                <div className="sticky bottom-3 z-10 mt-4 flex justify-end gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
                  <button type="button" onClick={handleCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save className="h-4 w-4" /> Save Colors</button>
                </div>
              </section>
              {/* Tags */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Tag className="h-5 w-5 mr-2" />
                  Tags
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Tags
                  </label>
                  <input
                    type="text"
                    {...register('tags', {
                      setValueAs: (value: unknown) => {
                        return safeSplit(value);
                      }
                    })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate tags with commas
                  </p>
                </div>
              </div>

              {/* Settings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isFeatured')}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-gray-700 font-medium">Feature this product</span>
                      <p className="text-sm text-gray-500 mt-1">
                        Show this product in featured sections
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      defaultChecked
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-gray-700 font-medium">Product is active</span>
                      <p className="text-sm text-gray-500 mt-1">
                        Product will be visible to customers
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:sticky xl:top-24">
                <div className="space-y-3">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader size="md" />
                      <span className="ml-3 text-gray-600">Creating product...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Create Product
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminCreateProduct





