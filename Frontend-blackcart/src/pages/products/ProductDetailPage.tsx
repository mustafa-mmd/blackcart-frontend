// import React, { useEffect, useMemo, useState } from "react";
// import { Helmet } from "react-helmet-async";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Truck,
//   Shield,
//   RefreshCw,
//   ShoppingCart,
//   Minus,
//   Plus,
//   Share2,
//   Package,
//   AlertCircle,
//   CheckCircle,
//   Facebook,
//   Twitter,
//   Linkedin,
// } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { productService } from "../../services/productService";
// import { useCart } from "../../context/CartContext";
// import toast from "react-hot-toast";
// import Breadcrumb from "../../components/common/Breadcrumb";
// import Loader from "../../components/common/Loader";
// import ProductRail from "../../components/product/ProductRail";
// import ProductTabs from "../../components/product/ProductTabs";
// import ImageGallery from "../../components/product/ImageGallery";
// import type { Product, ProductColorVariant, ProductImage } from "../../types";
// import { getImageUrl } from "../../utils/imageUtils";
// import { recordProductView } from "../../utils/browsingHistory";
// import { BrandIcon } from "../../components/common/BrandIcon";

// const ProductDetailPage: React.FC = () => {
//   const { identifier } = useParams<{ identifier: string }>();
//   const navigate = useNavigate();
//   const { addToCart, isInCart, updateQuantity, cartItems } = useCart();

//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedColorId, setSelectedColorId] = useState("");
//   const [activeTab, setActiveTab] = useState<
//     "description" | "specifications" | "reviews" | "shipping"
//   >("description");

//   // Fetch product data
//   const {
//     data: productData,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["product", identifier],
//     queryFn: () => {
//       if (!identifier) throw new Error("No product identifier");
//       return productService.getProduct(identifier);
//     },
//     enabled: !!identifier,
//     retry: 1,
//     staleTime: 1000 * 60 * 5,
//   });

//   const product = productData?.data?.product || productData?.data;
//   const colorVariants: ProductColorVariant[] = Array.isArray(
//     product?.colorVariants,
//   )
//     ? product.colorVariants
//     : [];
//   const selectedColor = colorVariants.find(
//     (variant) => String(variant._id) === selectedColorId,
//   );
//   const reviews = product?.reviews || [];
//   const ratingStats = product?.ratingStats;
//   const categorySlug =
//     product?.categorySlug ||
//     (typeof product?.category === "object" ? product.category.slug : "") ||
//     (typeof product?.categoryId === "object" ? product.categoryId.slug : "");

//   const { data: relatedProductsResponse, isLoading: relatedProductsLoading } =
//     useQuery({
//       queryKey: ["related-products", categorySlug, product?._id],
//       queryFn: () =>
//         productService.getProductsByCategory(categorySlug, {
//           limit: 12,
//           sort: "createdAt",
//           order: "desc",
//         }),
//       enabled: Boolean(categorySlug && product?._id),
//       retry: 1,
//       staleTime: 5 * 60 * 1000,
//       refetchOnWindowFocus: false,
//     });

//   const relatedProducts = useMemo(
//     () =>
//       (relatedProductsResponse?.data?.products || [])
//         .filter(
//           (relatedProduct: Product) => relatedProduct._id !== product?._id,
//         )
//         .slice(0, 12),
//     [product?._id, relatedProductsResponse],
//   );

//   useEffect(() => {
//     if (product?._id) recordProductView(String(product._id), categorySlug);
//   }, [categorySlug, product?._id]);

//   const productImages = (() => {
//     const sourceImages = selectedColor?.images?.length
//       ? selectedColor.images
//       : product?.images;
//     if (!Array.isArray(sourceImages)) return ["/placeholder.png"];

//     const images = sourceImages
//       .map((image: string | ProductImage) => {
//         try {
//           return getImageUrl(image);
//         } catch {
//           return null;
//         }
//       })
//       .filter((url: string | null): url is string =>
//         Boolean(url && url !== "/placeholder.png"),
//       );

//     return images.length > 0 ? images : ["/placeholder.png"];
//   })();

//   const availableStock =
//     selectedColor && Number.isFinite(selectedColor.stock)
//       ? Number(selectedColor.stock)
//       : Number(product?.stock || 0);

