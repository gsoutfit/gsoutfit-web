"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  Check,
  ChevronDown,
  Sparkles,
  Flame,
  ArrowRight,
  Send,
  Loader2,
  Share2,
} from "lucide-react";
import { Product, Review } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryDisplayName } from "@/lib/translations";
import { SizeGuideModal } from "@/components/SizeGuideModal";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();
  const { showToast } = useToast();
  const { t, getLocalizedText, language } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"description" | "fabric" | "fit" | "shipping">("description");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Review Form
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      if (!productId) return;
      setIsLoading(true);
      try {
        const [pRes, rRes, allRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/reviews?productId=${productId}`),
          fetch("/api/products"),
        ]);
        const pData = await pRes.json();
        const rData = await rRes.json();
        const allData = await allRes.json();

        if (pData.success && pData.data) {
          const prod: Product = pData.data;
          setProduct(prod);
          setSelectedImage(prod.images[0] || "");
          setSelectedSize(prod.sizes[0] || "M");
          setSelectedColor(prod.colors[0]?.name || "Standard");
          addRecentlyViewed(prod);

          if (allData.success) {
            const related = (allData.data as Product[])
              .filter((p) => p.id !== prod.id && (p.category === prod.category || p.season === prod.season))
              .slice(0, 4);
            setRelatedProducts(related);
          }

          // Track product view for dynamic trending score
          fetch(`/api/products/${prod.id}/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "view" }),
          }).catch(() => {});
        }

        if (rData.success) {
          setReviews(rData.data);
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProductData();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
          Retrieving Garment Dossier...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-32 px-4 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl font-bold text-white">Garment Not Found</h2>
        <p className="text-xs text-zinc-400">
          The requested luxury piece may have been retired or moved to the vault.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const currentStockForSize = product.stockPerSize?.[selectedSize] ?? product.stock;
  const price = product.discountPrice ?? product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    // Track cart addition for dynamic trending
    fetch(`/api/products/${product.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cart_add" }),
    }).catch(() => {});
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    fetch(`/api/products/${product.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cart_add" }),
    }).catch(() => {});
    router.push("/checkout");
  };


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewName,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setIsReviewModalOpen(false);
        setReviewName("");
        setReviewTitle("");
        setReviewComment("");
        showToast("Review Published", "Thank you for reviewing this garment.", "success");
      }
    } catch {
      showToast("Error", "Could not submit review.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        <Link href="/" className="hover:text-zinc-300">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-zinc-300">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-zinc-300">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-[#D4AF37] truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery (Thumbnails + Main Image) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Vertical Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 pb-2 md:pb-0">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden bg-zinc-900 border-2 transition-all ${
                  selectedImage === img
                    ? "border-[#D4AF37] scale-105 shadow-gold"
                    : "border-zinc-800 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main Large Image */}
          <div className="relative flex-1 aspect-[3/4] rounded-3xl overflow-hidden bg-[#121216] border border-[#24242B] shadow-2xl">
            <Image
              src={selectedImage || product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFlashSale && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-lg">
                  <Flame className="w-3.5 h-3.5" /> Flash Sale ({discountPercent}% OFF)
                </span>
              )}
              {product.isTrending && !product.isFlashSale && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-black shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" /> Trending Piece
                </span>
              )}
            </div>

            {/* Wishlist floating button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                isWishlisted
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                  : "bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80"
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Details & Controls */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-400">
              <span className="text-[#D4AF37] font-bold">{product.season}</span>
              <span>SKU: {product.id.toUpperCase()}</span>
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                {getLocalizedText(product.name, product.nameBn)}
              </h1>
              {product.tagline && (
                <p className="text-xs sm:text-sm text-zinc-400 italic mt-1">
                  {getLocalizedText(product.tagline, product.taglineBn)}
                </p>
              )}
            </div>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating) ? "fill-current" : "opacity-30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-200">{product.rating.toFixed(1)} / 5.0</span>
              <span className="text-xs text-zinc-500">•</span>
              <a href="#reviews-section" className="text-xs text-zinc-400 hover:text-[#D4AF37] underline">
                {reviews.length} {t("product_reviews")}
              </a>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#141418] border border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {t("product_price")}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#FAF8F5]">
                    {formatPrice(price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-zinc-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {hasDiscount && (
                <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase">
                  {t("product_discount")} {discountPercent}%
                </span>
              )}
            </div>

            {/* Color Swatches */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-400">{t("product_color")}:</span>
                <span className="font-bold text-zinc-200">{selectedColor}</span>
              </div>
              <div className="flex gap-2">
                {product.colors.map((col) => (
                  <button
                    key={col.name}
                    title={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === col.name
                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-110 shadow-gold"
                        : "border-white/20 hover:scale-105"
                    }`}
                  >
                    {selectedColor === col.name && (
                      <Check
                        className={`w-4 h-4 ${col.name.includes("White") ? "text-black" : "text-white"}`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector with Size Guide */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-400">{t("product_select_size")}:</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" /> {t("product_size_guide")}
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      selectedSize === s
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-gold"
                        : "bg-[#18181f] text-zinc-300 border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Stock Alert */}
              <div className="text-[11px] pt-1">
                {currentStockForSize <= 5 ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                    <Flame className="w-3 h-3 text-rose-500" /> {currentStockForSize} {t("product_pieces_available")}!
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t("product_in_stock")}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Stepper & Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Stepper */}
                <div className="flex items-center rounded-xl border border-zinc-800 bg-[#16161c] px-3 py-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-zinc-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-zinc-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStockForSize, quantity + 1))}
                    className="p-1.5 text-zinc-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag CTA */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-gold ${
                    isAdded
                      ? "bg-emerald-500 text-white shadow-emerald-500/30"
                      : "bg-[#D4AF37] hover:bg-[#E5C365] text-black"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> {t("product_add_to_cart")}!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> {t("product_add_to_cart")}
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now Express Button */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl bg-[#1a1a22] hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.15em] transition-colors border border-zinc-700"
              >
                {t("product_buy_now")}
              </button>
            </div>

            {/* Value Guarantees */}
            <div className="p-4 rounded-2xl bg-[#0f0f13] border border-zinc-800/80 space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t("footer_shipping_desc")}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                <span>{t("footer_exchange_desc")}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t("footer_craftsmanship_title")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion / Tabbed Specs Section */}
      <section className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap gap-3 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "description" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {t("product_view_details")}
          </button>
          <button
            onClick={() => setActiveTab("fabric")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "fabric" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {t("product_fabric_care")}
          </button>
          <button
            onClick={() => setActiveTab("fit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "fit" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {t("product_fit_details")}
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "shipping" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {t("footer_complimentary_shipping")}
          </button>
        </div>

        <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl space-y-4">
          {activeTab === "description" && (
            <div>
              <p>{getLocalizedText(product.description, product.descriptionBn)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-zinc-800 text-[11px] text-zinc-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "fabric" && (
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">{t("product_fabric_care")}:</h4>
              <p>
                {getLocalizedText(
                  product.fabricCare || "100% Handcrafted Premium Natural Fibers. Specialist Dry Clean Only.",
                  product.fabricCareBn
                )}
              </p>
            </div>
          )}

          {activeTab === "fit" && (
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">{t("product_fit_details")}:</h4>
              <p>
                {getLocalizedText(
                  product.fitDetails || "Modern architectural silhouette. Designed to drape cleanly without pulling.",
                  product.fitDetailsBn
                )}
              </p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-3">
              <p>• <strong>Express Courier:</strong> {t("footer_shipping_desc")}</p>
              <p>• <strong>Bespoke Packaging:</strong> Each garment is individually inspected, steam-pressed, and protected in a branded matte black hanger garment box.</p>
              <p>• <strong>Exchanges:</strong> {t("footer_exchange_desc")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews & Rating Breakdown Section */}
      <section id="reviews-section" className="space-y-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202026] pb-6">
          <div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-black text-white">
              Client Reviews & Ratings
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Authentic feedback from verified purchasers worldwide.
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.length === 0 ? (
            <div className="col-span-2 py-12 text-center rounded-2xl bg-[#121216] border border-zinc-800 text-zinc-400">
              <p className="text-sm">Be the first to review this iconic garment.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-6 rounded-2xl bg-[#141418] border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-500">{formatDate(rev.date)}</span>
                </div>

                <h4 className="font-bold text-sm text-zinc-100">{rev.title}</h4>
                <p className="text-xs text-zinc-300 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>

                <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-800/80 text-xs">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden relative">
                    <Image
                      src={rev.userAvatar || "https://api.dicebear.com/7.x/initials/svg?seed=GS"}
                      alt={rev.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold text-zinc-200">{rev.userName}</span>
                  {rev.verified && (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">• Verified Buyer</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products ("Complete The Look" / "Customers Also Bought") */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-[#202026]">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Curated Recommendations
              </span>
              <h2 className="font-serif-luxury text-2xl font-bold text-white mt-1">
                Customers Also Acquired
              </h2>
            </div>
            <Link href="/shop" className="text-xs text-[#D4AF37] hover:underline font-semibold">
              Browse All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 1 && (
        <section className="space-y-6 pt-8 border-t border-[#202026]">
          <h2 className="font-serif-luxury text-xl font-bold text-white">
            Recently Viewed Garments
          </h2>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-4 gap-4">
            {recentlyViewed
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="p-3 rounded-2xl bg-[#141418] border border-zinc-800 hover:border-[#D4AF37]/50 transition-colors flex items-center gap-3 group"
                >
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-[#D4AF37]">
                      {p.name}
                    </p>
                    <p className="text-xs font-bold text-zinc-100 mt-0.5">
                      {formatPrice(p.discountPrice ?? p.price)}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div
            onClick={() => setIsReviewModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#141418] border border-zinc-800 p-6 z-10 text-zinc-100 space-y-4 shadow-2xl">
            <h3 className="font-serif-luxury text-lg font-bold">Write a Client Review</h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Julian Sterling"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-semibold mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none"
                >
                  <option value={5}>5 Stars - Perfection</option>
                  <option value={4}>4 Stars - Exceptional</option>
                  <option value={3}>3 Stars - Good</option>
                  <option value={2}>2 Stars - Fair</option>
                  <option value={1}>1 Star - Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-semibold mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flawless tailoring and leather feel"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-semibold mb-1">Your Detailed Experience</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the fabric weight, fit, stitching, and feel..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
}
