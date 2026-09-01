"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product, Coupon } from "@/types";
import { useToast } from "./ToastContext";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  tax: number;
  total: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 15;
const TAX_RATE = 0.08; // 8%

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showToast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("gs_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem("gs_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // ignore
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("gs_cart", JSON.stringify(cart));
      if (appliedCoupon) {
        localStorage.setItem("gs_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("gs_coupon");
      }
    } catch {
      // ignore
    }
  }, [cart, appliedCoupon, isInitialized]);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.size === size &&
          item.color === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        const maxStock = product.stockPerSize?.[size] ?? product.stock;
        updated[existingIndex].quantity = Math.min(newQty, maxStock);
        return updated;
      } else {
        return [...prev, { productId: product.id, product, size, color, quantity }];
      }
    });

    showToast(
      "Added to Shopping Bag",
      `${product.name} (${size}, ${color}) has been added to your bag.`,
      "gold",
      {
        label: "View Bag",
        onClick: () => setIsCartDrawerOpen(true),
      }
    );
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.size === size && item.color === color)
      )
    );
    showToast("Item Removed", "Product was removed from your bag.", "info");
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          const maxStock = item.product.stockPerSize?.[size] ?? item.product.stock;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        showToast("Coupon Applied", data.message, "success");
        return { success: true, message: data.message };
      } else {
        showToast("Coupon Error", data.message, "error");
        return { success: false, message: data.message };
      }
    } catch {
      showToast("Error", "Could not apply discount code.", "error");
      return { success: false, message: "Error applying coupon." };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast("Coupon Removed", "Discount code has been removed.", "info");
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.discountPrice ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minSpend ?? 0)) {
    if (appliedCoupon.discountPercent) {

      discountAmount = (subtotal * appliedCoupon.discountPercent) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountAmount) {
      discountAmount = appliedCoupon.discountAmount;
    }
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const discountedSubtotal = subtotal - discountAmount;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const tax = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + shippingFee + tax;

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        tax,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        freeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

const defaultCartContext: CartContextType = {
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
  discountAmount: 0,
  shippingFee: 0,
  tax: 0,
  total: 0,
  appliedCoupon: null,
  applyCoupon: async () => ({ success: false, message: "" }),
  removeCoupon: () => {},
  isCartDrawerOpen: false,
  setIsCartDrawerOpen: () => {},
  freeShippingThreshold: 150,
  freeShippingRemaining: 150,
  freeShippingProgress: 0,
};

export function useCart() {
  const context = useContext(CartContext);
  return context || defaultCartContext;
}