//   // Calculate discount
//   const discountPercentage =
//     product?.discountPrice && product?.price
//       ? Math.round(
//           ((product.price - product.discountPrice) / product.price) * 100,
//         )
//       : 0;

//   // Format price
//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat("en-PK", {
//       style: "currency",
//       currency: "PKR",
//       minimumFractionDigits: 0,
//     }).format(price);
//   };

//   const handleAddToCart = () => {
//     if (!product) return;

//     if (colorVariants.length > 0 && !selectedColor) {
//       toast.error("Please select a color");
//       return;
//     }

//     if (availableStock === 0) {
//       toast.error("This product is out of stock");
//       return;
//     }

//     const cartProduct: Product = {
//       ...product,
//       _id: String(product._id),
//       name: String(product.name || "Product"),
//       image: String(productImages[0] || "/placeholder.png"),
//       stock: Number(product.stock || 0),
//     };

//     const isAlreadyInCart = isInCart(product._id);
//     const qtyToAdd = isAlreadyInCart ? 1 : quantity;

//     if (qtyToAdd > availableStock) {
//       toast.error("The requested quantity is not available");
//       return;
//     }

//     addToCart(cartProduct, qtyToAdd, selectedColor);

//     // Reset local quantity to 1 after adding
//     setQuantity(1);
//   };

//   // Handle buy now
//   const handleBuyNow = () => {
//     if (!product) return;

//     handleAddToCart();
//     setTimeout(() => {
//       navigate("/checkout");
//     }, 500);
//   };

//   // ✨ FULLY FIXED: Correctly syncs with global cart when clicking + or -
//   const handleQuantityChange = (type: "increase" | "decrease") => {
//     if (!product) return;

//     // Find the current actual count in the global cart
//     const existingItem = cartItems.find((item) => {
//       const pId =
//         typeof item.product === "string" ? item.product : item.product?._id;
//       return pId === product._id;
//     });
//     const currentGlobalQty = existingItem ? existingItem.quantity : 0;

//     if (type === "increase") {
//       // If the item is already in the cart, increase the GLOBAL count by 1
//       if (existingItem) {
//         const newGlobalQty = currentGlobalQty + 1;
//         if (newGlobalQty > availableStock) {
//           toast.error("The requested quantity is not available");
//           return;
//         }
//         setQuantity(newGlobalQty);
//         updateQuantity(product._id, newGlobalQty, product, selectedColorId);
//         return;
//       }

//       // Standard local increase for brand new items
//       if (quantity >= availableStock) {
//         toast.error("The requested quantity is not available");
//         return;
//       }
//       const newQty = quantity + 1;
//       setQuantity(newQty);
//     } else {
//       // decrease
//       // If local quantity is 1, but we have > 1 items in the global cart, decrease global by 1
//       if (quantity === 1 && currentGlobalQty > 1) {
//         const newGlobalQty = currentGlobalQty - 1;
//         setQuantity(newGlobalQty);
//         updateQuantity(product._id, newGlobalQty, product, selectedColorId);
//         return;
//       }

//       // Standard local decrease
//       if (quantity <= 1) return; // Cannot go below 1
//       const newQty = quantity - 1;
//       setQuantity(newQty);
//       if (existingItem) {
//         updateQuantity(product._id, newQty, product, selectedColorId);
//       }
//     }
//   };

//   // Handle share
//   const handleShare = async () => {
//     const url = window.location.href;
//     const text = `Check out ${product?.name} on BlackCart!`;

//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: product?.name,
//           text: text,
//           url: url,
//         });
//       } catch (err) {
//         console.log("Share cancelled:", err);
//       }
//     } else {
//       navigator.clipboard.writeText(url);
//       toast.success("Link copied to clipboard!");
//     }
//   };

//   // Handle social share
//   const handleSocialShare = (platform: string) => {
//     const url = encodeURIComponent(window.location.href);
//     const text = encodeURIComponent(`Check out ${product?.name} on BlackCart!`);

//     const urls: Record<string, string> = {
//       facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
//       twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
//       linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
//       whatsapp: `https://wa.me/?text=${text}%20${url}`,
//     };

