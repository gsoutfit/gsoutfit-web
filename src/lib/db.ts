import fs from "fs/promises";
import path from "path";
import {
  Product,
  Category,
  User,
  Order,
  Coupon,
  Review,
  ActivityLog,
  LoginHistory,
  StoreSettings,
  AnalyticsSummary,
  AnalyticsDataPoint,
  OrderStatus,
  MailLog,
} from "@/types";
import { hashPassword } from "./auth";
import * as ordersDb from "./orders-db";

export const DEFAULT_SETTINGS: StoreSettings = {
  appearance: {
    customThemeEnabled: false,
    primaryColor: "#D4AF37",
    secondaryColor: "#E5C365",
    accentColor: "#C5A880",
    backgroundColor: "#0B0B0C",
    cardColor: "#141418",
    textColor: "#FAF8F5",
    buttonColor: "#D4AF37",
    buttonTextColor: "#000000",
    logoUrl: "",
    faviconUrl: "",
    tagline: "Sophisticated Tailoring Meets Raw Luxury Streetwear",
  },
  store: {
    storeName: "Gentleman Savage",
    currency: {
      code: "BDT",
      symbol: "৳",
    },
    contactEmail: "concierge@gentlemansavage.com",
    contactPhone: "+880 1700-123456",
    status: "open",
  },
  products: {
    lowStockThreshold: 10,
    itemsPerPage: 12,
  },
  orders: {
    freeShippingThreshold: 1500,
    standardShippingFee: 120,
  },
  marketing: {
    flashSaleActive: true,
    flashSaleDiscount: 20,
    flashSaleEndsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  },
  security: {
    twoFactorEnabled: true,
    sessionTimeoutMinutes: 120,
    adminRegistrationAllowed: true,
  },
  smtp: {
    enabled: false,
    host: "smtp.gmail.com",
    port: 587,
    user: "",
    pass: "",
    from: "Gentlemen Savage Concierge <concierge@gentlemensavage.com>",
    secure: false,
  },
};

interface DatabaseSchema {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
  users: User[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  activityLogs: ActivityLog[];
  loginHistory: LoginHistory[];
  mailLogs: MailLog[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");
let memoryDb: DatabaseSchema | null = null;

export async function getDb(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);

    // Ensure settings object exists
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS;
    }
    if (!parsed.mailLogs) {
      parsed.mailLogs = [];
    }


    // Ensure initial admin has hashed password
    const adminUser = parsed.users.find(
      (u: User) =>
        u.email === "admin@gentlemensavage.com" ||
        u.email === "admin@gentleman-savage.com" ||
        u.email === "admin@gentlemansavage.com"
    );
    if (adminUser && (!adminUser.passwordHash || adminUser.password === "admin123")) {
      const { hash, salt } = hashPassword("GS_Admin@2026!");
      adminUser.passwordHash = hash;
      adminUser.passwordSalt = salt;
      delete adminUser.password;
      adminUser.email = "admin@gentlemensavage.com";
      await fs.writeFile(DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
    }

    memoryDb = parsed;
    return memoryDb as DatabaseSchema;
  } catch (error) {
    if (memoryDb) return memoryDb;
    console.error("Error reading database file:", error);
    throw new Error("Could not read database file.");
  }
}

export async function saveDb(data: DatabaseSchema): Promise<void> {
  memoryDb = data;
  try {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving database file:", error);
  }
}

// ================= SETTINGS METHODS =================
export async function getSettings(): Promise<StoreSettings> {
  const db = await getDb();
  return db.settings || DEFAULT_SETTINGS;
}

export async function updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const db = await getDb();
  db.settings = {
    ...db.settings,
    ...updates,
    appearance: {
      ...db.settings.appearance,
      ...(updates.appearance || {}),
    },
    store: {
      ...db.settings.store,
      ...(updates.store || {}),
    },
    products: {
      ...db.settings.products,
      ...(updates.products || {}),
    },
    orders: {
      ...db.settings.orders,
      ...(updates.orders || {}),
    },
    marketing: {
      ...db.settings.marketing,
      ...(updates.marketing || {}),
    },
    security: {
      ...db.settings.security,
      ...(updates.security || {}),
    },
  };
  await saveDb(db);
  await logActivity("SETTINGS_UPDATED", "Store configuration updated by Admin", "Admin");
  return db.settings;
}

