// ============================================
// USER TYPES
// ============================================

export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'moderator'
  avatar?: string
  emailVerified: boolean
  phone?: string
  shippingAddress: ShippingAddress[]
  cart: CartItem[]
  wishlist: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
  loginAttempts?: number
  lockUntil?: string
  token?: string // Added for auth response
}

export interface ShippingAddress {
  _id?: string
  fullName: string
  address: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
  label?: 'home' | 'work' | 'other'
}

export interface UserProfile extends User {
  stats?: UserStats
  recentOrders?: Order[]
  activeRefunds?: RefundRequest[]
  wishlistItems?: Product[]
}

// ============================================
// PRODUCT TYPES - FIXED VERSION
// ============================================

// Add this new interface before the Product interface
export interface ProductImage {
  url: string
  public_id?: string
  alt?: string
  secure_url?: string
  path?: string
  src?: string
}

export interface Product {
  _id: string
  name: string
  slug: string
  categoryId?: string
  brand: string
  price: number
  discountPrice?: number
  description: string
  shortDescription: string
  // ✅ FIXED: images can be either string[] or ProductImage[] to handle both formats
  images: (string | ProductImage)[]
  thumbnail?: string
  specifications: Specification[]
  features: string[]
  stock: number
  sku: string
  isFeatured: boolean
  isActive: boolean
  tags: string[]
  rating?: number
  numReviews?: number
  weight?: number
  dimensions?: Dimensions
  warranty?: string
  variants?: ProductVariant[]
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
}

// // ============================================
// // PRODUCT TYPES
// // ============================================

// export interface Product {
//   _id: string
//   name: string
//   slug: string
//   // category: string
//   categoryId?: string
//   brand: string
//   price: number
//   discountPrice?: number
//   description: string
//   shortDescription: string
//   images: string[]
//   thumbnail?: string
//   specifications: Specification[]
//   features: string[]
//   stock: number
//   sku: string
//   isFeatured: boolean
//   isActive: boolean
//   tags: string[]
//   rating?: number
//   numReviews?: number
//   weight?: number
//   dimensions?: Dimensions
//   warranty?: string
//   variants?: ProductVariant[]
//   metaTitle?: string
//   metaDescription?: string
//   createdAt: string
//   updatedAt: string
// }

export interface Specification {
  key: string
  value: string
  group?: string
}

export interface Dimensions {
  length: number
  width: number
  height: number
  unit?: 'cm' | 'inch' | 'mm'
}

export interface ProductVariant {
  _id: string
  name: string
  sku: string
  price: number
  discountPrice?: number
  stock: number
  attributes: Record<string, string>
  images?: string[]
}

export interface ProductWithAnalytics extends Product {
  analytics?: {
    totalSold: number
    monthlyRevenue: number
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
    returnRate: number
    averageRating: number
    views: number
    conversionRate: number
  }
}

// ============================================
// CART TYPES
// ============================================

// In your types file, update the CartItem interface:
export interface CartItem {
  _id?: string
  product: string | Product | null  // Add null here
  quantity: number
  addedAt: string
  variant?: ProductVariant | string
  selectedAttributes?: Record<string, string>
  // Add this if it doesn't exist
  image?: string
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
}

// ============================================
// ORDER TYPES
// ============================================

export interface OrderItem {
  _id?: string
  product: string | Product
  variant?: ProductVariant | string
  name: string
  image: string
  price: number
  quantity: number
  sku: string
  selectedAttributes?: Record<string, string>
}