//     if (urls[platform]) {
//       window.open(urls[platform], "_blank", "noopener,noreferrer");
//     }
//   };

//   // Breadcrumb items
//   const breadcrumbItems = [
//     { label: "Home", href: "/" },
//     { label: "Products", href: "/products" },
//     {
//       label: product?.category || "Category",
//       href: `/products?category=${product?.category}`,
//     },
//     { label: product?.name || "Product", href: "#", current: true },
//   ];

//   // Loading state
//   if (isLoading) {
//     return <Loader />;
//   }

//   // Error state
//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="container mx-auto px-4 text-center">
//           <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
//             <AlertCircle className="h-12 w-12 text-red-400" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">
//             Product Not Found
//           </h1>
//           <p className="text-gray-600 mb-6">
//             {error
//               ? "Failed to load product details. Please try again."
//               : "The product you're looking for doesn't exist or has been removed."}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button
//               onClick={() => navigate(-1)}
//               className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
//             >
//               Go Back
//             </button>
//             <button
//               onClick={() => navigate("/products")}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Browse Products
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const productUrl = `https://blackcart.store/products/${identifier}`;
//   const productImage =
//     productImages[0] || "https://blackcart.store/BlackCart.png";
//   const productPrice = product.discountPrice || product.price;
//   const schemaStockAvailability =
//     product.stock > 0
//       ? "https://schema.org/InStock"
//       : "https://schema.org/OutOfStock";
//   const shortDescription = product.description
//     ? product.description.replace(/<[^>]+>/g, "").slice(0, 150)
//     : `Buy ${product.name} in Pakistan at the best price.`;

//   const productSchema = {
//     "@context": "https://schema.org/",
//     "@type": "Product",
//     name: product.name,
//     image: productImages.length > 0 ? productImages : [productImage],
//     description:
//       product.description || `${product.name} available at BlackCart Pakistan.`,
//     sku: product.sku,
//     brand: {
//       "@type": "Brand",
//       name: product.brand || "BlackCart",
//     },
//     offers: {
//       "@type": "Offer",
//       url: productUrl,
//       priceCurrency: "PKR",
//       price: productPrice,
//       availability: schemaStockAvailability,
//       seller: {
//         "@type": "Organization",
//         name: "BlackCart",
//       },
//     },
//     ...(product.rating && product.numReviews
//       ? {
//           aggregateRating: {
//             "@type": "AggregateRating",
//             ratingValue: product.rating,
//             reviewCount: product.numReviews,
//           },
//         }
//       : {}),
//   };

//   // Calculate shipping values dynamically for this product
//   const singleItemPrice = product.discountPrice || product.price;
//   const isFreeShipping = singleItemPrice >= 5000;
//   const standardCost = isFreeShipping ? "FREE" : "PKR 200";
//   const expressCost = "PKR 350";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Helmet>
//         <title>{product.name} — Buy in Pakistan | BlackCart</title>
//         <meta
//           name="description"
//           content={`Buy ${product.name} in Pakistan at the best price. ${shortDescription}. Fast nationwide delivery. Order now at BlackCart.`}
//         />
//         <meta
//           property="og:title"
//           content={`${product.name} | BlackCart Pakistan`}
//         />
//         <meta
//           property="og:description"
//           content={`Buy ${product.name} online in Pakistan. ${shortDescription}`}
//         />
//         <meta property="og:image" content={productImage} />
//         <meta property="og:url" content={productUrl} />
//         <meta property="og:type" content="product" />
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content={`${product.name} | BlackCart`} />
//         <meta name="twitter:image" content={productImage} />
//         <link rel="canonical" href={productUrl} />
//         <script type="application/ld+json">
//           {JSON.stringify(productSchema)}
//         </script>
//       </Helmet>
//       {/* Breadcrumb */}
//       <div className="container mx-auto px-4 py-2">
//         <Breadcrumb items={breadcrumbItems} />
//       </div>

