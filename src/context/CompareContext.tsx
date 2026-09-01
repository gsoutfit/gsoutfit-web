"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";
import { useToast } from "./ToastContext";

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const { showToast } = useToast();

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const addToCompare = (product: Product) => {
    if (isInCompare(product.id)) {
      showToast("Already in Comparison", `${product.name} is already in comparison table.`, "info");
      return;
    }
    if (compareList.length >= 4) {
      showToast("Comparison Limit Reached", "You can compare a maximum of 4 items simultaneously.", "error");
      return;
    }
    setCompareList((prev) => [...prev, product]);
    showToast("Added to Compare", `${product.name} added to side-by-side comparison.`, "gold");
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

const defaultCompareContext: CompareContextType = {
  compareList: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
  isCompareModalOpen: false,
  setIsCompareModalOpen: () => {},
};

export function useCompare() {
  const context = useContext(CompareContext);
  return context || defaultCompareContext;
}