export async function resetThemeSettings(): Promise<StoreSettings> {
  const db = await getDb();
  db.settings.appearance = { ...DEFAULT_SETTINGS.appearance };
  await saveDb(db);
  await logActivity("THEME_RESET", "Appearance settings reset to default Gentlemen Savage theme", "Admin");
  return db.settings;
}

// ================= PRODUCT METHODS =================
export function calculateTrendingScore(p: Product): number {
  const views = p.views || 0;
  const cartAdds = p.cartAdds || 0;
  const wishlistCount = p.wishlistCount || 0;
  const salesCount = p.salesCount || 0;
  const manualBoost = p.isTrending ? 50 : 0;
  return salesCount * 10 + cartAdds * 5 + wishlistCount * 3 + views * 1 + manualBoost;
}

export async function getProducts(options?: {
  category?: string;
  season?: string;
  featured?: boolean;
  trending?: boolean;
  flashSale?: boolean;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
}): Promise<Product[]> {
  const db = await getDb();
  let products = [...db.products];

  if (options?.category && options.category !== "All") {
    products = products.filter(
      (p) => p.category.toLowerCase() === options.category!.toLowerCase()
    );
  }

  if (options?.season && options.season !== "All") {
    products = products.filter(
      (p) => p.season.toLowerCase() === options.season!.toLowerCase()
    );
  }

  if (options?.featured) {
    products = products.filter((p) => p.isFeatured);
  }

  if (options?.flashSale) {
    products = products.filter((p) => p.isFlashSale);
  }

  if (options?.minPrice !== undefined) {
    products = products.filter(
      (p) => (p.discountPrice || p.price) >= options.minPrice!
    );
  }

  if (options?.maxPrice !== undefined) {
    products = products.filter(
      (p) => (p.discountPrice || p.price) <= options.maxPrice!
    );
  }

  if (options?.size) {
    products = products.filter((p) =>
      p.sizes.some((s) => s.toLowerCase().includes(options.size!.toLowerCase()))
    );
  }

  if (options?.color) {
    products = products.filter((p) =>
      p.colors.some((c) =>
        c.name.toLowerCase().includes(options.color!.toLowerCase())
      )
    );
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.season.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (options?.trending) {
    // Dynamic trending calculation: sort by real interaction score
    products.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
  } else if (options?.sort) {
    switch (options.sort) {
      case "price-low":
        products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case "price-high":
        products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        products.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "trending":
      default:
        products.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
        break;
    }
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = await getDb();
  return db.products.find((p) => p.id === id || p.slug === id) || null;
}

export async function trackProductActivity(
  productId: string,
  action: "view" | "cart_add" | "wishlist"
): Promise<boolean> {
  const db = await getDb();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return false;

  if (action === "view") {
    product.views = (product.views || 0) + 1;
  } else if (action === "cart_add") {
    product.cartAdds = (product.cartAdds || 0) + 1;
  } else if (action === "wishlist") {
    product.wishlistCount = (product.wishlistCount || 0) + 1;
  }

  await saveDb(db);
  return true;
}

export async function createProduct(productData: Omit<Product, "id" | "createdAt">): Promise<Product> {
  const db = await getDb();
  const newProduct: Product = {
    ...productData,
    id: `gs-prod-${Date.now()}`,
    views: 0,
    cartAdds: 0,
    wishlistCount: 0,
    salesCount: 0,
    createdAt: new Date().toISOString(),
  };
  db.products.unshift(newProduct);
  await saveDb(db);
  await logActivity("PRODUCT_CREATED", `Added product: ${newProduct.name}`, "Admin");
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const db = await getDb();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.products[index] = { ...db.products[index], ...updates };
  await saveDb(db);
  await logActivity("PRODUCT_UPDATED", `Updated product: ${db.products[index].name}`, "Admin");
  return db.products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getDb();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return false;

  const deleted = db.products.splice(index, 1)[0];
  await saveDb(db);
  await logActivity("PRODUCT_DELETED", `Deleted product: ${deleted.name}`, "Admin");
  return true;
}

// ================= CATEGORY METHODS =================
export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.categories;
}

export async function createCategory(cat: Omit<Category, "id">): Promise<Category> {
  const db = await getDb();
  const newCat: Category = {
    ...cat,
    id: `cat-${Date.now()}`,
  };
  db.categories.push(newCat);
  await saveDb(db);
  await logActivity("CATEGORY_CREATED", `Created category: ${newCat.name}`, "Admin");
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const db = await getDb();
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.categories[index] = { ...db.categories[index], ...updates };
  await saveDb(db);
  await logActivity("CATEGORY_UPDATED", `Updated category: ${db.categories[index].name}`, "Admin");
  return db.categories[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = await getDb();
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) return false;

  const deleted = db.categories.splice(index, 1)[0];
  await saveDb(db);
  await logActivity("CATEGORY_DELETED", `Deleted category: ${deleted.name}`, "Admin");
  return true;
}

// ================= ORDER METHODS =================
export async function getOrders(userId?: string): Promise<Order[]> {
  // Orders are persisted in Postgres (not the JSON file) because Vercel's
  // serverless filesystem is read-only in production.
  return ordersDb.getOrders(userId);
}

export async function getOrderById(id: string): Promise<Order | null> {
  return ordersDb.getOrderById(id);
}

export async function createOrder(orderData: Omit<Order, "id" | "createdAt">): Promise<Order> {
  const db = await getDb();
  const newOrder: Order = {
    ...orderData,
    id: `order-gs-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
  };

  // Decrement stock and increment salesCount for each purchased item
  for (const item of newOrder.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      product.salesCount = (product.salesCount || 0) + item.quantity;
      if (product.stockPerSize && product.stockPerSize[item.size] !== undefined) {
        product.stockPerSize[item.size] = Math.max(0, product.stockPerSize[item.size] - item.quantity);
      }
    }
  }

  // Increment coupon usage count if used
  if (newOrder.couponCode) {
    const coupon = db.coupons.find(
      (c) => c.code.toUpperCase() === newOrder.couponCode!.toUpperCase()
    );
    if (coupon) {
      coupon.usageCount = (coupon.usageCount || 0) + 1;
    }
  }

  await saveDb(db);
  await ordersDb.insertOrder(newOrder);
  await logActivity(
    "ORDER_PLACED",
    `New order #${newOrder.orderNumber} placed for ৳${newOrder.total.toFixed(2)}`,
    newOrder.customer.name
  );
  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  trackingNumber?: string,
  note?: string
): Promise<Order | null> {
  const order = await ordersDb.updateOrderStatusInDb(id, status, trackingNumber, note);
  if (!order) return null;

  await logActivity("ORDER_STATUS_UPDATE", `Order #${order.orderNumber} changed to ${status}`, "Admin");
  return order;
}

// ================= COUPON METHODS =================
export async function getCoupons(): Promise<Coupon[]> {
  const db = await getDb();
  return db.coupons;
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message: string }> {
  const db = await getDb();
  const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);

  if (!coupon) {
    return { valid: false, discount: 0, message: "Invalid or inactive coupon code." };
  }

  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, discount: 0, message: "Coupon code has expired." };
  }

  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount of $${coupon.minSpend} required for this code.`,
    };
  }


  let discount = 0;
  if (coupon.discountPercent) {
    discount = (subtotal * coupon.discountPercent) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountAmount) {
    discount = coupon.discountAmount;
  }

  return {
    valid: true,
    coupon,
    discount: Math.min(discount, subtotal),
    message: `Coupon ${coupon.code} applied successfully!`,
  };
}

export async function createCoupon(couponData: Omit<Coupon, "id" | "usageCount">): Promise<Coupon> {
  const db = await getDb();
  const newCoupon: Coupon = {
    ...couponData,
    id: `coup-${Date.now()}`,
    usageCount: 0,
  };
  db.coupons.push(newCoupon);
  await saveDb(db);
  await logActivity("COUPON_CREATED", `Created coupon: ${newCoupon.code}`, "Admin");
  return newCoupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const db = await getDb();
  const index = db.coupons.findIndex((c) => c.id === id);
  if (index === -1) return false;

  const deleted = db.coupons.splice(index, 1)[0];
  await saveDb(db);
  await logActivity("COUPON_DELETED", `Deleted coupon: ${deleted.code}`, "Admin");
  return true;
}

// ================= USER & AUTH METHODS =================
export async function getUsers(): Promise<User[]> {
  const db = await getDb();
  return db.users.map((u) => {
    const { passwordHash, passwordSalt, ...rest } = u;
    return rest as User;
  });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const clean = email.toLowerCase().trim();
  return (
    db.users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (clean.includes("admin@gentlemen") && u.role === "admin") ||
        (clean === "resol@gentlemensavage.com" && u.role === "admin")
    ) || null
  );
}

export async function findUserByEmailOrUsername(identifier: string): Promise<User | null> {
  const db = await getDb();
  const clean = identifier.toLowerCase().trim();
  return (
    db.users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (u.username && u.username.toLowerCase() === clean) ||
        (clean === "resol" && (u.username?.toLowerCase() === "resol" || u.role === "admin")) ||
        (clean.includes("admin@gentlemen") && u.role === "admin") ||
        (clean.includes("resol@") && u.role === "admin")
    ) || null
  );
}

export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  const db = await getDb();
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  await saveDb(db);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = await getDb();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  db.users[index] = { ...db.users[index], ...updates };
  await saveDb(db);
  const { passwordHash, passwordSalt, ...safeUser } = db.users[index];
  return safeUser as User;
}

export async function setVerificationCode(
  emailOrUsername: string,
  code: string,
  expiresAt: string
): Promise<boolean> {
  const db = await getDb();
  const clean = emailOrUsername.toLowerCase().trim();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (u.username && u.username.toLowerCase() === clean) ||
      (clean === "resol" && (u.username?.toLowerCase() === "resol" || u.role === "admin"))
  );
  if (!user) return false;

  user.verificationCode = code;
  user.verificationExpiresAt = expiresAt;
  await saveDb(db);
  return true;
}

export async function verifyUserCode(
  emailOrUsername: string,
  code: string
): Promise<{ success: boolean; user?: User; message: string }> {
  const db = await getDb();
  const clean = emailOrUsername.toLowerCase().trim();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (u.username && u.username.toLowerCase() === clean) ||
      (clean === "resol" && (u.username?.toLowerCase() === "resol" || u.role === "admin"))
  );

  if (!user) {
    return { success: false, message: "User account not found." };
  }

  if (user.verificationCode !== code.trim()) {
    return { success: false, message: "Invalid verification code. Please check and try again." };
  }

  if (user.verificationExpiresAt && new Date(user.verificationExpiresAt) < new Date()) {
    return { success: false, message: "Verification code has expired. Please request a new code." };
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationExpiresAt = undefined;
  await saveDb(db);
  await logActivity("USER_VERIFIED", `Admin account ${user.username || user.name} verified successfully`, user.name);

  const { passwordHash: _, passwordSalt: __, ...safeUser } = user;
  return { success: true, user: safeUser as User, message: "Verification successful!" };
}

export async function updateAdminPassword(userId: string, newPasswordPlain: string): Promise<boolean> {
  const db = await getDb();
  const admin = db.users.find((u) => u.id === userId && u.role === "admin");
  if (!admin) return false;

  const { hash, salt } = hashPassword(newPasswordPlain);
  admin.passwordHash = hash;
  admin.passwordSalt = salt;
  await saveDb(db);
  await logActivity("PASSWORD_CHANGED", "Admin password successfully updated", admin.name);
  return true;
}

// ================= MAIL LOGS METHODS =================
export async function getMailLogs(): Promise<MailLog[]> {
  const db = await getDb();
  return db.mailLogs || [];
}

export async function addMailLog(logData: Omit<MailLog, "id" | "sentAt">): Promise<MailLog> {
  const db = await getDb();
  db.mailLogs = db.mailLogs || [];
  const newLog: MailLog = {
    ...logData,
    id: `mail-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    sentAt: new Date().toISOString(),
  };
  // Prepend to mailLogs, keeping last 100 entries
  db.mailLogs.unshift(newLog);
  if (db.mailLogs.length > 100) {
    db.mailLogs = db.mailLogs.slice(0, 100);
  }
  await saveDb(db);
  return newLog;
}