//       {/* Main Product Section */}
//       <div className="container mx-auto px-4 py-3">
//         <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
//           {/* Left Column - Images + Tabs */}
//           <div className="flex flex-col">
//             <ImageGallery
//               images={
//                 productImages.length > 0 ? productImages : ["/placeholder.png"]
//               }
//               productName={product.name}
//               initialImage={selectedImage}
//               onImageChange={setSelectedImage}
//             />
//             <div className="mt-8">
//               <ProductTabs
//                 activeTab={activeTab}
//                 onTabChange={setActiveTab}
//                 product={product}
//                 reviews={reviews}
//                 ratingStats={ratingStats}
//               />
//             </div>
//           </div>

//           {/* Right Column - Product Info */}
//           <div className="space-y-6">
//             {/* Product Title & Meta */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
//                   {typeof product.category === "object"
//                     ? product.category.name || "Category"
//                     : product.category || "Category"}
//                 </span>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-gray-500">SKU:</span>
//                   <span className="text-sm font-medium text-gray-900">
//                     {selectedColor?.sku || product.sku}
//                   </span>
//                 </div>
//               </div>

//               <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
//                 {product.name}
//               </h1>

//               <div className="mb-4 flex items-center text-green-600">
//                 <CheckCircle className="mr-1 h-4 w-4" />
//                 <span className="text-sm">Verified Product</span>
//               </div>
//             </div>

//             {/* Price Section */}
//             <div className="p-6 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
//               <div className="flex items-baseline space-x-4 mb-2">
//                 <span className="text-3xl lg:text-4xl font-bold text-gray-900">
//                   {formatPrice(product.discountPrice || product.price)}
//                 </span>

//                 {discountPercentage > 0 && (
//                   <>
//                     <span className="text-xl text-gray-500 line-through">
//                       {formatPrice(product.price)}
//                     </span>
//                     <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">
//                       Save {discountPercentage}%
//                     </span>
//                   </>
//                 )}
//               </div>

//               <p className="text-sm text-gray-600">
//                 <span className="font-medium">Inclusive of all taxes</span> •
//                 Choose Normal or Express delivery at checkout
//               </p>
//             </div>

//             {/* Short Description */}
//             {product.shortDescription && (
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <h3 className="font-semibold text-gray-900 mb-2">
//                   Quick Overview
//                 </h3>
//                 <p className="text-gray-600">{product.shortDescription}</p>
//               </div>
//             )}

//             {/* Features Grid with real dates & removed Warranty */}
//             <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Truck className="h-5 w-5 text-green-600" />
//                 <div>
//                   <div className="font-medium">Nationwide Delivery</div>
//                   <div className="text-sm text-gray-500">
//                     Standard: 3-5 Days ({standardCost}) • Express: 1-2 Days (
//                     {expressCost})
//                   </div>
//                   {isFreeShipping && (
//                     <div className="text-xs text-green-600 font-medium mt-0.5">
//                       🎉 Free Shipping!
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <RefreshCw className="h-5 w-5 text-purple-600" />
//                 <div>
//                   <div className="font-medium">Easy Returns</div>
//                   <div className="text-sm text-gray-500">3-Day Policy</div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Package className="h-5 w-5 text-orange-600" />
//                 <div>
//                   <div className="font-medium">Safe Packaging</div>
//                   <div className="text-sm text-gray-500">Guaranteed</div>
//                 </div>
//               </div>
//             </div>

//             {colorVariants.length > 0 && (
//               <fieldset className="rounded-xl border border-gray-200 bg-white p-4">
//                 <legend className="px-1 text-sm font-semibold text-gray-900">
//                   Choose a color
//                 </legend>
//                 <div className="mt-2 flex flex-wrap gap-3">
//                   {colorVariants.map((variant) => {
//                     const id = String(variant._id || variant.name);
//                     const isSelected = selectedColorId === id;
//                     const isUnavailable =
//                       Number.isFinite(variant.stock) &&
//                       Number(variant.stock) <= 0;
//                     return (
//                       <button
//                         key={id}
//                         type="button"
//                         disabled={isUnavailable}
//                         onClick={() => {
//                           setSelectedColorId(id);
//                           setSelectedImage(0);
//                           setQuantity(1);
//                         }}
//                         aria-pressed={isSelected}
//                         aria-label={`${variant.name}${isUnavailable ? " - out of stock" : ""}`}
//                         className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
//                           isSelected
//                             ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-100"
//                             : "border-gray-200 hover:border-gray-400"
//                         } disabled:cursor-not-allowed disabled:opacity-40`}
//                       >
//                         <span
//                           className="h-5 w-5 rounded-full border border-black/10 shadow-inner"
//                           style={{ backgroundColor: variant.value }}
//                         />
//                         {variant.name}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </fieldset>
//             )}