export interface Order {
  _id: string
  user: string | User
  orderItems: OrderItem[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  paymentMethod: PaymentMethodType
  paymentRequest?: PaymentRequest
  paymentResult?: PaymentResult
  paymentProof?: PaymentProof
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  codCharges: number
  discountPrice?: number
  coupon?: CouponApplied
  totalPrice: number
  isPaid: boolean
  paidAt?: string
  isDelivered: boolean
  deliveredAt?: string
  orderStatus: OrderStatus
  trackingNumber?: string
  shippingCarrier?: string
  shippingMethod: ShippingMethod
  estimatedDelivery?: string
  invoiceNumber: string
  pakistanData?: PakistanOrderData
  notes?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned'

export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'free'

export type PaymentMethodType = 
  | 'easypaisa' 
  | 'jazzcash' 
  | 'bank_transfer' 
  | 'cod' 
  | 'card' 
  | 'sadapay' 
  | 'nayapay' 
  | 'other'

export interface PaymentRequest {
  transactionId?: string
  requestId?: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  requestedAt: string
  expiresAt?: string
  providerData?: any
}

export interface PaymentResult {
  id: string
  status: string
  method?: string
  verifiedAt?: string
  email?: string
  amount?: number
  provider?: string
  transactionId?: string
  receiptUrl?: string
}

export interface PakistanOrderData {
  cityCode?: string
  shippingZone?: string
  invoicePrefix?: string
  formattedInvoiceNumber?: string
  gstNumber?: string
  shippingEstimate?: string
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  isActive: boolean
  featured: boolean
  sortOrder?: number
  parent?: string | Category
  children?: Category[]
  productCount?: number
  updatedAt?: string;
}

export interface CategoryWithProducts extends Category {
  products?: Product[];
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  _id: string
  product: string | Product
  user: string | User
  rating: number
  title: string
  comment: string
  images: string[]
  verifiedPurchase: boolean
  helpful: number
  notHelpful: number
  isApproved: boolean
  response?: ReviewResponse
  createdAt: string
  updatedAt: string
}

export interface ReviewResponse {
  _id: string
  adminId: string | User
  response: string
  respondedAt: string
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentMethod {
  id: PaymentMethodType
  name: string
  description: string
  icon: string
  isAvailable: boolean
  minAmount: number
  maxAmount: number
  processingTime: string
  charges: number
  supportedCurrencies: string[]
  requiresVerification?: boolean
}

export interface PaymentProof {
  imageUrl: string
  transactionRef: string
  bankName: string
  transactionDate: string
  notes?: string
  uploadedAt: string
  status: 'pending_review' | 'verified' | 'rejected'
  reviewedBy?: string | User
  reviewedAt?: string
  reviewNotes?: string
}

// ============================================
// PAKISTAN SPECIFIC TYPES
// ============================================

export interface PakistanCity {
  id: string
  name: string
  province: string
  shippingZone: string
  shippingCost: number
  deliveryDays: number
  minDeliveryDays: number
  maxDeliveryDays: number
  isActive: boolean
  codAvailable: boolean
  codMaxAmount?: number
  expressShippingAvailable: boolean
  expressShippingCost?: number
  expressDeliveryDays?: number
}

// ============================================
// DASHBOARD & ANALYTICS TYPES
// ============================================

export interface UserStats {
  totalOrders: number
  totalSpent: number
  totalSpentFormatted: string
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  refundedOrders: number
  currency: string
  averageOrderValue: number
  lastOrderDate?: string
}

export interface OrderAnalytics {
  thisMonthOrders: number
  thisMonthRevenue: number
  lastMonthOrders: number
  lastMonthRevenue: number
  averageOrderValue: number
  successRate: number
  recentActivity: Activity[]
  topCategories: CategorySales[]
}

export interface Activity {
  id: string
  type: 'order' | 'review' | 'payment' | 'profile_update'
  action: string
  timestamp: string
  details?: string
  data?: any
}

export interface CategorySales {
  _id?: string
  category?: string | Category
  name?: string
  count?: number
  revenue?: number
  orders?: number
  quantity?: number
  totalStock?: number
  averagePrice?: number
  averageValue?: number
  sales?: number
}

export interface AdminDashboardStats {
  overview: {
    totalUsers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    todayOrders: number
    todayRevenue: number
    yesterdayOrders: number
    yesterdayRevenue: number
    monthlyRevenue: number
    yearlyRevenue: number
    revenueChange: number
    orderChange: number
    lowStockProducts: number
    pendingOrders: number
  }
  topProducts: ProductSales[]
  recentOrders: Order[]
  userGrowth: DailyStats[]
  categoryStats: CategorySales[]
}

export interface ProductSales {
  _id?: string
  product?: Product
  name?: string
  quantity?: number
  revenue?: number
  growth?: number
  quantitySold?: number
  rating?: number
  numReviews?: number
  stock?: number
  price?: number
}

export interface DailyStats {
  _id: string
  date?: string
  count: number
  revenue?: number
  newUsers?: number
}

// ============================================
// ADMIN SPECIFIC TYPES
// ============================================

export interface AdminUsersResponse {
  users: User[]
  pagination: Pagination
}

export interface AdminProductsResponse {
  products: Product[]
  filters: {
    categories: string[]
    brands: string[]
  }
  pagination: Pagination
}

export interface AdminOrdersResponse {
  orders: Order[]
  stats: {
    totalRevenue: number
    totalOrders: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
  }
  pagination: Pagination
}

export interface SalesAnalyticsData {
  salesData: Array<{
    _id: string
    revenue: number
    orders: number
    averageOrderValue: number
  }>
  topProducts: ProductSales[]
  topCategories: CategorySales[]
  revenueByPayment: Array<{
    _id: string
    revenue: number
    orders: number
  }>
  period: string
  startDate: string
  endDate: string
}

export interface UserAnalyticsData {
  userGrowth: DailyStats[]
  userStats: {
    totalUsers: number
    activeUsers: number
    verifiedUsers: number
    adminUsers: number
  }
  usersWithOrders: number
  period: string
  startDate: string
  endDate: string
}

export interface ProductAnalyticsData {
  productStats: {
    totalProducts: number
    activeProducts: number
    featuredProducts: number
    outOfStock: number
    lowStock: number
    averagePrice: number
    totalStock: number
  }
  productsByCategory: CategorySales[]
  topRatedProducts: Product[]
  recentProducts: Product[]
}

// ============================================
// REFUND & RETURN TYPES
// ============================================

export interface RefundRequest {
  _id: string
  orderId: string
  userId: string | User
  order?: Order
  reason: string
  items: RefundItem[]
  notes?: string
  status: RefundStatus
  requestedAt: string
  processedAt?: string
  refundAmount: number
  refundMethod?: string
  refundTransactionId?: string
  adminNotes?: string
  reviewedBy?: string | User
  reviewedAt?: string
}

export interface RefundItem {
  productId: string
  product?: Product
  quantity: number
  name: string
  price: number
  reason?: string
}

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'

// ============================================
// INVOICE TYPES
// ============================================

export interface Invoice {
  id: string
  orderId: string
  userId: string
  invoiceNumber: string
  issueDate: string
  dueDate?: string
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount?: number
  totalAmount: number
  currency: string
  status: InvoiceStatus
  downloadUrl?: string
  items: InvoiceItem[]
  billingAddress: ShippingAddress
  shippingAddress: ShippingAddress
  paymentMethod: string
  paymentStatus: PaymentStatusType
  notes?: string
  terms?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  sku?: string
  productId?: string
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
export type PaymentStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'

// ============================================
// TRACKING TYPES
// ============================================

export interface TrackingInfo {
  trackingNumber: string
  carrier: string
  status: TrackingStatus
  estimatedDelivery: string
  actualDelivery?: string
  events: TrackingEvent[]
  orderId?: string
  userId?: string
  order?: Order
}

export interface TrackingEvent {
  date: string
  time: string
  location: string
  description: string
  status: TrackingStatus
  notes?: string
}

export type TrackingStatus = 
  | 'label_created'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned'

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  data?: any
  actionUrl?: string
  createdAt: string
}

export type NotificationType = 
  | 'order'
  | 'payment'
  | 'shipping'
  | 'promotion'
  | 'system'
  | 'review'
  | 'refund'

// ============================================
// WISHLIST TYPES
// ============================================

export interface WishlistItem {
  _id: string
  userId: string
  product: Product
  addedAt: string
  notes?: string
  notificationEnabled?: boolean
  priceAlert?: number
}

// ============================================
// COUPON & DISCOUNT TYPES
// ============================================

export interface Coupon {
  _id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  validFrom: string
  validUntil: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  applicableCategories?: string[]
  applicableProducts?: string[]
  excludedProducts?: string[]
  userLimit?: number
  singleUse: boolean
  createdAt: string
  updatedAt: string
}

export interface CouponApplied {
  code: string
  discount: number
  discountType: 'percentage' | 'fixed'
  couponId?: string
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface ProductFilter {
  category?: string
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  brand?: string[]
  rating?: number
  inStock?: boolean
  isFeatured?: boolean
  isActive?: boolean
  tags?: string[]
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating' | 'name_asc' | 'name_desc'
  page?: number
  limit?: number
  search?: string
  excludeIds?: string[]
  includeIds?: string[]
}

export interface SearchParams {
  query: string
  filters?: ProductFilter
  page?: number
  limit?: number
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  pagination?: Pagination
  timestamp?: string
  requestId?: string
}

export interface Pagination {
  total: number
  page: number
  pages: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
  nextPage?: number
  prevPage?: number
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword?: string
  phone?: string
  acceptTerms?: boolean
}

export interface CheckoutFormData {
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  paymentMethod: PaymentMethodType
  notes?: string
  saveAddress?: boolean
  useSameAddress?: boolean
}

export interface ProfileFormData {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export interface AddressFormData extends Omit<ShippingAddress, '_id' | 'isDefault'> {
  label?: 'home' | 'work' | 'other'
  makeDefault?: boolean
}

export interface ReviewFormData {
  rating: number
  title: string
  comment: string
  images?: File[]
  verifiedPurchase?: boolean
}

// ============================================
// FILE UPLOAD TYPES
// ============================================

export interface UploadedFile {
  url: string
  publicId: string
  originalname: string
  mimetype: string
  size: number
  width?: number
  height?: number
  format?: string
}

export interface UploadResponse {
  files: UploadedFile[]
  message: string
}

// ============================================
// SETTINGS & CONFIG TYPES
// ============================================

export interface AppSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportPhone: string
  address: string
  currency: string
  taxRate: number
  freeShippingThreshold: number
  maintenanceMode: boolean
  enableRegistration: boolean
  enableReviews: boolean
  enableWishlist: boolean
  enableCoupons: boolean
  socialMedia: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
  }
  paymentMethods: PaymentMethod[]
  shippingMethods: ShippingMethodConfig[]
}

export interface ShippingMethodConfig {
  id: string
  name: string
  description: string
  cost: number
  freeThreshold?: number
  estimatedDays: string
  isActive: boolean
  availableCities?: string[]
}

// ============================================
// ERROR TYPES
// ============================================

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
  timestamp: string
  path: string
}

// ============================================
// ADMIN SERVICE TYPES
// ============================================

export interface BulkUpdateProductsData {
  productIds: string[]
  updateData: {
    price?: number
    discountPrice?: number
    stock?: number
    isFeatured?: boolean
    isActive?: boolean
    category?: string
    brand?: string
  }
}

export interface BulkDeleteProductsData {
  productIds: string[]
}
export interface ImageData {
  url?: string;
  public_id?: string;
  path?: string;
  src?: string;
  secure_url?: string;
}

export interface ImportProductsData {
  products: Array<{
    name: string
    category: string
    brand: string
    price: number
    discountPrice?: number
    description?: string
    shortDescription?: string
    images?: string[]
    stock?: number
    sku: string
    isFeatured?: boolean | string
    isActive?: boolean | string
    tags?: string
  }>
}

// ============================================
// EXPORT ALL TYPES
// ============================================

export type {
  User,
  ShippingAddress,
  UserProfile,
  Product,
  Specification,
  Dimensions,
  ProductVariant,
  ProductWithAnalytics,
  CartItem,
  Cart,
  OrderItem,
  Order,
  OrderStatus,
  ShippingMethod,
  PaymentMethodType,
  PaymentRequest,
  PaymentResult,
  PakistanOrderData,
  Category,
  CategoryWithProducts,
  Review,
  ReviewResponse,
  PaymentMethod,
  PaymentProof,
  PakistanCity,
  UserStats,
  OrderAnalytics,
  Activity,
  CategorySales,
  AdminDashboardStats,
  ProductSales,
  DailyStats,
  RefundRequest,
  RefundItem,
  RefundStatus,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  PaymentStatusType,
  TrackingInfo,
  TrackingEvent,
  TrackingStatus,
  Notification,
  NotificationType,
  WishlistItem,
  Coupon,
  CouponApplied,
  ProductFilter,
  SearchParams,
  ApiResponse,
  Pagination,
  LoginFormData,
  RegisterFormData,
  CheckoutFormData,
  ProfileFormData,
  AddressFormData,
  ReviewFormData,
  UploadedFile,
  UploadResponse,
  AppSettings,
  ShippingMethodConfig,
  ApiError,
  AdminUsersResponse,
  AdminProductsResponse,
  AdminOrdersResponse,
  SalesAnalyticsData,
  UserAnalyticsData,
  ProductAnalyticsData,
  BulkUpdateProductsData,
  BulkDeleteProductsData,
  ImportProductsData
}