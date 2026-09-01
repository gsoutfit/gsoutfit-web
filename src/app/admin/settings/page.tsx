"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Palette,
  Store,
  Package,
  ShoppingBag,
  Megaphone,
  Shield,
  Server,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  Lock,
  Download,
  AlertTriangle,
  Loader2,
  Sparkles,
  DollarSign,
  Smartphone,
  KeyRound,
  Mail,
  Send,
  Copy,
  Trash2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useTheme, DEFAULT_THEME } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { StoreSettings, ThemeColors, MailLog } from "@/types";

export default function AdminSettingsPage() {
  const {
    settings,
    isLoading: isThemeLoading,
    isCustomThemeEnabled,
    activeColors,
    previewColors,
    setPreviewColors,
    updateThemeColors,
    toggleCustomTheme,
    resetToDefault,
    refreshSettings,
  } = useTheme();

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "appearance" | "store" | "products" | "orders" | "marketing" | "security" | "system" | "mail"
  >("appearance");


  // Appearance Form State
  const [themeForm, setThemeForm] = useState<ThemeColors>({ ...DEFAULT_THEME });
  const [isThemeEnabledLocal, setIsThemeEnabledLocal] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [tagline, setTagline] = useState("");

  // Store Form State
  const [storeName, setStoreName] = useState("Gentleman Savage");
  const [currencyCode, setCurrencyCode] = useState("BDT");
  const [currencySymbol, setCurrencySymbol] = useState("৳");
  const [contactEmail, setContactEmail] = useState("concierge@gentlemansavage.com");
  const [contactPhone, setContactPhone] = useState("+880 1700-123456");
  const [storeStatus, setStoreStatus] = useState<"open" | "maintenance">("open");

  // Products & Inventory Settings
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Orders Settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1500);
  const [standardShippingFee, setStandardShippingFee] = useState(120);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Mail & SMTP Settings
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("Gentlemen Savage Concierge <concierge@gentlemensavage.com>");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [mailLogs, setMailLogs] = useState<MailLog[]>([]);
  const [selectedMailPreview, setSelectedMailPreview] = useState<MailLog | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isLoadingMailLogs, setIsLoadingMailLogs] = useState(false);

  // System Stats
  const [systemStats, setSystemStats] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      if (settings.appearance) {
        setThemeForm({
          primaryColor: settings.appearance.primaryColor || DEFAULT_THEME.primaryColor,
          secondaryColor: settings.appearance.secondaryColor || DEFAULT_THEME.secondaryColor,
          accentColor: settings.appearance.accentColor || DEFAULT_THEME.accentColor,
          backgroundColor: settings.appearance.backgroundColor || DEFAULT_THEME.backgroundColor,
          cardColor: settings.appearance.cardColor || DEFAULT_THEME.cardColor,
          textColor: settings.appearance.textColor || DEFAULT_THEME.textColor,
          buttonColor: settings.appearance.buttonColor || DEFAULT_THEME.buttonColor,
          buttonTextColor: settings.appearance.buttonTextColor || DEFAULT_THEME.buttonTextColor,
        });
        setIsThemeEnabledLocal(Boolean(settings.appearance.customThemeEnabled));
        setLogoUrl(settings.appearance.logoUrl || "");
        setTagline(settings.appearance.tagline || "");
      }
      if (settings.store) {
        setStoreName(settings.store.storeName || "Gentlemen Savage");
        setCurrencyCode(settings.store.currency?.code || "USD");
        setCurrencySymbol(settings.store.currency?.symbol || "$");
        setContactEmail(settings.store.contactEmail || "");
        setContactPhone(settings.store.contactPhone || "");
        setStoreStatus(settings.store.status || "open");
      }
      if (settings.products) {
        setLowStockThreshold(settings.products.lowStockThreshold || 10);
        setItemsPerPage(settings.products.itemsPerPage || 12);
      }
      if (settings.orders) {
        setFreeShippingThreshold(settings.orders.freeShippingThreshold || 150);
        setStandardShippingFee(settings.orders.standardShippingFee || 15);
      }
      if (settings.smtp) {
        setSmtpEnabled(Boolean(settings.smtp.enabled));
        setSmtpHost(settings.smtp.host || "smtp.gmail.com");
        setSmtpPort(settings.smtp.port || 587);
        setSmtpUser(settings.smtp.user || "");
        setSmtpPass(settings.smtp.pass || "");
        setSmtpFrom(settings.smtp.from || "Gentlemen Savage Concierge <concierge@gentlemensavage.com>");
        setSmtpSecure(Boolean(settings.smtp.secure));
      }
    }
  }, [settings]);

  const loadMailLogs = async () => {
    setIsLoadingMailLogs(true);
    try {
      const res = await fetch("/api/mail/logs");
      const data = await res.json();
      if (data.success) {
        setMailLogs(data.data || []);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoadingMailLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "mail") {
      loadMailLogs();
    }
  }, [activeTab]);


  // Handle color change with live preview
  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const updated = { ...themeForm, [key]: value };
    setThemeForm(updated);
    setPreviewColors(updated);
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      await updateThemeColors(themeForm, isThemeEnabledLocal);
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: {
            ...themeForm,
            customThemeEnabled: isThemeEnabledLocal,
            logoUrl,
            tagline,
          },
        }),
      });
      showToast("Appearance Saved", "Store theme and branding updated.", "gold");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTheme = async () => {
    setThemeForm({ ...DEFAULT_THEME });
    setIsThemeEnabledLocal(false);
    await resetToDefault();
  };

  const handleSaveStore = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store: {
            storeName,
            currency: { code: currencyCode, symbol: currencySymbol },
            contactEmail,
            contactPhone,
            status: storeStatus,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Store Settings Saved", "Store configuration updated.", "success");
        refreshSettings();
      }
    } catch {
      showToast("Error", "Could not save store settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProducts = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: {
            lowStockThreshold: Number(lowStockThreshold),
            itemsPerPage: Number(itemsPerPage),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Inventory Rules Saved", `Low-stock threshold set to ${lowStockThreshold} units.`, "success");
        refreshSettings();
      }
    } catch {
      showToast("Error", "Failed to save product settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOrders = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: {
            freeShippingThreshold: Number(freeShippingThreshold),
            standardShippingFee: Number(standardShippingFee),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Order Rules Saved", `Free shipping threshold set to ${currencySymbol}${freeShippingThreshold}`, "success");
        refreshSettings();
      }
    } catch {
      showToast("Error", "Failed to save order settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Mismatch", "New password and confirmation do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Too Short", "New password must be at least 8 characters long.", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@gentlemensavage.com",
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Password Changed", data.message, "gold");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast("Error", data.error || "Failed to update password.", "error");
      }
    } catch {
      showToast("Error", "Could not process password change.", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveSmtp = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtp: {
            enabled: smtpEnabled,
            host: smtpHost,
            port: smtpPort,
            user: smtpUser,
            pass: smtpPass,
            from: smtpFrom,
            secure: smtpSecure,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Mail Settings Saved", "SMTP configuration updated successfully.", "gold");
        await refreshSettings();
      } else {
        showToast("Error", data.error || "Failed to update mail settings.", "error");
      }
    } catch {
      showToast("Error", "Could not save mail settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      showToast("Recipient Required", "Please enter a valid email address.", "error");
      return;
    }
    setIsSendingTestEmail(true);
    try {
      const res = await fetch("/api/mail/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailRecipient }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Test Dispatched", data.message, "success");
        loadMailLogs();
      } else {
        showToast("Send Failed", data.message, "error");
      }
    } catch {
      showToast("Error", "Failed to dispatch test email.", "error");
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/mail/logs", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMailLogs([]);
        showToast("Logs Cleared", "Mail history cleared.", "success");
      }
    } catch {
      showToast("Error", "Failed to clear logs.", "error");
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      const backupData = JSON.stringify(data, null, 2);
      const blob = new Blob([backupData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gentlemen-savage-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Backup Exported", "Store database export completed.", "success");
    } catch {
      showToast("Error", "Failed to export database.", "error");
    }
  };

  const tabs = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "store", label: "Store Info", icon: Store },
    { id: "products", label: "Products & Stock", icon: Package },
    { id: "orders", label: "Orders & Shipping", icon: ShoppingBag },
    { id: "mail", label: "Mail & Notifications", icon: Mail },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "system", label: "System & Data", icon: Server },
  ] as const;


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Store Control Center
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
            Admin Settings
          </h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#D4AF37] text-black shadow-gold"
                  : "bg-[#141418] text-zinc-400 hover:text-white border border-zinc-800/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPEARANCE & THEME */}
      {activeTab === "appearance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-white">
                    Custom Theme Engine
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Customize the global color palette across all storefront & admin components.
                  </p>
                </div>

                {/* Enable Custom Theme Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-xs font-bold text-zinc-300">Enable Custom Theme</span>
                  <input
                    type="checkbox"
                    checked={isThemeEnabledLocal}
                    onChange={(e) => {
                      setIsThemeEnabledLocal(e.target.checked);
                      toggleCustomTheme(e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Color Customization Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Primary Color */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-300 uppercase">Primary Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{themeForm.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeForm.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-300 uppercase">Secondary Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{themeForm.secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeForm.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-300 uppercase">Accent Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{themeForm.accentColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.accentColor}
                      onChange={(e) => handleColorChange("accentColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeForm.accentColor}
                      onChange={(e) => handleColorChange("accentColor", e.target.value)}
                      className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-300 uppercase">Background Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{themeForm.backgroundColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.backgroundColor}
                      onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeForm.backgroundColor}
                      onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* Card Color */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-300 uppercase">Card & Surface Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{themeForm.cardColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.cardColor}
                      onChange={(e) => handleColorChange("cardColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeForm.cardColor}
                      onChange={(e) => handleColorChange("cardColor", e.target.value)}
                      className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-300 uppercase">Text Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{themeForm.textColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.textColor}
                      onChange={(e) => handleColorChange("textColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeForm.textColor}
                      onChange={(e) => handleColorChange("textColor", e.target.value)}
                      className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* Button Color */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-300 uppercase">Button Fill Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{themeForm.buttonColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.buttonColor}
                      onChange={(e) => handleColorChange("buttonColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeForm.buttonColor}
                      onChange={(e) => handleColorChange("buttonColor", e.target.value)}
                      className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* Button Text Color */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-300 uppercase">Button Text Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{themeForm.buttonTextColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.buttonTextColor}
                      onChange={(e) => handleColorChange("buttonTextColor", e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeForm.buttonTextColor}
                      onChange={(e) => handleColorChange("buttonTextColor", e.target.value)}
                      className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg font-mono text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Branding Info */}
              <div className="space-y-4 pt-4 border-t border-zinc-800 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">Store Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Sophisticated Tailoring Meets Raw Luxury Streetwear"
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleResetTheme}
                  className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
                </button>
                <button
                  type="button"
                  onClick={handleSaveAppearance}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Appearance & Apply Theme
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#D4AF37]" /> Live Interactive Preview
                </span>
                <span
                  style={{ color: themeForm.primaryColor }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  {isThemeEnabledLocal ? "Custom Theme Active" : "Default Palette"}
                </span>
              </div>

              {/* Preview Window Box */}
              <div
                style={{
                  backgroundColor: themeForm.backgroundColor,
                  color: themeForm.textColor,
                  borderColor: `${themeForm.primaryColor}40`,
                }}
                className="p-6 rounded-3xl border shadow-2xl space-y-6 transition-all duration-300"
              >
                {/* Simulated Header */}
                <div
                  style={{ borderColor: `${themeForm.primaryColor}25` }}
                  className="flex justify-between items-center pb-3 border-b"
                >
                  <div>
                    <span className="font-cinzel text-base font-black tracking-widest block">
                      GENTLEMEN
                    </span>
                    <span
                      style={{ color: themeForm.primaryColor }}
                      className="text-[8px] font-extrabold tracking-[0.3em] uppercase block"
                    >
                      SAVAGE
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: `${themeForm.primaryColor}20`,
                      color: themeForm.primaryColor,
                      borderColor: `${themeForm.primaryColor}40`,
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold border"
                  >
                    VIP Drop
                  </span>
                </div>

                {/* Simulated Product Card */}
                <div
                  style={{
                    backgroundColor: themeForm.cardColor,
                    borderColor: `${themeForm.primaryColor}30`,
                  }}
                  className="p-4 rounded-2xl border space-y-3 shadow-lg"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40">
                    <Image
                      src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80"
                      alt="Sample Leather Jacket"
                      fill
                      className="object-cover"
                    />
                    <div
                      style={{
                        backgroundColor: themeForm.buttonColor,
                        color: themeForm.buttonTextColor,
                      }}
                      className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-extrabold"
                    >
                      20% OFF
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif-luxury text-sm font-bold truncate">
                      Obsidian Raw Leather Biker
                    </h4>
                    <p className="text-[11px] opacity-75 mt-0.5">Hand-buffed Italian calfskin</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      style={{ color: themeForm.primaryColor }}
                      className="font-bold text-base"
                    >
                      $390.00
                    </span>
                    <button
                      style={{
                        backgroundColor: themeForm.buttonColor,
                        color: themeForm.buttonTextColor,
                      }}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-opacity hover:opacity-90 shadow-md"
                    >
                      Add To Bag
                    </button>
                  </div>
                </div>

                {/* Secondary Elements Preview */}
                <div className="space-y-2 text-xs">
                  <div
                    style={{
                      backgroundColor: `${themeForm.secondaryColor}15`,
                      color: themeForm.secondaryColor,
                      borderColor: `${themeForm.secondaryColor}30`,
                    }}
                    className="p-3 rounded-xl border flex items-center justify-between"
                  >
                    <span>Complimentary Express Shipping</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE INFO */}
      {activeTab === "store" && (
        <div className="max-w-2xl p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="font-serif-luxury text-lg font-bold text-white">Store Identity & Currency</h3>
            <p className="text-xs text-zinc-400">Manage business legal name, currency symbols, and customer concierge contacts.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Currency Code</label>
                <select
                  value={currencyCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setCurrencyCode(code);
                    if (code === "USD") setCurrencySymbol("$");
                    else if (code === "BDT") setCurrencySymbol("৳");
                    else if (code === "EUR") setCurrencySymbol("€");
                    else if (code === "GBP") setCurrencySymbol("£");
                  }}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                >
                  <option value="USD">USD ($)</option>
                  <option value="BDT">BDT (৳)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Support Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1 uppercase">Support Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">Store Operating Status</label>
              <select
                value={storeStatus}
                onChange={(e) => setStoreStatus(e.target.value as "open" | "maintenance")}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
              >
                <option value="open">Open (Accepting VIP Orders)</option>
                <option value="maintenance">Maintenance Mode (Storefront Paused)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleSaveStore}
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider"
              >
                Save Store Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS & INVENTORY */}
      {activeTab === "products" && (
        <div className="max-w-2xl p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="font-serif-luxury text-lg font-bold text-white">Inventory & Display Rules</h3>
            <p className="text-xs text-zinc-400">Configure low-inventory alert thresholds and catalogue display limits.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                Low-Stock Warning Threshold (Units)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Products with inventory at or below this count will trigger amber dashboard alerts.
              </p>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                Products Per Page (Shop Catalog)
              </label>
              <input
                type="number"
                min="6"
                max="48"
                step="6"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleSaveProducts}
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider"
              >
                Save Inventory Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & SHIPPING */}
      {activeTab === "orders" && (
        <div className="max-w-2xl p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="font-serif-luxury text-lg font-bold text-white">Fulfillment & Shipping Rules</h3>
            <p className="text-xs text-zinc-400">Set complimentary shipping targets and standard flat fees.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                Free Shipping Target Amount ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Orders above this subtotal automatically qualify for free VIP express shipping.
              </p>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                Standard Express Courier Fee ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={standardShippingFee}
                onChange={(e) => setStandardShippingFee(Number(e.target.value))}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleSaveOrders}
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider"
              >
                Save Shipping Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & MASTER PASSWORD */}
      {activeTab === "security" && (
        <div className="max-w-2xl p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#D4AF37]" /> Administrator Master Password
            </h3>
            <p className="text-xs text-zinc-400">
              Update the master admin password. All passwords are cryptographic SHA-512/PBKDF2 salted and hashed.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">Current Admin Password</label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">New Secure Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold"
              >
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Change Admin Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: SYSTEM & BACKUP */}
      {activeTab === "system" && (
        <div className="max-w-2xl p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#D4AF37]" /> Database & System Telemetry
            </h3>
            <p className="text-xs text-zinc-400">System metrics and database backup tools.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Persistence Engine</span>
              <p className="font-bold text-white">Atomic JSON Store</p>
              <p className="text-[11px] text-emerald-400">● Operational & Healthy</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Node Runtime</span>
              <p className="font-bold text-white">Node.js v22</p>
              <p className="text-[11px] text-zinc-400">Next.js 15 App Router</p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <h4 className="text-xs uppercase font-bold text-zinc-400">Data Backup & Export</h4>
            <p className="text-xs text-zinc-400">
              Download a complete snapshot of all products, orders, categories, and settings.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Database Backup (.JSON)
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: MAIL & NOTIFICATION ENGINE */}
      {activeTab === "mail" && (
        <div className="space-y-8 max-w-5xl">
          {/* SMTP Configuration Card */}
          <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-6 shadow-xl">
            <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#D4AF37]" /> Mail & Notification Engine
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure free SMTP email delivery (Gmail App Password, Brevo, Resend) or run in Zero-Cost Dev Storage Mode.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    smtpEnabled
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                      : "bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]"
                  }`}
                >
                  {smtpEnabled ? "Live SMTP Active" : "Zero-Cost Dev Preview Mode"}
                </span>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* Enable SMTP Toggle */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white uppercase text-xs tracking-wider">
                    Enable Real SMTP Transport
                  </h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    When enabled, emails are dispatched via your configured SMTP host. When disabled, all emails are safely stored and previewable below at zero cost.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmtpEnabled(!smtpEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    smtpEnabled ? "bg-[#D4AF37]" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                      smtpEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* SMTP Credentials Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                    SMTP Host / Server
                  </label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com or smtp-relay.brevo.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    placeholder="587 or 465"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    placeholder="your-email@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                    SMTP Password / App Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 font-semibold mb-1 uppercase">
                    Sender "From" Name & Address
                  </label>
                  <input
                    type="text"
                    placeholder="Gentlemen Savage Concierge <concierge@gentlemensavage.com>"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="email"
                    placeholder="Send test email to..."
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs flex-1 sm:w-64"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={isSendingTestEmail}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    {isSendingTestEmail ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                    )}
                    Test Send
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSmtp}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Mail Settings
                </button>
              </div>
            </div>
          </div>

          {/* Mail Dispatch & OTP Inspector Card */}
          <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-4 shadow-xl">
            <div className="border-b border-zinc-800 pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#D4AF37]" /> Mail Center & OTP Inspector
                </h3>
                <p className="text-xs text-zinc-400">
                  Real-time audit log of all dispatched emails and 6-digit OTP codes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadMailLogs}
                  disabled={isLoadingMailLogs}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:text-[#D4AF37] text-zinc-400 text-xs flex items-center gap-1"
                  title="Refresh mail logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMailLogs ? "animate-spin" : ""}`} />
                </button>
                {mailLogs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:text-rose-400 text-zinc-400 text-xs flex items-center gap-1"
                    title="Clear mail logs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {mailLogs.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Mail className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  No Mail Dispatched Yet
                </p>
                <p className="text-[11px] text-zinc-600">
                  When admin registrations, OTP codes, or orders are created, they will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Recipient</th>
                      <th className="py-3 px-3">Subject / Type</th>
                      <th className="py-3 px-3">OTP Code</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Dispatched At</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {mailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-zinc-200">
                          {log.to}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-zinc-100">{log.subject}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400">
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          {log.otpCode ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-sm font-black text-[#D4AF37] px-2 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                                {log.otpCode}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(log.otpCode!);
                                  showToast("Copied", `OTP Code ${log.otpCode} copied to clipboard!`, "gold");
                                }}
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                title="Copy OTP code"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              log.status === "Sent (SMTP)"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : log.status === "Sent (Dev Preview)"
                                ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-zinc-400 font-mono text-[11px]">
                          {new Date(log.sentAt).toLocaleTimeString()} · {new Date(log.sentAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedMailPreview(log)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-300 font-bold text-[11px] transition-all inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Email Modal Preview */}
      {selectedMailPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="max-w-2xl w-full max-h-[90vh] bg-[#121216] border border-[#2A2A33] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#18181f]">
              <div>
                <h4 className="font-bold text-white text-sm truncate">{selectedMailPreview.subject}</h4>
                <p className="text-[11px] text-zinc-400">
                  Recipient: <strong className="text-zinc-200">{selectedMailPreview.to}</strong> · Dispatched:{" "}
                  {new Date(selectedMailPreview.sentAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedMailPreview(null)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-3"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body iframe rendering the HTML email */}
            <div className="p-4 overflow-y-auto flex-1 bg-black">
              <iframe
                srcDoc={selectedMailPreview.html}
                title="Email Preview"
                className="w-full min-h-[480px] rounded-2xl border border-zinc-800 bg-[#0b0b0c]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

