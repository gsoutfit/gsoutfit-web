export type Language = "en" | "bn";

export type UserRole = "admin" | "customer";

export interface Address {
  id: string;
  isDefault?: boolean;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  addresses?: Address[];
  twoFactorEnabled?: boolean;
  isVerified?: boolean;
  verificationCode?: string;
  verificationExpiresAt?: string;
  createdAt: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  tagline: string;
  taglineBn?: string;
  description: string;
  descriptionBn?: string;
  fabricCare?: string;
  fabricCareBn?: string;
  fitDetails?: string;
  fitDetailsBn?: string;
  price: number;
  discountPrice?: number;
  category: string;
  season: "Summer Collection" | "Winter Collection" | "All-Season";
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  stockPerSize?: Record<string, number>;
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
  flashSaleDiscount?: number;
  views?: number;
  cartAdds?: number;
  wishlistCount?: number;
  salesCount?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  type: "Clothing" | "Season" | "Collection";
  description: string;
  descriptionBn?: string;
  image: string;
  itemCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount?: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cod" | "bkash" | "nagad";

export interface OrderPaymentDetails {
  senderNumber?: string;
  transactionId?: string;
  paymentNumber?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  description: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingAddress?: Address;
  items: OrderItem[];

  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  shippingMethod: string;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: OrderPaymentDetails;

  status: OrderStatus;
  trackingNumber?: string;
  timeline: OrderTimeline[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageCount: number;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  user: string;
  ip: string;
  timestamp: string;
}

export interface LoginHistory {
  id: string;
  email: string;
  role: string;
  ip: string;
  userAgent: string;
  status: "Success" | "Failed";
  timestamp: string;
}

export interface MailLog {
  id: string;
  to: string;
  subject: string;
  previewText: string;
  html: string;
  otpCode?: string;
  status: "Sent (SMTP)" | "Sent (Dev Preview)" | "Failed";
  type: "verification" | "order" | "notification" | "test";
  sentAt: string;
  error?: string;
}

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

export interface SmtpSettings {
  enabled: boolean;
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
}

export interface StoreSettings {
  appearance: {
    customThemeEnabled: boolean;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    cardColor: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    logoUrl?: string;
    faviconUrl?: string;
    tagline?: string;
  };
  store: {
    storeName: string;
    currency: {
      code: string;
      symbol: string;
    };
    contactEmail: string;
    contactPhone: string;
    status: "open" | "maintenance";
  };
  products: {
    lowStockThreshold: number;
    itemsPerPage: number;
  };
  orders: {
    freeShippingThreshold: number;
    standardShippingFee: number;
  };
  marketing: {
    flashSaleActive: boolean;
    flashSaleDiscount: number;
    flashSaleEndsAt: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeoutMinutes: number;
    adminRegistrationAllowed?: boolean;
    adminSecretKey?: string;
  };
  smtp?: SmtpSettings;
}

export interface AnalyticsDataPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
  itemsSold: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  productsSold: number;
  salesGrowth: number;
  period: "7d" | "30d" | "3m" | "6m" | "1y";
  trajectory: AnalyticsDataPoint[];
  ordersByStatus: Record<OrderStatus, number>;
  lowStockProducts: Product[];
  categoryStats: Record<string, number>;
  recentOrders: Order[];
  topSellingProducts: Product[];
}