//             {/* Quantity & Actions */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Quantity
//                 </label>
//                 <div className="flex items-center">
//                   <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
//                     <button
//                       onClick={() => handleQuantityChange("decrease")}
//                       className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       disabled={quantity <= 1}
//                     >
//                       <Minus className="h-5 w-5" />
//                     </button>
//                     <span className="w-16 text-center text-lg font-bold">
//                       {quantity}
//                     </span>
//                     <button
//                       onClick={() => handleQuantityChange("increase")}
//                       className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       disabled={quantity >= availableStock}
//                     >
//                       <Plus className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={availableStock === 0}
//                   className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all ${
//                     availableStock === 0
//                       ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                       : "bg-blue-600 hover:bg-blue-700 text-white"
//                   }`}
//                 >
//                   <ShoppingCart className="h-5 w-5" />
//                   <span className="font-medium">
//                     {isInCart(product._id)
//                       ? "Add Another (+1)"
//                       : availableStock === 0
//                         ? "Out of Stock"
//                         : "Add to Cart"}
//                   </span>
//                 </button>

//                 <button
//                   onClick={handleBuyNow}
//                   disabled={availableStock === 0}
//                   className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
//                     availableStock === 0
//                       ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                       : "bg-gray-900 hover:bg-black text-white"
//                   }`}
//                 >
//                   Buy Now
//                 </button>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="grid grid-cols-1 gap-3">
//               <button
//                 onClick={handleShare}
//                 className="flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
//               >
//                 <Share2 className="h-5 w-5" />
//                 Share
//               </button>
//             </div>

//             {/* Social Sharing */}
//             <div className="pt-4 border-t border-gray-200">
//               <p className="text-sm text-gray-600 mb-3">Share with friends:</p>
//               <div className="flex space-x-3">
//                 {["facebook", "twitter", "linkedin", "whatsapp"].map(
//                   (platform) => (
//                     <button
//                       key={platform}
//                       onClick={() => handleSocialShare(platform)}
//                       className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//                       aria-label={`Share on ${platform}`}
//                     >
//                       {platform === "facebook" && (
//                         <Facebook className="h-5 w-5 text-blue-600" />
//                       )}
//                       {platform === "twitter" && (
//                         <Twitter className="h-5 w-5 text-blue-400" />
//                       )}
//                       {platform === "linkedin" && (
//                         <Linkedin className="h-5 w-5 text-blue-700" />
//                       )}
//                       {platform === "whatsapp" && (
//                         <BrandIcon
//                           brand="whatsapp"
//                           className="h-5 w-5 text-green-500"
//                         />
//                       )}
//                     </button>
//                   ),
//                 )}
//               </div>
//             </div>

//             {/* Brand & Tags */}
//             <div className="pt-6 border-t border-gray-200">
//               <div className="flex items-center justify-between mb-3">
//                 <span className="text-sm text-gray-600">Brand:</span>
//                 <span className="font-medium">
//                   {product.brand || "Unknown"}
//                 </span>
//               </div>
//               {product.tags?.length > 0 && (
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Tags:</span>
//                   <div className="flex flex-wrap gap-1 justify-end">
//                     {product.tags
//                       .slice(0, 3)
//                       .map((tag: string, index: number) => (
//                         <span
//                           key={index}
//                           className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
//                         >
//                           {tag}
//                         </span>
//                       ))}
//                     {product.tags.length > 3 && (
//                       <span className="text-xs text-gray-500">
//                         +{product.tags.length - 3} more
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Related Products (Spans full width below the main grid) */}
//         {categorySlug && (
//           <div className="mt-12 overflow-hidden rounded-2xl">
//             <ProductRail
//               id="related-products"
//               title="Related Products"
//               subtitle="More products from the same category"
//               products={relatedProducts}
//               viewAllUrl={`/categories/${categorySlug}`}
//               isLoading={relatedProductsLoading}
//               backgroundClassName="bg-white"
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductDetailPage;

