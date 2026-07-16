import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Filter,
  RefreshCw,
  Upload,
  AlertTriangle,
  Star,
  BarChart3,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  Download,
  Loader2,
  X,
} from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import {
  adminService,
  type Product,
  type BulkProductAction,
  type PriceAdjustmentOperation,
  type ProductPriceAdjustment,
} from "../../services/adminServiceMethods";
import { productService } from "../../services/productService";
import toast from "react-hot-toast";

// Define Category type
interface Category {
  _id: string;
  name: string;
  slug: string;
}

const getRequestError = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as { response?: { data?: { error?: string; message?: string } } }
    ).response;
    return response?.data?.message || response?.data?.error || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const getRequestData = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("response" in error))
    return undefined;
  return (
    error as {
      response?: {
        data?: { error?: string; message?: string; hasOrders?: boolean };
      };
    }
  ).response?.data;
};

const toRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

const AdminProducts: React.FC = () => {
  console.log("✅ AdminProducts component rendered");
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]); // Changed to Category[]
  const [brands, setBrands] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkActionInProgress, setBulkActionInProgress] = useState<
    BulkProductAction | "export" | null
  >(null);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [priceAdjustment, setPriceAdjustment] =
    useState<ProductPriceAdjustment>({
      operation: "increasePercent",
      value: 10,
    });
  const [viewMode, setViewMode] = useState<"list" | "grid">(() =>
    localStorage.getItem("admin-products-view") === "grid" ? "grid" : "list",
  );

  const changeViewMode = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("admin-products-view", mode);
  };

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridSelectAllRef = useRef<HTMLInputElement>(null);
  const visibleProductIds = useMemo(
    () => products.map((product) => product._id),
    [products],
  );
  const visibleProductIdSet = useMemo(
    () => new Set(visibleProductIds),
    [visibleProductIds],
  );
  const validSelectedIds = useMemo(
    () => selectedProducts.filter((id) => visibleProductIdSet.has(id)),
    [selectedProducts, visibleProductIdSet],
  );
  const allVisibleSelected =
    visibleProductIds.length > 0 &&
    validSelectedIds.length === visibleProductIds.length;
  const someVisibleSelected =
    validSelectedIds.length > 0 && !allVisibleSelected;
  const bulkDisabled =
    loading || bulkActionInProgress !== null || validSelectedIds.length === 0;

  useEffect(() => {
    setSelectedProducts((current) =>
      current.filter((id) => visibleProductIdSet.has(id)),
    );
  }, [visibleProductIdSet]);

  useEffect(() => {
    if (gridSelectAllRef.current) {
      gridSelectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const fetchProducts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params: {
          page: number;
          limit: number;
          search?: string;
          status?: string;
          category?: string;
          brand?: string;
        } = {
          page,
          limit: pagination.limit,
        };

        if (searchTerm) params.search = searchTerm;
        if (statusFilter !== "all") params.status = statusFilter;
        if (categoryFilter !== "all") params.category = categoryFilter;
        if (brandFilter !== "all") params.brand = brandFilter;

        console.log("📡 Fetching products with params:", params);
        const response = await adminService.getAdminProducts(params);
        console.log("✅ API Response received:", response.data);

        // Debug: Check what categories look like
        console.log(
          "🔍 Categories data from API:",
          response.data.filters?.categories,
        );
        console.log("🔍 Brands data from API:", response.data.filters?.brands);

        // FIXED: Handle categories properly (they might be objects or strings)
        const apiCategories = (response.data.filters?.categories ||
          []) as unknown[];
        const processedCategories: Category[] = apiCategories
          .map((cat) => {
            if (typeof cat === "string") {
              // If category is a string, create a Category object
              const slug = cat.toLowerCase().replace(/\s+/g, "-");
              return { _id: slug, name: cat, slug };
            }
            // If category is an object, extract the properties
            const record = toRecord(cat);
            const name =
              typeof record?.name === "string" ? record.name : "Uncategorized";
            const slug =
              typeof record?.slug === "string"
                ? record.slug
                : name.toLowerCase().replace(/\s+/g, "-");
            const id =
              typeof record?._id === "string"
                ? record._id
                : typeof record?.id === "string"
                  ? record.id
                  : slug;
            return { _id: id, name, slug };
          })
          .filter((category) => category.name !== "Uncategorized");

        // FIXED: Handle brands properly
        const apiBrands = (response.data.filters?.brands || []) as unknown[];
        const processedBrands = apiBrands
          .map((brand) => {
            if (typeof brand === "string") return brand;
            const record = toRecord(brand);
            return typeof record?.name === "string" ? record.name : "";
          })
          .filter(Boolean);

        setProducts(response.data.products || []);
        setCategories(processedCategories); // Now storing Category objects
        setBrands(processedBrands);
        setPagination({
          page: response.data.pagination?.page || 1,
          pages: response.data.pagination?.pages || 1,
          total: response.data.pagination?.total || 0,
          limit: response.data.pagination?.limit || 10,
          hasNext: response.data.pagination?.hasNext || false,
          hasPrev: response.data.pagination?.hasPrev || false,
        });
      } catch (error: unknown) {
        console.error("❌ Error fetching products:", error);
        toast.error(getRequestError(error, "Failed to fetch products"));
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, statusFilter, categoryFilter, brandFilter, pagination.limit],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(1);
    }, 500);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleUpdateProduct = async (
    productId: string,
    updates: Partial<Product>,
  ) => {
    try {
      await adminService.updateProduct(productId, updates);
      toast.success("Product updated successfully");
      fetchProducts(pagination.page);
    } catch (error: unknown) {
      console.error("Error updating product:", error);
      toast.error(getRequestError(error, "Failed to update product"));
    }
  };

  const handleDeleteProduct = async (productId: string, permanent = false) => {
    const message = permanent
      ? "⚠️ WARNING: This will PERMANENTLY delete the product and all associated data. This action cannot be undone!\n\nAre you absolutely sure?"
      : "Are you sure you want to delete this product? It will be deactivated (soft delete).";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setLoading(true);

      console.log(`🗑️ Deleting product ${productId}, permanent: ${permanent}`);

      if (permanent) {
        // Use deleteProduct with force=true
        const response = await adminService.deleteProduct(productId, true);

        if (response.success) {
          toast.success(response.message || "Product permanently deleted");

          // Remove from local state immediately
          setProducts((prev) => prev.filter((p) => p._id !== productId));
          setSelectedProducts((prev) => prev.filter((id) => id !== productId));

          // Update pagination
          setPagination((prev) => ({
            ...prev,
            total: prev.total - 1,
          }));
        } else {
          toast.error(response.message || "Failed to delete product");
        }
      } else {
        // Regular delete (soft delete)
        const response = await adminService.deleteProduct(productId);

        if (response.success) {
          toast.success(response.message || "Product deleted (deactivated)");

          // Update product status in local state
          setProducts((prev) =>
            prev.map((p) =>
              p._id === productId ? { ...p, isActive: false } : p,
            ),
          );
        } else {
          toast.error(response.message || "Failed to delete product");
        }
      }
    } catch (error: unknown) {
      console.error("❌ Error deleting product:", error);

      // Check if it's an order-related error
      if (getRequestData(error)?.hasOrders) {
        toast.error(
          <div>
            <strong>Product has associated orders!</strong>
            <br />
            <button
              onClick={() => handleDeleteProduct(productId, true)}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Force Delete Anyway
            </button>
          </div>,
          {
            autoClose: false,
            closeButton: false,
          },
        );
      } else {
        toast.error(getRequestError(error, "Failed to delete product"));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-100" };
    if (stock < 10)
      return {
        text: "Low Stock",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { text: "In Stock", color: "text-green-600", bg: "bg-green-100" };
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(visibleProductIds);
    }
  };

  const handleBulkAction = async (
    action: BulkProductAction,
    adjustment?: ProductPriceAdjustment,
  ) => {
    const productIds = validSelectedIds;
    if (productIds.length === 0) {
      toast("Please select at least one product.", { icon: "⚠️" });
      return;
    }

    const confirmMessages = {
      activate: `Activate ${productIds.length} selected product(s)?`,
      deactivate: `Deactivate ${productIds.length} selected product(s)?`,
      feature: `Feature ${productIds.length} selected product(s)?`,
      delete: `Delete ${productIds.length} selected product(s)? This safely deactivates them and preserves existing order history.`,
      updatePrices: `Apply this price update to ${productIds.length} selected product(s)?`,
    };

    if (!window.confirm(confirmMessages[action])) return;

    try {
      setBulkActionInProgress(action);
      const response = await adminService.bulkProductAction({
        productIds,
        action,
        priceAdjustment: adjustment,
      });
      toast.success(
        response.message || `${productIds.length} product(s) updated.`,
      );
      setSelectedProducts([]);
      setShowPriceDialog(false);
      await fetchProducts(pagination.page);
    } catch (error: unknown) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(
        getRequestError(error, `Failed to ${action} selected products.`),
      );
    } finally {
      setBulkActionInProgress(null);
    }
  };

  const openPriceDialog = () => {
    if (validSelectedIds.length === 0) {
      toast("Please select at least one product.", { icon: "⚠️" });
      return;
    }
    setShowPriceDialog(true);
  };

  const submitPriceUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(priceAdjustment.value) || priceAdjustment.value <= 0) {
      toast.error("Enter a price value greater than zero.");
      return;
    }
    if (
      priceAdjustment.operation === "decreasePercent" &&
      priceAdjustment.value >= 100
    ) {
      toast.error("Percentage decrease must be less than 100.");
      return;
    }
    void handleBulkAction("updatePrices", priceAdjustment);
  };

  const exportSelectedProducts = () => {
    const selectedRows = products.filter((product) =>
      validSelectedIds.includes(product._id),
    );
    if (selectedRows.length === 0) {
      toast("Please select at least one product.", { icon: "⚠️" });
      return;
    }

    setBulkActionInProgress("export");
    try {
      const escapeCsv = (value: unknown) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;
      const headers = [
        "ID",
        "Name",
        "SKU",
        "Category",
        "Brand",
        "Price",
        "Discount Price",
        "Stock",
        "Status",
        "Featured",
        "Slug",
      ];
      const rows = selectedRows.map((product) => [
        product._id,
        product.name,
        product.sku,
        typeof product.category === "string" ? product.category : "",
        product.brand,
        product.price,
        product.discountPrice ?? "",
        product.stock,
        product.isActive ? "Active" : "Inactive",
        product.isFeatured ? "Yes" : "No",
        product.slug,
      ]);
      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\r\n");
      const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `blackcart-products-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${selectedRows.length} selected product(s).`);
    } catch (error: unknown) {
      toast.error(
        getRequestError(error, "Could not export selected products."),
      );
    } finally {
      setBulkActionInProgress(null);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ✅ FIXED: getImageUrl function
  const getImageUrl = (imageData: unknown): string => {
    if (!imageData) return "";

    // If it's already a full URL
    if (typeof imageData === "string") {
      if (imageData.startsWith("http")) return imageData;
      if (imageData.startsWith("/uploads") || imageData.startsWith("/images")) {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${baseUrl}${imageData}`;
      }
      return `https://blackcart-backend.onrender.com/uploads/${imageData}`;
    }

    // If it's an object
    if (typeof imageData === "object") {
      const image = toRecord(imageData);
      if (!image) return "";
      // Try different common field names
      if (image.url) return getImageUrl(image.url);
      if (image.public_id) return getImageUrl(image.public_id);
      if (image.path) return getImageUrl(image.path);
      if (image.src) return getImageUrl(image.src);
      if (image.secure_url) return getImageUrl(image.secure_url);
    }

    return "";
  };

  // ✅ FIXED: Helper function to get category name from product
  const getCategoryName = (row: Product): string => {
    // Use productService.getCategoryInfo for consistent category handling
    const categoryInfo = productService.getCategoryInfo(row);
    return categoryInfo.name;
  };

  const columns = [
    {
      key: "_id",
      header: "Product",
      render: (_value: never, row: Product) => {
        // ✅ FIXED: Get category name properly using productService
        const categoryName = getCategoryName(row);

        // Get images
        const productImages = row.images?.length
          ? row.images
          : row.image
            ? [row.image]
            : [];

        // Get the first image
        let imageUrl = "";
        if (Array.isArray(productImages) && productImages.length > 0) {
          const firstImage = productImages[0];
          imageUrl = getImageUrl(firstImage);
        }

        console.log(`📦 Product "${row.name}" - Category: ${categoryName}`);

        return (
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden mr-4 flex-shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={row.name || "Product image"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error(
                      `❌ ${row.name} - Image failed to load:`,
                      imageUrl,
                    );
                    target.onerror = null;
                    target.src = "/images/placeholder-small.png";
                    target.className = "h-full w-full object-contain p-1";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {row.name}
              </div>
              <div className="text-sm text-gray-500">{row.sku}</div>
              <div className="flex items-center mt-1">
                {row.isFeatured && (
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                )}
                <span className="text-xs text-gray-500">{categoryName}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "price",
      header: "Price",
      render: (value: number, row: Product) => (
        <div className="space-y-1">
          {row.discountPrice &&
          row.discountPrice > 0 &&
          row.discountPrice < value ? (
            <>
              <div className="text-sm text-gray-500 line-through">
                {formatCurrency(value)}
              </div>
              <div className="font-bold text-red-600 text-lg">
                {formatCurrency(row.discountPrice)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                  -{Math.round((1 - row.discountPrice / value) * 100)}%
                </span>
              </div>
            </>
          ) : (
            <div className="font-medium text-gray-900 text-lg">
              {formatCurrency(value)}
            </div>
          )}
          {row.stockStatus && (
            <div
              className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                row.stockStatus === "in-stock"
                  ? "bg-green-100 text-green-800"
                  : row.stockStatus === "low-stock"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {row.stockStatus === "in-stock"
                ? "✓ In Stock"
                : row.stockStatus === "low-stock"
                  ? "⚠ Low Stock"
                  : "✗ Out of Stock"}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "stock",
      header: "Stock",
      render: (value: number) => {
        const status = getStockStatus(value);
        return (
          <div className="flex items-center">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.color}`}
            >
              {status.text}
            </span>
            <span className="ml-2 text-sm text-gray-600">{value} units</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (_value: never, row: Product) => (
        <div className="space-y-1">
          <div className="flex items-center">
            {row.isActive ? (
              <Eye className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <EyeOff className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                row.isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              {row.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Updated:{" "}
            {row.updatedAt
              ? new Date(row.updatedAt).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Quick Actions",
      render: (_value: never, row: Product) => (
        <div className="space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateProduct(row._id, { isActive: !row.isActive });
            }}
            className={`w-full px-3 py-1.5 text-xs rounded-lg transition flex items-center justify-center ${
              row.isActive
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            {row.isActive ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateProduct(row._id, { isFeatured: !row.isFeatured });
            }}
            className={`w-full px-3 py-1.5 text-xs rounded-lg transition flex items-center justify-center ${
              row.isFeatured
                ? "bg-gray-50 text-gray-700 hover:bg-gray-100"
                : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            }`}
          >
            {row.isFeatured ? (
              <>
                <Star className="h-3 w-3 mr-1" />
                Unfeature
              </>
            ) : (
              <>
                <Star className="h-3 w-3 mr-1" />
                Feature
              </>
            )}
          </button>
        </div>
      ),
    },
  ];

  const renderActions = (row: Product) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/admin/products/edit/${row._id}`);
        }}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="Edit Product"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/products/${row.slug || row._id}`);
        }}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
        title="View Product"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProduct(row._id, false);
        }}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Delete Product"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const renderSelectionColumn = (row: Product) => (
    <input
      type="checkbox"
      checked={validSelectedIds.includes(row._id)}
      aria-label={`Select ${row.name}`}
      onChange={(e) => {
        e.stopPropagation();
        handleSelectProduct(row._id);
      }}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Product Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your product catalog and inventory
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/admin/products/import")}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button
                onClick={() => navigate("/admin/products/new")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          {/* Filters - FIXED CATEGORY DROPDOWN */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or brand..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchTerm}
                />
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              {/* ✅ FIXED: Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category.slug || category.name}
                  >
                    {category.name} {/* Renders the name, not the object */}
                  </option>
                ))}
              </select>

              {/* ✅ Fixed: Brand Dropdown */}
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchProducts()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <div
                className="flex rounded-lg border border-gray-300 bg-white p-1"
                aria-label="Product view"
              >
                <button
                  type="button"
                  onClick={() => changeViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => changeViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pagination.total}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              <span>Last 30 days: +12%</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Active Products
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {products.filter((p) => p.isActive).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {pagination.total > 0
                ? Math.round(
                    (products.filter((p) => p.isActive).length /
                      pagination.total) *
                      100,
                  )
                : 0}
              % of total
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {products.filter((p) => p.stock < 10 && p.stock > 0).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-3 text-xs text-yellow-600">Needs attention</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {products.filter((p) => p.stock === 0).length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-3 text-xs text-red-600">Requires restocking</div>
          </div>
        </div>

        {/* Selected Products Actions */}
        {validSelectedIds.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium text-blue-800">
                  {validSelectedIds.length} visible product(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  disabled={bulkDisabled}
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Activate
                </button>
                <button
                  disabled={bulkDisabled}
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Deactivate
                </button>
                <button
                  disabled={bulkDisabled}
                  onClick={() => handleBulkAction("feature")}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Feature
                </button>
                <button
                  disabled={bulkDisabled}
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {viewMode === "list" ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <DataTable
              columns={columns}
              data={products}
              loading={loading}
              searchable={false}
              pagination={{
                ...pagination,
                onPageChange: handlePageChange,
              }}
              selection={{
                enable: true,
                render: renderSelectionColumn,
                onSelectAll: handleSelectAll,
                selectedCount: validSelectedIds.length,
                totalCount: products.length,
                allSelected: allVisibleSelected,
                someSelected: someVisibleSelected,
              }}
              actions={renderActions}
              onRowClick={(row) => navigate(`/admin/products/edit/${row._id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? "Try adjusting your search filters"
                      : "Get started by creating your first product"}
                  </p>
                  <button
                    onClick={() => navigate("/admin/products/new")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Add Product
                  </button>
                </div>
              }
            />
          </div>
        ) : (
          <div>
            <label className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              <input
                ref={gridSelectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAll}
                disabled={loading || products.length === 0}
                aria-label={
                  allVisibleSelected
                    ? "Deselect all visible products"
                    : "Select all visible products"
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {allVisibleSelected
                ? "Deselect all visible products"
                : "Select all visible products"}
            </label>
            {loading ? (
              <div className="rounded-xl border bg-white py-16 text-center text-gray-500">
                Loading products…
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border bg-white py-16 text-center text-gray-500">
                No products found
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const imageUrl = productService.getFirstImageUrl(product);
                  return (
                    <article
                      key={product._id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/products/edit/${product._id}`)
                        }
                        className="block w-full text-left"
                      >
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="aspect-[4/3] w-full bg-gray-100 object-cover"
                          loading="lazy"
                        />
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="line-clamp-2 font-semibold text-gray-900">
                              {product.name}
                            </h2>
                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="mt-2 text-lg font-bold text-gray-900">
                            PKR{" "}
                            {(
                              product.discountPrice || product.price
                            ).toLocaleString()}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                            <span>SKU {product.sku}</span>
                            <span>Stock {product.stock}</span>
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center justify-between border-t px-3 py-2">
                        {renderSelectionColumn(product)}
                        {renderActions(product)}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {pagination.pages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bulk Actions */}
        {/* <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bulk Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              disabled={bulkDisabled}
              onClick={() => handleBulkAction("activate")}
              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Activate Selected
            </button>
            <button
              disabled={bulkDisabled}
              onClick={() => handleBulkAction("deactivate")}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Deactivate Selected
            </button>
            <button
              disabled={bulkDisabled}
              onClick={() => handleBulkAction("feature")}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition flex items-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star className="h-4 w-4 mr-2" />
              Feature Selected
            </button>
            <button
              disabled={bulkDisabled}
              onClick={() => handleBulkAction("delete")}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </button>
            <button
              disabled={bulkDisabled}
              onClick={openPriceDialog}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Update Prices
            </button>
            <button
              disabled={bulkDisabled}
              onClick={exportSelectedProducts}
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition flex items-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected CSV
            </button>
            {bulkActionInProgress && (
              <span
                role="status"
                className="inline-flex items-center gap-2 px-2 text-sm text-gray-600"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Working&hellip;
              </span>
            )}
          </div>
        </div> */}
      </div>

      {showPriceDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-price-title"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              bulkActionInProgress === null
            )
              setShowPriceDialog(false);
          }}
        >
          <form
            onSubmit={submitPriceUpdate}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="bulk-price-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  Update selected prices
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  This will update {validSelectedIds.length} visible product(s).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceDialog(false)}
                disabled={bulkActionInProgress !== null}
                aria-label="Close price update dialog"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label
              className="mt-6 block text-sm font-medium text-gray-700"
              htmlFor="price-operation"
            >
              Price operation
            </label>
            <select
              id="price-operation"
              value={priceAdjustment.operation}
              onChange={(event) =>
                setPriceAdjustment((current) => ({
                  ...current,
                  operation: event.target.value as PriceAdjustmentOperation,
                }))
              }
              disabled={bulkActionInProgress !== null}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="set">Set exact price (PKR)</option>
              <option value="increasePercent">Increase by percentage</option>
              <option value="decreasePercent">Decrease by percentage</option>
              <option value="increaseFixed">
                Increase by fixed amount (PKR)
              </option>
              <option value="decreaseFixed">
                Decrease by fixed amount (PKR)
              </option>
            </select>

            <label
              className="mt-4 block text-sm font-medium text-gray-700"
              htmlFor="price-value"
            >
              {priceAdjustment.operation.includes("Percent")
                ? "Percentage"
                : "Amount"}
            </label>
            <input
              id="price-value"
              type="number"
              min="0.01"
              max={
                priceAdjustment.operation === "decreasePercent"
                  ? "99.99"
                  : undefined
              }
              step="0.01"
              required
              value={priceAdjustment.value}
              onChange={(event) =>
                setPriceAdjustment((current) => ({
                  ...current,
                  value: Number(event.target.value),
                }))
              }
              disabled={bulkActionInProgress !== null}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPriceDialog(false)}
                disabled={bulkActionInProgress !== null}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  bulkActionInProgress !== null || validSelectedIds.length === 0
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkActionInProgress === "updatePrices" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Update {validSelectedIds.length} product(s)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
