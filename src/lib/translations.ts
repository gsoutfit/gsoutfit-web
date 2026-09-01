export type TranslationKey = keyof typeof translations;

export const translations = {
  // Navigation & Header
  nav_home: { en: "Home", bn: "হোম" },
  nav_shop: { en: "Shop", bn: "শপ" },
  nav_shop_all: { en: "Shop All", bn: "সব কালেকশন" },
  nav_categories: { en: "Categories", bn: "ক্যাটাগরি" },
  nav_summer_drop: { en: "Summer Drop", bn: "সামার ড্রপ" },
  nav_winter_drop: { en: "Winter Drop", bn: "উইন্টার ড্রপ" },
  nav_flash_sale: { en: "Flash Sale", bn: "ফ্ল্যাশ সেল" },
  nav_sale: { en: "Sale", bn: "সেল" },
  nav_new_arrivals: { en: "New Arrivals", bn: "নতুন এসেছে" },
  nav_search: { en: "Search", bn: "অনুসন্ধান" },
  nav_wishlist: { en: "Wishlist", bn: "উইশলিস্ট" },
  nav_bag: { en: "Bag", bn: "ব্যাগ" },
  nav_cart: { en: "Cart", bn: "কার্ট" },
  nav_account: { en: "Account", bn: "অ্যাকাউন্ট" },
  nav_concierge: { en: "Concierge", bn: "কনসিয়ার্জ" },
  nav_ticker_tagline: {
    en: "VIP Bespoke Tailoring & Luxury Streetwear",
    bn: "ভিআইপি বেসপোক টেইলারিং ও প্রিমিয়াম স্ট্রিটওয়্যার",
  },
  nav_ticker_coupon: {
    en: "Use code SAVAGE20 for 20% OFF",
    bn: "SAVAGE20 কোড ব্যবহারে পাচ্ছেন ২০% ছাড়",
  },
  nav_ticker_delivery: {
    en: "Complimentary Express Delivery on orders ৳1,500+",
    bn: "৳১,৫০০+ অর্ডারে সম্পূর্ণ ফ্রি এক্সপ্রেস ডেলিভারি",
  },

  // Category Names
  cat_all: { en: "All", bn: "সব" },
  cat_new_arrivals: { en: "New Arrivals", bn: "নতুন এসেছে" },
  cat_tshirts: { en: "T-Shirts", bn: "টি-শার্ট" },
  cat_shirts: { en: "Shirts", bn: "শার্ট" },
  cat_pants: { en: "Pants", bn: "প্যান্ট" },
  cat_jeans: { en: "Jeans", bn: "জিন্স" },
  cat_hoodies: { en: "Hoodies", bn: "হুডি" },
  cat_jackets: { en: "Jackets", bn: "জ্যাকেট" },
  cat_formal_wear: { en: "Formal Wear", bn: "ফরমাল ওয়্যার" },
  cat_casual_wear: { en: "Casual Wear", bn: "ক্যাজুয়াল ওয়্যার" },
  cat_streetwear: { en: "Streetwear", bn: "স্ট্রিটওয়্যার" },
  cat_accessories: { en: "Accessories", bn: "অ্যাক্সেসরিজ" },
  cat_summer: { en: "Summer", bn: "সামার" },
  cat_winter: { en: "Winter", bn: "উইন্টার" },
  cat_sale: { en: "Sale", bn: "সেল" },

  // Category Sub-descriptions
  cat_desc_all: {
    en: "Full haute couture catalog & essentials",
    bn: "আমাদের সব এক্সক্লুসিভ কালেকশন",
  },
  cat_desc_new_arrivals: {
    en: "Fresh weekly atelier drops & cuts",
    bn: "এই সপ্তাহের নতুন আগমন ও ড্রপ",
  },
  cat_desc_tshirts: {
    en: "Heavyweight boxy & pima cotton tees",
    bn: "প্রিমিয়াম হেভিওয়েট ও পিমা কটন টি-শার্ট",
  },
  cat_desc_shirts: {
    en: "120s Peruvian Pima & silk camp collars",
    bn: "পেরুভিয়ান পিমা ও সিল্ক শার্ট",
  },
  cat_desc_pants: {
    en: "Pleated wool trousers & ripstop cargos",
    bn: "প্লিটেড উলের ট্রাউজার ও কার্গো প্যান্ট",
  },
  cat_desc_jeans: {
    en: "14.5oz Japanese selvedge raw denim",
    bn: "১৪.৫ আউন্স জাপানিজ সেলভেজ র ডেনিম",
  },
  cat_desc_hoodies: {
    en: "520gsm heavy French terry pullovers",
    bn: "৫২০ জিএসএম হেভি ফ্রেঞ্চ টেরি হুডি",
  },
  cat_desc_jackets: {
    en: "Full-grain calfskin leathers & overcoats",
    bn: "ফুল গ্রেইন লেদার জ্যাকেট ও ওভারকোট",
  },
  cat_desc_accessories: {
    en: "Goodyear-welt boots & weekender bags",
    bn: "লেদার বুট, ট্রাভেল ব্যাগ ও অ্যাক্সেসরিজ",
  },
  cat_desc_summer: {
    en: "Resort knits & airy linens",
    bn: "হালকা লিনেন ও সামার রিসোর্ট কালেকশন",
  },
  cat_desc_winter: {
    en: "Heavy cashmere & overcoats",
    bn: "কাশ্মীরি উল ও শীতকালীন ভারী ওভারকোট",
  },
  cat_desc_sale: {
    en: "Limited time vault markdowns",
    bn: "সীমিত সময়ের বিশেষ ছাড়ের সুযোগ",
  },

  // Product Card & Catalog Actions
  product_add_to_cart: { en: "Add to Bag", bn: "ব্যাগে যোগ করুন" },
  product_buy_now: { en: "Buy Now", bn: "এখনই কিনুন" },
  product_quick_view: { en: "Quick View", bn: "এক ঝলকে দেখুন" },
  product_select_size: { en: "Select Size", bn: "সাইজ নির্বাচন করুন" },
  product_select_color: { en: "Select Color", bn: "কালার নির্বাচন করুন" },
  product_size: { en: "Size", bn: "সাইজ" },
  product_color: { en: "Color", bn: "কালার" },
  product_quantity: { en: "Quantity", bn: "পরিমাণ" },
  product_price: { en: "Price", bn: "মূল্য" },
  product_discount: { en: "Discount", bn: "ছাড়" },
  product_in_stock: { en: "In Stock", bn: "স্টকে আছে" },
  product_out_of_stock: { en: "Out of Stock", bn: "স্টক শেষ" },
  product_pieces_available: { en: "pieces available", bn: "টি অবশিষ্ট আছে" },
  product_fabric_care: { en: "Fabric & Care", bn: "ফেব্রিক ও যত্নবিধি" },
  product_fit_details: { en: "Fit & Sizing", bn: "ফিটিং ও মাপের বিবরণ" },
  product_size_guide: { en: "Size Guide", bn: "সাইজ গাইড" },
  product_reviews: { en: "Reviews", bn: "রিভিউ" },
  product_customer_reviews: { en: "Customer Reviews", bn: "গ্রাহক পর্যালোচনা" },
  product_write_review: { en: "Write a Review", bn: "রিভিউ লিখুন" },
  product_view_details: { en: "View Details", bn: "বিস্তারিত দেখুন" },
  product_pieces_from: { en: "Pieces From", bn: "শুরু" },

  // Filters & Sorting
  filter_by: { en: "Filter By", bn: "ফিল্টার করুন" },
  filter_active: { en: "Active Filters", bn: "সক্রিয় ফিল্টার" },
  filter_clear_all: { en: "Clear All Filters", bn: "সব ফিল্টার মুছুন" },
  filter_category: { en: "Category", bn: "ক্যাটাগরি" },
  filter_season: { en: "Season", bn: "সিজন" },
  filter_max_price: { en: "Max Price", bn: "সর্বোচ্চ মূল্য" },
  filter_price_range: { en: "Price Range", bn: "মূল্যের সীমা" },
  filter_search: { en: "Keyword", bn: "অনুসন্ধান" },
  filter_in_stock_only: { en: "In Stock Only", bn: "শুধু স্টকে থাকা পণ্য" },
  filter_flash_sale_only: { en: "Flash Sale Only", bn: "শুধু ফ্ল্যাশ সেল" },
  filter_quick_presets: { en: "Quick Filters", bn: "কুইক ফিল্টার" },
  filter_preset_bestsellers: { en: "Bestsellers", bn: "সর্বাধিক বিক্রিত" },
  filter_preset_new_drops: { en: "New Drops", bn: "নতুন আগমন" },
  filter_preset_flash_sale: { en: "Flash Deals", bn: "ফ্ল্যাশ ডিল" },
  filter_preset_under_1500: { en: "Under ৳1,500", bn: "৳১,৫০০ এর নিচে" },
  filter_copy_link: { en: "Share View", bn: "লিঙ্ক কপি" },
  filter_link_copied: { en: "Custom filter view copied to clipboard", bn: "ফিল্টার ভিউ লিঙ্ক ক্লিপবোর্ডে কপি হয়েছে" },
  sort_by: { en: "Sort By", bn: "সাজান" },
  sort_trending: { en: "Trending Drops", bn: "জনপ্রিয় কালেকশন" },
  sort_newest: { en: "Newest Arrivals", bn: "নতুন আগমন" },
  sort_price_low: { en: "Price: Low → High", bn: "মূল্য: কম থেকে বেশি" },
  sort_price_high: { en: "Price: High → Low", bn: "মূল্য: বেশি থেকে কম" },
  sort_rating: { en: "Highest Rated", bn: "সর্বোচ্চ রেটিং" },
  search_placeholder: {
    en: "Search garments, fabrics, cuts...",
    bn: "পোশাক, ফেব্রিক বা স্টাইল খুঁজুন...",
  },

  // Cart & Drawer
  cart_title: { en: "Shopping Bag", bn: "শপিং ব্যাগ" },
  cart_empty: { en: "Your shopping bag is empty", bn: "আপনার ব্যাগটি বর্তমানে খালি" },
  cart_empty_desc: {
    en: "Explore our haute tailoring and bespoke collections to curate your wardrobe.",
    bn: "আমাদের নতুন লাক্সারি কালেকশনগুলো ঘুরে দেখে আপনার পছন্দের পোশাক নির্বাচন করুন।",
  },
  cart_continue_shopping: { en: "Continue Shopping", bn: "কেনাকাটা চালিয়ে যান" },
  cart_subtotal: { en: "Subtotal", bn: "মোট মূল্য" },
  cart_shipping_note: {
    en: "Shipping and taxes calculated at checkout",
    bn: "ডেলিভারি চার্জ ও ভ্যাট চেকআউটের সময় যোগ হবে",
  },
  cart_checkout_btn: { en: "Proceed to Checkout", bn: "চেকআউটে যান" },
  cart_view_bag: { en: "View Shopping Bag", bn: "শপিং ব্যাগ দেখুন" },
  cart_free_delivery_progress: {
    en: "Add {amount} more to unlock FREE Delivery",
    bn: "ফ্রি ডেলিভারির জন্য আরও {amount} যোগ করুন",
  },
  cart_free_delivery_unlocked: {
    en: "You have unlocked COMPLIMENTARY Express Delivery!",
    bn: "আপনি সম্পূর্ণ ফ্রি এক্সপ্রেস ডেলিভারি সুবিধা পেয়ে গেছেন!",
  },
  cart_remove: { en: "Remove", bn: "মুছে ফেলুন" },

  // Checkout Page
  checkout_title: { en: "VIP Checkout", bn: "চেকআউট" },
  checkout_contact: { en: "Contact Information", bn: "যোগাযোগের তথ্য" },
  checkout_full_name: { en: "Full Name", bn: "পূর্ণ নাম" },
  checkout_full_name_ph: { en: "e.g. Julian Sterling", bn: "যেমন: মো: আরিফুল ইসলাম" },
  checkout_email: { en: "Email Address", bn: "ইমেইল ঠিকানা" },
  checkout_email_ph: { en: "e.g. name@domain.com", bn: "যেমন: name@domain.com" },
  checkout_phone: { en: "Mobile Phone Number", bn: "মোবাইল নম্বর" },
  checkout_phone_ph: { en: "e.g. +880 1700-123456", bn: "যেমন: 017XXXXXXXX" },
  checkout_address: { en: "Delivery Address", bn: "ডেলিভারি ঠিকানা" },
  checkout_street: {
    en: "Street Address, House/Flat No, Area",
    bn: "রাস্তা, বাড়ি/ফ্ল্যাট নম্বর, এলাকা",
  },
  checkout_street_ph: {
    en: "e.g. House 42, Road 11, Block D, Banani",
    bn: "যেমন: বাসা ৪২, রোড ১১, ব্লক ডি, বনানী",
  },
  checkout_city: { en: "City / Division", bn: "শহর / বিভাগ" },
  checkout_city_ph: { en: "e.g. Dhaka", bn: "যেমন: ঢাকা" },
  checkout_state: { en: "District / Thana", bn: "জেলা / থানা" },
  checkout_state_ph: { en: "e.g. Banani, Dhaka", bn: "যেমন: গুলশান, ঢাকা" },
  checkout_zip: { en: "Postal Code", bn: "পোস্টাল কোড" },
  checkout_zip_ph: { en: "e.g. 1213", bn: "যেমন: ১২১৩" },

  // Payment Options
  checkout_payment_method: { en: "Payment Method", bn: "পেমেন্ট পদ্ধতি" },
  checkout_cod_title: { en: "Cash on Delivery", bn: "ক্যাশ অন ডেলিভারি (COD)" },
  checkout_cod_subtitle: {
    en: "Pay with exact cash directly to the courier upon doorstep delivery.",
    bn: "পণ্য হাতে পাওয়ার পর কুরিয়ারের কাছে সরাসরি নগদ টাকা পরিশোধ করুন।",
  },
  checkout_bkash_title: { en: "bKash Mobile Payment", bn: "বিকাশ পেমেন্ট" },
  checkout_bkash_subtitle: {
    en: "Send payment via bKash App or *247# to our official merchant account.",
    bn: "বিকাশ অ্যাপ অথবা *২৪৭# ডায়াল করে আমাদের নম্বরে পেমেন্ট করুন।",
  },
  checkout_nagad_title: { en: "Nagad Mobile Payment", bn: "নগদ পেমেন্ট" },
  checkout_nagad_subtitle: {
    en: "Send payment via Nagad App or *167# to our official merchant account.",
    bn: "নগদ অ্যাপ অথবা *১৬৭# ডায়াল করে আমাদের নম্বরে পেমেন্ট করুন।",
  },
  checkout_merchant_account: { en: "Merchant Account Number", bn: "মার্চেন্ট একাউন্ট নম্বর" },
  checkout_sender_number: { en: "Your Sender Mobile Number", bn: "যে নম্বর থেকে টাকা পাঠিয়েছেন" },
  checkout_sender_number_ph: { en: "e.g. 01700-000000", bn: "যেমন: 017XXXXXXXX" },
  checkout_trxid: { en: "Transaction ID (TrxID)", bn: "ট্রানজ্যাকশন আইডি (TrxID)" },
  checkout_trxid_ph: { en: "e.g. 9LA8X199BZ", bn: "যেমন: 9LA8X199BZ" },
  checkout_copy_number: { en: "Copy Number", bn: "নম্বর কপি করুন" },
  checkout_copied: { en: "Copied!", bn: "কপি হয়েছে!" },

  // Order Summary & Costs
  checkout_summary_title: { en: "Order Summary", bn: "অর্ডারের বিবরণ" },
  checkout_subtotal: { en: "Items Subtotal", bn: "পণ্যের মোট মূল্য" },
  checkout_voucher: { en: "Promotional Voucher", bn: "প্রোমো কুপন" },
  checkout_voucher_ph: { en: "Promo code (e.g. SAVAGE20)", bn: "কুপন কোড (যেমন SAVAGE20)" },
  checkout_apply: { en: "Apply", bn: "প্রয়োগ করুন" },
  checkout_shipping_fee: { en: "Delivery Fee", bn: "ডেলিভারি চার্জ" },
  checkout_free: { en: "FREE", bn: "ফ্রি" },
  checkout_tax: { en: "Estimated Tax (5%)", bn: "ভ্যাট ও ট্যাক্স (৫%)" },
  checkout_total: { en: "Total Amount Due", bn: "সর্বমোট প্রদেয় মূল্য" },
  checkout_place_order: { en: "Confirm & Place Order", bn: "অর্ডার নিশ্চিত করুন" },
  checkout_processing: { en: "Processing Order...", bn: "অর্ডার প্রসেস হচ্ছে..." },

  // Order Confirmation & Success
  order_success_badge: { en: "Order Confirmed", bn: "অর্ডার নিশ্চিত হয়েছে" },
  order_success_title: {
    en: "Your Bespoke Order is Placed",
    bn: "আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে",
  },
  order_success_desc: {
    en: "Thank you for acquiring tailored luxury with Gentleman Savage. We have dispatched your digital invoice and courier tracking details to your email.",
    bn: "Gentleman Savage থেকে কেনাকাটা করার জন্য আপনাকে ধন্যবাদ। আপনার অর্ডারের ডিজিটাল ইনভয়েস ও ট্র্যাকিং তথ্য ইমেইলে পাঠিয়ে দেওয়া হয়েছে।",
  },
  order_number: { en: "Order Number", bn: "অর্ডার নম্বর" },
  order_tracking_number: { en: "Courier Tracking ID", bn: "কুরিয়ার ট্র্যাকিং নম্বর" },
  order_payment_type: { en: "Payment Method", bn: "পেমেন্ট পদ্ধতি" },
  order_delivery_to: { en: "Delivering To", bn: "ডেলিভারি ঠিকানা" },
  order_timeline_pending: {
    en: "Order received and queued for atelier preparation.",
    bn: "অর্ডারটি গ্রহণ করা হয়েছে এবং প্যাকেজিংয়ের প্রস্তুতি চলছে।",
  },
  order_track_btn: { en: "Track in Account Dossier", bn: "অ্যাকাউন্টে অর্ডার দেখুন" },
  order_continue_btn: { en: "Continue Exploring Collection", bn: "আরও কালেকশন দেখুন" },

  // Order Statuses
  status_pending: { en: "Pending", bn: "পেন্ডিং" },
  status_processing: { en: "Processing", bn: "প্রসেসিং" },
  status_shipped: { en: "Shipped", bn: "কুরিয়ারে পাঠানো হয়েছে" },
  status_delivered: { en: "Delivered", bn: "ডেলিভারি সম্পন্ন" },
  status_cancelled: { en: "Cancelled", bn: "বাতিল করা হয়েছে" },

  // Account Page
  account_profile: { en: "Account Dossier", bn: "অ্যাকাউন্ট প্রোফাইল" },
  account_order_history: { en: "Order History", bn: "অর্ডার হিস্ট্রি" },
  account_wishlist: { en: "Wishlist Favorites", bn: "পছন্দের তালিকা" },
  account_sign_out: { en: "Sign Out", bn: "লগআউট" },
  account_no_orders: { en: "No Orders Placed Yet", bn: "এখনো কোনো অর্ডার করা হয়নি" },

  // Footer
  footer_complimentary_shipping: {
    en: "Complimentary VIP Shipping",
    bn: "ফ্রি ভিআইপি ডেলিভারি",
  },
  footer_shipping_desc: {
    en: "Free express door-to-door delivery on all orders exceeding ৳1,500.",
    bn: "৳১,৫০০ টাকার বেশি যেকোনো অর্ডারে পাচ্ছেন সম্পূর্ণ ফ্রি হোম ডেলিভারি।",
  },
  footer_exchange_title: { en: "30-Day Bespoke Exchanges", bn: "৩০ দিনের সহজ এক্সচেঞ্জ" },
  footer_exchange_desc: {
    en: "Seamless size exchanges & concierge return support with zero hassle.",
    bn: "সহজ সাইজ এক্সচেঞ্জ ও কাস্টমার কেয়ার সহায়তা।",
  },
  footer_craftsmanship_title: {
    en: "Mastercrafted Quality",
    bn: "অতুলনীয় কারুকার্য ও মান",
  },
  footer_craftsmanship_desc: {
    en: "Full-grain Italian leathers, Japanese selvedge denim & 520gsm terry.",
    bn: "ইতালিয়ান লেদার, জাপানিজ সেলভেজ ডেনিম ও ৫২০ জিএসএম কটন ফেব্রিক।",
  },
  footer_payment_title: {
    en: "Direct Verified Payments",
    bn: "নিরাপদ ও নির্ভরযোগ্য পেমেন্ট",
  },
  footer_payment_desc: {
    en: "Doorstep Cash on Delivery, bKash & Nagad instant merchant settlement.",
    bn: "ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ-এর মাধ্যমে সহজ ও নিরাপদ পেমেন্ট।",
  },
  footer_brand_desc: {
    en: "Gentleman Savage fuses timeless bespoke tailoring with the raw, rebellious energy of contemporary luxury streetwear. Mastercrafted in limited quantities for the uncompromising individual.",
    bn: "Gentleman Savage ক্লাসিক টেইলারিং ও আধুনিক বিলাসবহুল স্ট্রিটওয়্যারের এক অনন্য সংমিশ্রণ। আধুনিক রুচিশীল ব্যক্তিত্বের জন্য সীমিত সংস্করণে প্রস্তুতকৃত।",
  },
  footer_newsletter_title: {
    en: "Join The Savage Inner Circle",
    bn: "আমাদের এক্সক্লুসিভ ক্লাবের সদস্য হোন",
  },
  footer_newsletter_desc: {
    en: "Receive private invitations to confidential vault drops, runway showcases, and bespoke atelier appointments.",
    bn: "নতুন কালেকশন ড্রপ ও বিশেষ অফার পেতে আপনার ইমেইল দিয়ে যুক্ত থাকুন।",
  },
  footer_subscribe: { en: "Subscribe", bn: "সাবস্ক্রাইব" },
  footer_rights: {
    en: "All Rights Reserved. Luxury menswear atelier.",
    bn: "সর্বস্বত্ব সংরক্ষিত। লাক্সারি মেনসওয়্যার কালেকশন।",
  },
};

/**
 * Helper to get translated category name with fallback.
 */
export function getCategoryDisplayName(name: string, lang: "en" | "bn"): string {
  if (lang === "en") return name;
  const key = `cat_${name.toLowerCase().replace(/[\s-]+/g, "_")}` as TranslationKey;
  if (translations[key]) {
    return translations[key].bn;
  }
  return name;
}