import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import {
  Truck,
  RefreshCw,
  ShoppingCart,
  Minus,
  Plus,
  Share2,
  Package,
  AlertCircle,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import Breadcrumb from "../../components/common/Breadcrumb";
import Loader from "../../components/common/Loader";
import ProductRail from "../../components/product/ProductRail";
import ProductTabs from "../../components/product/ProductTabs";
import ImageGallery from "../../components/product/ImageGallery";
import type { Product, ProductColorVariant, ProductImage } from "../../types";
import { getImageUrl } from "../../utils/imageUtils";
import { recordProductView } from "../../utils/browsingHistory";
import { BrandIcon } from "../../components/common/BrandIcon";

const ProductDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, updateQuantity, cartItems } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColorId, setSelectedColorId] = useState("");
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews" | "shipping"
  >("description");

  // Fetch product data
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", identifier],
    queryFn: () => {
      if (!identifier) throw new Error("No product identifier");
      return productService.getProduct(identifier);
    },
    enabled: !!identifier,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const product = productData?.data?.product || productData?.data;
  const colorVariants: ProductColorVariant[] = Array.isArray(
    product?.colorVariants,
  )
    ? product.colorVariants
    : [];
  const selectedColor = colorVariants.find(
    (variant) => String(variant._id) === selectedColorId,
  );
  const reviews = product?.reviews || [];
  const ratingStats = product?.ratingStats;
  const categorySlug =
    product?.categorySlug ||
    (typeof product?.category === "object" ? product.category.slug : "") ||
    (typeof product?.categoryId === "object" ? product.categoryId.slug : "");

  const { data: relatedProductsResponse, isLoading: relatedProductsLoading } =
    useQuery({
      queryKey: ["related-products", categorySlug, product?._id],
      queryFn: () =>
        productService.getProductsByCategory(categorySlug, {
          limit: 12,
          sort: "createdAt",
          order: "desc",
        }),
      enabled: Boolean(categorySlug && product?._id),
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  const relatedProducts = useMemo(
    () =>
      (relatedProductsResponse?.data?.products || [])
        .filter(
          (relatedProduct: Product) => relatedProduct._id !== product?._id,
        )
        .slice(0, 12),
    [product?._id, relatedProductsResponse],
  );

  useEffect(() => {
    if (product?._id) recordProductView(String(product._id), categorySlug);
  }, [categorySlug, product?._id]);

  const baseProductImages = product?.images;
  const selectedColorImages = selectedColor?.images;
  const productImages = (() => {
    const sourceImages = [
      ...(Array.isArray(selectedColorImages) ? selectedColorImages : []),
      ...(Array.isArray(baseProductImages) ? baseProductImages : []),
    ];

    const images = sourceImages
      .map((image: string | ProductImage) => {
        try {
          return getImageUrl(image);
        } catch {
          return null;
        }
      })
      .filter(
        (url: string | null): url is string =>
          Boolean(url && url !== "/placeholder.png"),
      )
      .filter((url, index, allImages) => allImages.indexOf(url) === index);

    return images.length > 0 ? images : ["/placeholder.png"];
  })();

  const availableStock =
    selectedColor && Number.isFinite(selectedColor.stock)
      ? Number(selectedColor.stock)
      : Number(product?.stock || 0);

  // Calculate discount
  const discountPercentage =
    product?.discountPrice && product?.price
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100,
        )
      : 0;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (colorVariants.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (availableStock === 0) {
      toast.error("This product is out of stock");
      return;
    }

    const cartProduct: Product = {
      ...product,
      _id: String(product._id),
      name: String(product.name || "Product"),
      image: String(productImages[0] || "/placeholder.png"),
      stock: Number(product.stock || 0),
    };

    const isAlreadyInCart = isInCart(product._id);
    const qtyToAdd = isAlreadyInCart ? 1 : quantity;

    if (qtyToAdd > availableStock) {
      toast.error("The requested quantity is not available");
      return;
    }

    addToCart(cartProduct, qtyToAdd, selectedColor);

    // Reset local quantity to 1 after adding
    setQuantity(1);
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!product) return;

    handleAddToCart();
    setTimeout(() => {
      navigate("/checkout");
    }, 500);
  };

  // FULLY FIXED: Correctly syncs with global cart when clicking + or -
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (!product) return;

    // Find the current actual count in the global cart
    const existingItem = cartItems.find((item) => {
      const pId =
        typeof item.product === "string" ? item.product : item.product?._id;
      return pId === product._id;
    });
    const currentGlobalQty = existingItem ? existingItem.quantity : 0;

    if (type === "increase") {
      // If the item is already in the cart, increase the GLOBAL count by 1
      if (existingItem) {
        const newGlobalQty = currentGlobalQty + 1;
        if (newGlobalQty > availableStock) {
          toast.error("The requested quantity is not available");
          return;
        }
        setQuantity(newGlobalQty);
        updateQuantity(product._id, newGlobalQty, product, selectedColorId);
        return;
      }

      // Standard local increase for brand new items
      if (quantity >= availableStock) {
        toast.error("The requested quantity is not available");
        return;
      }
      const newQty = quantity + 1;
      setQuantity(newQty);
    } else {
      // decrease
      // If local quantity is 1, but we have > 1 items in the global cart, decrease global by 1
      if (quantity === 1 && currentGlobalQty > 1) {
        const newGlobalQty = currentGlobalQty - 1;
        setQuantity(newGlobalQty);
        updateQuantity(product._id, newGlobalQty, product, selectedColorId);
        return;
      }

      // Standard local decrease
      if (quantity <= 1) return; // Cannot go below 1
      const newQty = quantity - 1;
      setQuantity(newQty);
      if (existingItem) {
        updateQuantity(product._id, newQty, product, selectedColorId);
      }
    }
  };

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${product?.name} on BlackCart!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: text,
          url: url,
        });
      } catch (err) {
        console.log("Share cancelled:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Handle social share
  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${product?.name} on BlackCart!`);

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    {
      label: product?.category || "Category",
      href: `/products?category=${product?.category}`,
    },
    { label: product?.name || "Product", href: "#", current: true },
  ];

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error
              ? "Failed to load product details. Please try again."
              : "The product you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const productUrl = `https://blackcart.store/products/${identifier}`;
  const productImage =
    productImages[0] || "https://blackcart.store/BlackCart.png";
  const productPrice = product.discountPrice || product.price;
  const schemaStockAvailability =
    product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  const shortDescription = product.description
    ? product.description.replace(/<[^>]+>/g, "").slice(0, 150)
    : `Buy ${product.name} in Pakistan at the best price.`;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: productImages.length > 0 ? productImages : [productImage],
    description:
      product.description || `${product.name} available at BlackCart Pakistan.`,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "BlackCart",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "PKR",
      price: productPrice,
      availability: schemaStockAvailability,
      seller: {
        "@type": "Organization",
        name: "BlackCart",
      },
    },
    ...(product.rating && product.numReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.numReviews,
          },
        }
      : {}),
  };

  // Calculate shipping values dynamically for this product
  const singleItemPrice = product.discountPrice || product.price;
  const isFreeShipping = singleItemPrice >= 5000;
  const standardCost = isFreeShipping ? "FREE" : "PKR 200";
  const expressCost = "PKR 350";

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{product.name} — Buy in Pakistan | BlackCart</title>
        <meta
          name="description"
          content={`Buy ${product.name} in Pakistan at the best price. ${shortDescription}. Fast nationwide delivery. Order now at BlackCart.`}
        />
        <meta
          property="og:title"
          content={`${product.name} | BlackCart Pakistan`}
        />
        <meta
          property="og:description"
          content={`Buy ${product.name} online in Pakistan. ${shortDescription}`}
        />
        <meta property="og:image" content={productImage} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | BlackCart`} />
        <meta name="twitter:image" content={productImage} />
        <link rel="canonical" href={productUrl} />
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-2">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {/* Left Column - Images + Color Picker + Tabs */}
          <div className="flex flex-col">
            <ImageGallery
              images={
                productImages.length > 0 ? productImages : ["/placeholder.png"]
              }
              productName={product.name}
              initialImage={selectedImage}
              onImageChange={setSelectedImage}
            />

            {/* Choose a color - now directly under the image gallery */}
            {colorVariants.length > 0 && (
              <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <legend className="px-1 text-sm font-semibold text-gray-900">
                  Choose a color
                </legend>
                <div className="mt-2 flex flex-wrap gap-3">
                  {colorVariants.map((variant) => {
                    const id = String(variant._id || variant.name);
                    const isSelected = selectedColorId === id;
                    const isUnavailable =
                      Number.isFinite(variant.stock) &&
                      Number(variant.stock) <= 0;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={isUnavailable}
                        onClick={() => {
                          setSelectedColorId(id);
                          setSelectedImage(0);
                          setQuantity(1);
                        }}
                        aria-pressed={isSelected}
                        aria-label={`${variant.name}${isUnavailable ? " - out of stock" : ""}`}
                        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-gray-400"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <span
                          className="h-5 w-5 rounded-full border border-black/10 shadow-inner"
                          style={{ backgroundColor: variant.value }}
                        />
                        {variant.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-8">
              <ProductTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                product={product}
                reviews={reviews}
                ratingStats={ratingStats}
              />
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title & Meta */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {typeof product.category === "object"
                    ? product.category.name || "Category"
                    : product.category || "Category"}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">SKU:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedColor?.sku || product.sku}
                  </span>
                </div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              <div className="mb-4 flex items-center text-green-600">
                <CheckCircle className="mr-1 h-4 w-4" />
                <span className="text-sm">Verified Product</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
              <div className="flex items-baseline space-x-4 mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {formatPrice(product.discountPrice || product.price)}
                </span>

                {discountPercentage > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-600">
                <span className="font-medium">Inclusive of all taxes</span> •
                Choose Normal or Express delivery at checkout
              </p>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Quick Overview
                </h3>
                <p className="text-gray-600">{product.shortDescription}</p>
              </div>
            )}

            {/* Features Grid with real dates & removed Warranty */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Nationwide Delivery</div>
                  <div className="text-sm text-gray-500">
                    Standard: 3-5 Days ({standardCost}) • Express: 1-2 Days (
                    {expressCost})
                  </div>
                  {isFreeShipping && (
                    <div className="text-xs text-green-600 font-medium mt-0.5">
                      🎉 Free Shipping!
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Easy Returns</div>
                  <div className="text-sm text-gray-500">3-Day Policy</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium">Safe Packaging</div>
                  <div className="text-sm text-gray-500">Guaranteed</div>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange("decrease")}
                      className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-16 text-center text-lg font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange("increase")}
                      className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={quantity >= availableStock}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock === 0}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all ${
                    availableStock === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">
                    {isInCart(product._id)
                      ? "Add Another (+1)"
                      : availableStock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                  </span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={availableStock === 0}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                    availableStock === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-black text-white"
                  }`}
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>

            {/* Social Sharing */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Share with friends:</p>
              <div className="flex space-x-3">
                {["facebook", "twitter", "linkedin", "whatsapp"].map(
                  (platform) => (
                    <button
                      key={platform}
                      onClick={() => handleSocialShare(platform)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label={`Share on ${platform}`}
                    >
                      {platform === "facebook" && (
                        <Facebook className="h-5 w-5 text-blue-600" />
                      )}
                      {platform === "twitter" && (
                        <Twitter className="h-5 w-5 text-blue-400" />
                      )}
                      {platform === "linkedin" && (
                        <Linkedin className="h-5 w-5 text-blue-700" />
                      )}
                      {platform === "whatsapp" && (
                        <BrandIcon
                          brand="whatsapp"
                          className="h-5 w-5 text-green-500"
                        />
                      )}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Brand & Tags */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Brand:</span>
                <span className="font-medium">
                  {product.brand || "Unknown"}
                </span>
              </div>
              {product.tags?.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {product.tags
                      .slice(0, 3)
                      .map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    {product.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{product.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products (Spans full width below the main grid) */}
        {categorySlug && (
          <div className="mt-12 overflow-hidden rounded-2xl">
            <ProductRail
              id="related-products"
              title="Related Products"
              subtitle="More products from the same category"
              products={relatedProducts}
              viewAllUrl={`/categories/${categorySlug}`}
              isLoading={relatedProductsLoading}
              backgroundClassName="bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