export async function clearMailLogs(): Promise<boolean> {
  const db = await getDb();
  db.mailLogs = [];
  await saveDb(db);
  return true;
}


// ================= REVIEWS =================
export async function getReviews(productId?: string): Promise<Review[]> {
  const db = await getDb();
  if (productId) {
    return db.reviews.filter((r) => r.productId === productId);
  }
  return db.reviews;
}

export async function addReview(reviewData: Omit<Review, "id" | "date">): Promise<Review> {
  const db = await getDb();
  const newReview: Review = {
    ...reviewData,
    id: `rev-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
  };
  db.reviews.unshift(newReview);

  const productReviews = db.reviews.filter((r) => r.productId === reviewData.productId);
  const avgRating =
    productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

  const prod = db.products.find((p) => p.id === reviewData.productId);
  if (prod) {
    prod.rating = Number(avgRating.toFixed(1));
    prod.reviewCount = productReviews.length;
  }

  await saveDb(db);
  return newReview;
}

// ================= ACTIVITY & SECURITY LOGS =================
export async function logActivity(action: string, details: string, user = "System", ip = "127.0.0.1"): Promise<void> {
  try {
    const db = await getDb();
    db.activityLogs.unshift({
      id: `log-${Date.now()}`,
      action,
      details,
      user,
      ip,
      timestamp: new Date().toISOString(),
    });
    if (db.activityLogs.length > 100) {
      db.activityLogs = db.activityLogs.slice(0, 100);
    }
    await saveDb(db);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export async function recordLogin(
  email: string,
  role: string,
  status: "Success" | "Failed",
  ip = "127.0.0.1",
  userAgent = "Web Client"
): Promise<void> {
  try {
    const db = await getDb();
    db.loginHistory.unshift({
      id: `lh-${Date.now()}`,
      email,
      role,
      ip,
      userAgent,
      status,
      timestamp: new Date().toISOString(),
    });
    if (db.loginHistory.length > 100) {
      db.loginHistory = db.loginHistory.slice(0, 100);
    }
    await saveDb(db);
  } catch (err) {
    console.error("Failed to record login:", err);
  }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const db = await getDb();
  return db.activityLogs;
}

export async function getLoginHistory(): Promise<LoginHistory[]> {
  const db = await getDb();
  return db.loginHistory;
}

// ================= REAL BUSINESS ANALYTICS =================
export async function getAnalytics(period: "7d" | "30d" | "3m" | "6m" | "1y" = "30d"): Promise<AnalyticsSummary> {
  const db = await getDb();
  const settings = db.settings || DEFAULT_SETTINGS;
  const lowThreshold = settings.products.lowStockThreshold || 10;

  const allOrders = await ordersDb.getOrders();
  const validOrders = allOrders.filter((o) => o.status !== "Cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = validOrders.length;
  const productsSold = validOrders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Real time periods calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOf7Days = now.getTime() - 7 * 24 * 3600 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const todayRevenue = validOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfToday)
    .reduce((sum, o) => sum + o.total, 0);

  const thisWeekRevenue = validOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOf7Days)
    .reduce((sum, o) => sum + o.total, 0);

  const thisMonthRevenue = validOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfMonth)
    .reduce((sum, o) => sum + o.total, 0);

  // Dynamic Trajectory Points calculation based on selected period
  let periodDays = 30;
  if (period === "7d") periodDays = 7;
  else if (period === "30d") periodDays = 30;
  else if (period === "3m") periodDays = 90;
  else if (period === "6m") periodDays = 180;
  else if (period === "1y") periodDays = 365;

  const periodStartTime = now.getTime() - periodDays * 24 * 3600 * 1000;
  const previousPeriodStartTime = periodStartTime - periodDays * 24 * 3600 * 1000;

  const currentPeriodOrders = validOrders.filter(
    (o) => new Date(o.createdAt).getTime() >= periodStartTime
  );
  const previousPeriodOrders = validOrders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= previousPeriodStartTime && t < periodStartTime;
  });

  const currentPeriodRevenue = currentPeriodOrders.reduce((sum, o) => sum + o.total, 0);
  const previousPeriodRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.total, 0);

  let salesGrowth = 0;
  if (previousPeriodRevenue > 0) {
    salesGrowth = Number((((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100).toFixed(1));
  } else if (currentPeriodRevenue > 0) {
    salesGrowth = 100;
  }

  // Generate date buckets for trajectory
  const trajectoryMap = new Map<string, { label: string; revenue: number; orders: number; itemsSold: number }>();

  // Determine bucket granularity
  const stepDays = periodDays <= 7 ? 1 : periodDays <= 30 ? 2 : periodDays <= 90 ? 7 : 14;
  for (let d = periodDays; d >= 0; d -= stepDays) {
    const dateObj = new Date(now.getTime() - d * 24 * 3600 * 1000);
    const key = dateObj.toISOString().split("T")[0];
    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(dateObj);
    trajectoryMap.set(key, { label, revenue: 0, orders: 0, itemsSold: 0 });
  }

  currentPeriodOrders.forEach((o) => {
    const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
    // Find closest bucket
    let closestKey = "";
    let minDiff = Infinity;
    const orderTime = new Date(o.createdAt).getTime();

    trajectoryMap.forEach((_, key) => {
      const bucketTime = new Date(key).getTime();
      const diff = Math.abs(orderTime - bucketTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestKey = key;
      }
    });

    if (closestKey && trajectoryMap.has(closestKey)) {
      const bucket = trajectoryMap.get(closestKey)!;
      bucket.revenue += o.total;
      bucket.orders += 1;
      bucket.itemsSold += o.items.reduce((s, i) => s + i.quantity, 0);
    }
  });

  const trajectory: AnalyticsDataPoint[] = [];
  trajectoryMap.forEach((val, key) => {
    trajectory.push({
      date: key,
      label: val.label,
      revenue: Number(val.revenue.toFixed(2)),
      orders: val.orders,
      itemsSold: val.itemsSold,
    });
  });

  const ordersByStatus: Record<OrderStatus, number> = {
    Pending: allOrders.filter((o) => o.status === "Pending").length,
    Processing: allOrders.filter((o) => o.status === "Processing").length,
    Shipped: allOrders.filter((o) => o.status === "Shipped").length,
    Delivered: allOrders.filter((o) => o.status === "Delivered").length,
    Cancelled: allOrders.filter((o) => o.status === "Cancelled").length,
  };

  const lowStockProducts = db.products.filter((p) => p.stock <= lowThreshold);

  const categoryStats: Record<string, number> = {};
  db.products.forEach((p) => {
    categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
  });

  const topSellingProducts = [...db.products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5);

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    todayRevenue: Number(todayRevenue.toFixed(2)),
    thisWeekRevenue: Number(thisWeekRevenue.toFixed(2)),
    thisMonthRevenue: Number(thisMonthRevenue.toFixed(2)),
    totalOrders,
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
    productsSold,
    salesGrowth,
    period,
    trajectory,
    ordersByStatus,
    lowStockProducts,
    categoryStats,
    recentOrders: allOrders.slice(0, 6),
    topSellingProducts,
  };
}
