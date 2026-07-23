// src/pages/cart/CartPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  Shield,
  Truck,
  AlertCircle,
  Zap,
  Grid2X2,
  List,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { CartItem, Product } from "../../types";
import { productService } from "../../services/productService";
import toast from "react-hot-toast";
import Loader from "../../components/common/Loader";

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, loading } =
    useCart();
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [productDetails, setProductDetails] = useState<Record<string, Product>>(
    {},
  );
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [, setFailedProductIds] = useState<string[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">(
    "standard",
  );
  const fetchProductDetails = async () => {
    if (cartItems.length === 0) {
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);

    // Extract product IDs
    const productIds = cartItems
      .map((item) => {
        if (typeof item.product === "string") return item.product;
        return item.product?._id || "";
      })
      .filter((id) => id && id.trim() !== "");

    try {
      const locallyAvailable: Record<string, Product> = {};

      cartItems.forEach((item) => {
        if (
          typeof item.product === "object" &&
          item.product !== null &&
          "_id" in item.product
        ) {
          const product = item.product as Product;
          locallyAvailable[product._id] = product;
        }
      });

      if (Object.keys(locallyAvailable).length > 0) {
        setProductDetails((prev) => ({ ...prev, ...locallyAvailable }));
      }

      // Check if all products are already available locally
      const locallyAvailableIds = Object.keys(locallyAvailable);
      const remainingIds = productIds.filter(
        (id) => !locallyAvailableIds.includes(id),
      );

      if (remainingIds.length === 0) {
        setLoadingProducts(false);
        return;
      }
      const response = await productService.getProducts({ limit: 100 });

      if (response.success && response.data?.products) {
        const allProducts = response.data.products;
        const newProductDetails: Record<string, Product> = {
          ...locallyAvailable,
        };

        // Find our products in the response
        allProducts.forEach((product: Product) => {
          if (product._id && productIds.includes(product._id)) {
            newProductDetails[product._id] = product;
          }
        });

        setProductDetails((prev) => ({ ...prev, ...newProductDetails }));

        // Check what we found vs what we're looking for
        const foundIds = Object.keys(newProductDetails);
        const missingIds = productIds.filter((id) => !foundIds.includes(id));

        if (missingIds.length > 0) {

          // Try individual fetches for missing products
          const successfullyFetched: string[] = [];

          for (const missingId of missingIds) {
            try {
              const singleResponse = await productService.getProduct(missingId);

              if (singleResponse.success && singleResponse.data?.product) {
                newProductDetails[missingId] = singleResponse.data.product;
                successfullyFetched.push(missingId);
              } else {
                console.warn(`Ã¢ÂÅ’ Product not found: ${missingId}`);
                setFailedProductIds((prev) => [...prev, missingId]);
              }
            } catch (singleError) {
              console.error(
                `Ã¢ÂÅ’ Error fetching product ${missingId}:`,
                singleError,
              );
              setFailedProductIds((prev) => [...prev, missingId]);
            }
          }

          // Update with any newly found products
          if (successfullyFetched.length > 0) {
            setProductDetails((prev) => ({ ...prev, ...newProductDetails }));
          }

          // Show warning for failed products
          if (missingIds.length > successfullyFetched.length) {
            toast.error(
              `Could not load ${missingIds.length - successfullyFetched.length} product(s). They may have been removed.`,
              { duration: 5000 },
            );
          }
        }
      } else {
        console.error("Ã¢ÂÅ’ Failed to fetch products:", response.message);
        toast.error("Unable to load product details. Please try again.");
      }
    } catch (error) {
      console.error("Ã¢ÂÅ’ Error fetching product details:", error);
      toast.error("Failed to load product information");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch product details when cart items change
  useEffect(() => {
    fetchProductDetails();
    // Product fetching is intentionally keyed to the cart contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);
  const getProductObject = (item: CartItem): Product | null => {
    // If product is already a full object
    if (
      typeof item.product === "object" &&
      item.product !== null &&
      "_id" in item.product
    ) {
      return item.product as Product;
    }

    // If product is an ID string, look it up
    if (typeof item.product === "string") {
      return productDetails[item.product] || null;
    }

    return null;
  };
  const validCartItems = cartItems
    .map((item) => {
      const product = getProductObject(item);
      return {
        ...item,
        product,
        hasProductDetails: !!product,
      };
    })
    .filter((item) => item.hasProductDetails);
  const getProductImageUrl = (product: Product | null): string => {
    if (!product) return "/images/placeholder.png";

    try {
      // Use productService.getFirstImageUrl if available
      if (productService.getFirstImageUrl) {
        const url = productService.getFirstImageUrl(product);
        if (url && url !== "/images/placeholder.png") {
          return url;
        }
      }

      // Try to get image from product
      if (
        product.images &&
        Array.isArray(product.images) &&
        product.images.length > 0
      ) {
        const firstImage = product.images[0];
        if (typeof firstImage === "string") {
          return (
            productService.getImageUrl?.(firstImage) ||
            "/images/placeholder.png"
          );
        } else if (
          firstImage &&
          typeof firstImage === "object" &&
          "url" in firstImage
        ) {
          return firstImage.url || "/images/placeholder.png";
        }
      }

      // Try product.image as fallback
      if (product.image) {
        if (typeof product.image === "string") {
          return (
            productService.getImageUrl?.(product.image) ||
            "/images/placeholder.png"
          );
        }
      }

      return "/images/placeholder.png";
    } catch (error) {
      console.error("Error getting product image:", error);
      return "/images/placeholder.png";
    }
  };

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number,
    product: Product | null,
    variantId = "",
  ) => {
    if (!product) {
      toast.error("Product information is missing");
      return;
    }

    if (newQuantity < 1) {
      await handleRemoveItem(productId, product.name, variantId);
      return;
    }

    try {
      await updateQuantity(productId, newQuantity, product, variantId);
    } catch {
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveItem = async (
    productId: string,
    productName?: string,
    variantId = "",
  ) => {
    const name = productName || "Product";
    if (window.confirm(`Remove ${name} from cart?`)) {
      try {
        // Remove from product details cache
        setProductDetails((prev) => {
          const newDetails = { ...prev };
          delete newDetails[productId];
          return newDetails;
        });

        await removeFromCart(productId, variantId);
        toast.success("Item removed from cart");
      } catch {
        toast.error("Failed to remove item. Please try again.");
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setIsClearing(true);
      try {
        // Clear product details cache
        setProductDetails({});
        setFailedProductIds([]);
        await clearCart();
        toast.success("Cart cleared successfully");
      } catch {
        toast.error("Failed to clear cart. Please try again.");
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (validCartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Check if any items are out of stock
    const outOfStockItems = validCartItems.filter((item) => {
      const product = item.product as Product;
      return product?.stock === 0;
    });

    if (outOfStockItems.length > 0) {
      toast.error("Some items in your cart are out of stock");
      return;
    }
    navigate("/checkout", { state: { deliveryMethod } });
  };
  const calculateSubtotal = () => {
    return validCartItems.reduce((total, item) => {
      const product = item.product as Product;
      if (!product) return total;
      const price = product.discountPrice || product.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const calculateSavings = () => {
    return validCartItems.reduce((total, item) => {
      const product = item.product as Product;
      if (!product || !product.discountPrice || !product.price) return total;
      const discount = (product.price - product.discountPrice) * item.quantity;
      return total + discount;
    }, 0);
  };
  const subtotal = calculateSubtotal();
  let shippingCost = 0;

  if (deliveryMethod === "standard") {
    shippingCost = subtotal >= 5000 ? 0 : 200;
  } else {
    // express
    shippingCost = 350;
  }

  // TAX REMOVED - Now total = subtotal + shipping only
  const total = subtotal + shippingCost;

  const totalItems = validCartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // Show items that failed to load
  const itemsWithMissingDetails = cartItems.length - validCartItems.length;

  // Show loading state
  if (loadingProducts && validCartItems.length === 0 && cartItems.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-5 sm:py-8">
        <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-5 lg:px-8">
          <div className="text-center py-12">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">Loading product details...</p>
            <p className="text-sm text-gray-500 mt-2">
              Fetching {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-5 sm:py-8">
        <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-5 lg:px-8">
          <div className="text-center py-12">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-8">
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-5 lg:px-8">
        {/* Page Header */}
        <div className="mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mb-1">
                Shopping Cart
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Review your items and proceed to checkout
              </p>
            </div>
            <Link
              to="/products"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Show warning for items with missing details */}
        {itemsWithMissingDetails > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-yellow-800 font-medium">
                  {itemsWithMissingDetails} item
                  {itemsWithMissingDetails > 1 ? "s" : ""} could not be loaded
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Some products may have been removed or are unavailable. They
                  have been hidden from your cart.
                </p>
              </div>
            </div>
          </div>
        )}

        {validCartItems.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 sm:p-12 rounded-xl shadow text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              <ShoppingCart className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start
              shopping to discover amazing products!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg inline-flex items-center justify-center transition-colors"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Start Shopping
              </Link>
              <Link
                to="/categories"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg inline-flex items-center justify-center transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)] lg:gap-6">
            {/* Cart Items */}
            <div className="min-w-0">
              {/* Cart Header */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">
                      {totalItems} {totalItems === 1 ? " item" : " items"} in
                      cart
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5" aria-label="Cart item view">
                      <button type="button" onClick={() => setViewMode("list")} aria-label="List view" aria-pressed={viewMode === "list"} className={`rounded-md p-1.5 transition ${viewMode === "list" ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}><List className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setViewMode("grid")} aria-label="Grid view" aria-pressed={viewMode === "grid"} className={`rounded-md p-1.5 transition ${viewMode === "grid" ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}><Grid2X2 className="h-4 w-4" /></button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Total:{" "}
                      <span className="font-bold text-lg">
                        PKR {subtotal.toLocaleString()}
                      </span>
                    </span>
                    <button
                      onClick={handleClearCart}
                      disabled={isClearing || validCartItems.length === 0}
                      className="flex items-center text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {isClearing ? "Clearing..." : "Clear Cart"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className={viewMode === "grid" ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 2xl:grid-cols-4" : "space-y-3"}>
                {validCartItems.map((item, index) => {
                  const product = item.product as Product;
                  if (!product) return null;

                  const discount = product.discountPrice
                    ? product.price - product.discountPrice
                    : 0;

                  const variant =
                    typeof item.variant === "object" ? item.variant : null;
                  const variantId =
                    typeof item.variant === "string"
                      ? item.variant
                      : String(item.variant?._id || "");
                  const variantImage = variant?.images?.[0];
                  const imageUrl = variantImage
                    ? typeof variantImage === "string"
                      ? variantImage
                      : variantImage.url
                    : getProductImageUrl(product);
                  const availableStock =
                    variant && Number.isFinite(variant.stock)
                      ? Number(variant.stock)
                      : product.stock;
                  const productIdentifier = product.slug || product._id;

                  return (
                    <motion.div
                      key={`${product._id}-${variantId}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={viewMode === "grid" ? "rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md" : "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"}
                    >
                      <div className={viewMode === "grid" ? "flex flex-col" : "flex flex-col sm:flex-row"}>
                        {/* Product Image */}
                        <Link
                          to={`/products/${productIdentifier}`}
                          className={viewMode === "grid" ? "mb-2 h-36 w-full flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-40 lg:h-36" : "h-24 w-24 sm:h-32 sm:w-32 mb-3 sm:mb-0 sm:mr-5 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden"}
                        >
                          <img
                            src={
                              imageErrors[product._id]
                                ? "/images/placeholder.png"
                                : imageUrl
                            }
                            alt={product.name}
                            className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                            onError={() => handleImageError(product._id)}
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className={viewMode === "grid" ? "flex flex-col" : "flex flex-col sm:flex-row sm:items-start justify-between"}>
                            <div className="flex-1">
                              <Link
                                to={`/products/${productIdentifier}`}
                                className={viewMode === "grid" ? "text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 mb-1 block transition-colors line-clamp-2" : "text-base sm:text-lg font-semibold text-slate-900 hover:text-blue-600 mb-1 block transition-colors line-clamp-2"}
                              >
                                {product.name}
                              </Link>
                              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                {product.brand && (
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    {product.brand}
                                  </p>
                                )}
                                {product.category && (
                                  <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {product.category}
                                  </span>
                                )}
                              </div>
                              {item.selectedColor && (
                                <p className="mb-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                                  <span
                                    className="h-4 w-4 rounded-full border"
                                    style={{
                                      backgroundColor: item.selectedColor.value,
                                    }}
                                  />
                                  Color: {item.selectedColor.name}
                                </p>
                              )}

                              {/* Price */}
                              <div className="flex items-center flex-wrap gap-1.5 mb-2.5">
                                <span className={viewMode === "grid" ? "text-sm sm:text-base font-bold text-slate-900" : "text-lg sm:text-xl font-bold text-slate-900"}>
                                  PKR{" "}
                                  {product.discountPrice
                                    ? product.discountPrice.toLocaleString()
                                    : (product.price || 0).toLocaleString()}
                                </span>
                                {product.discountPrice && product.price && (
                                  <>
                                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                                      PKR {product.price.toLocaleString()}
                                    </span>
                                    <span className="text-[11px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                      Save{" "}
                                      {Math.round(
                                        (discount / product.price) * 100,
                                      )}
                                      %
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className={viewMode === "grid" ? "flex items-center justify-between gap-1.5 mt-1.5" : "flex items-center space-x-4 mt-3 sm:mt-0"}>
                              <div className="flex items-center border border-slate-300 rounded-lg">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      product._id,
                                      item.quantity - 1,
                                      product,
                                      variantId,
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-7 text-center text-xs font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      product._id,
                                      item.quantity + 1,
                                      product,
                                      variantId,
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  disabled={item.quantity >= availableStock}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() =>
                                  handleRemoveItem(
                                    product._id,
                                    product.name,
                                    variantId,
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {product.stock === 0 && (
                            <div className="mt-3 flex items-center text-sm text-red-600">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Out of Stock
                            </div>
                          )}

                          {/* Item Total */}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                            <div>
                              <span className="text-xs sm:text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs sm:text-sm text-gray-500">
                                Item Total
                              </div>
                              <div className={viewMode === "grid" ? "text-sm sm:text-base font-bold" : "text-lg sm:text-xl font-bold"}>
                                PKR{" "}
                                {(
                                  (product.discountPrice ||
                                    product.price ||
                                    0) * item.quantity
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Cart Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Truck className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium">Reliable Delivery</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Standard PKR {subtotal >= 5000 ? "0 (Free)" : "200"} or
                    Express PKR 350
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Secure Checkout</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your payment information is encrypted
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Package className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium">Easy Returns</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    3-day return policy for eligible products
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary - TAX REMOVED */}
            <div>
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm lg:sticky lg:top-24">
                <h2 className="text-xl font-bold text-slate-950 mb-4">
                  Order Summary
                </h2>

                {/* Ã¢Å“Â¨ NEW: Delivery Selection UI */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-medium text-gray-900 mb-3 text-sm">
                    Choose Delivery Method
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDeliveryMethod("standard")}
                      className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${
                        deliveryMethod === "standard"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      <Truck
                        className={`h-5 w-5 mb-1 ${deliveryMethod === "standard" ? "text-blue-600" : "text-gray-600"}`}
                      />
                      <span
                        className={`text-sm font-medium ${deliveryMethod === "standard" ? "text-blue-700" : "text-gray-700"}`}
                      >
                        Standard
                      </span>
                      <span className="text-xs text-gray-500">
                        {subtotal >= 5000 ? "Free" : "PKR 200"}
                      </span>
                      <span className="mt-1 text-center text-[11px] leading-4 text-slate-500">4-7 working days<br />after dispatch</span>
                    </button>

                    <button
                      onClick={() => setDeliveryMethod("express")}
                      className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${
                        deliveryMethod === "express"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-200 hover:border-yellow-300 bg-white"
                      }`}
                    >
                      <Zap
                        className={`h-5 w-5 mb-1 ${deliveryMethod === "express" ? "text-yellow-600" : "text-gray-600"}`}
                      />
                      <span
                        className={`text-sm font-medium ${deliveryMethod === "express" ? "text-yellow-700" : "text-gray-700"}`}
                      >
                        Express
                      </span>
                      <span className="text-xs text-yellow-600 font-medium">
                        PKR 350
                      </span>
                      <span className="mt-1 text-center text-[11px] leading-4 text-slate-500">2-3 days<br />after dispatch</span>
                    </button>
                  </div>
                  <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">Delivery estimates begin after your order is dispatched and handed to the courier company.</p>
                </div>

                {/* Price Breakdown - TAX REMOVED */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-slate-600">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-medium">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-slate-600">
                      {deliveryMethod === "standard"
                        ? "Standard Shipping"
                        : "Express Shipping"}
                    </span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `PKR ${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  {/* TAX SECTION COMPLETELY REMOVED */}

                  {calculateSavings() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Total Savings</span>
                      <span className="font-medium">
                        -PKR {calculateSavings().toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>PKR {total.toLocaleString()}</span>
                    </div>
                    {/* "Including all taxes" text removed */}
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={validCartItems.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors text-lg mb-4"
                >
                  Proceed to Checkout
                </button>

                {/* Payment Methods */}
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">We Accept</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                      <span className="text-xs font-bold text-blue-600">
                        COD
                      </span>
                    </div>
                    <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center border border-blue-200">
                      <span className="text-xs font-bold text-gray-700">
                        Easy
                      </span>
                    </div>
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                      <span className="text-xs font-bold text-gray-700">
                        Jazz
                      </span>
                    </div>
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                      <span className="text-xs font-bold text-gray-700">
                        Bank
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Assurance */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">
                      Secure Payment
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your payment information is encrypted and secure. We don't
                    store your credit card details.
                  </p>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 text-center">
                  <Link
                    to="/products"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CartPage;






