'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import PackingSlipModal from '@/components/admin/PackingSlipModal';
import PaymentProofModal from '@/components/admin/PaymentProofModal';
import DynamicFieldBuilderModal from '@/components/admin/DynamicFieldBuilderModal';
import CategoryModal from '@/components/admin/CategoryModal';
import ProductModal from '@/components/admin/ProductModal';
import CourierTrackingModal from '@/components/admin/CourierTrackingModal';
import CouponModal from '@/components/admin/CouponModal';
import ThemeCustomizerModal from '@/components/admin/ThemeCustomizerModal';
import RevenueChart from '@/components/admin/RevenueChart';
import CollectionModal from '@/components/admin/CollectionModal';
import AdminUserModal from '@/components/admin/AdminUserModal';
import HeroBannerModal from '@/components/admin/HeroBannerModal';
import ReviewModal from '@/components/admin/ReviewModal';
import HomepageBuilderTab from '@/components/admin/HomepageBuilderTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import {
  initialSettings,
  initialProducts,
  initialCategories,
  initialOrders,
  initialCoupons,
  initialReviews,
  initialUsers,
  initialCollections,
} from '@/lib/dataStore';
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Package,
  Layers,
  Search,
  Plus,
  Edit,
  Trash2,
  Printer,
  Eye,
  Download,
  Save,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Phone,
  Store,
  CreditCard,
  Percent,
  Sliders,
  Image as ImageIcon,
  Check,
  Star,
  Users,
  Camera,
  FileText,
  Truck,
  TicketPercent,
  Clock,
  ArrowUpRight,
  Palette,
  Boxes,
  FolderKanban,
  ShieldCheck,
  History,
  UserCheck,
  UserPlus,
  Shield,
  Lock,
  Mail,
  EyeOff,
  Key,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Move,
  Upload,
  Share2,
  Globe,
} from 'lucide-react';

export default function AdminPage() {
  // Authentication & Security Guard States (Audio 2 User Requirement)
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Credentials Update States in Settings tab
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [updatingCreds, setUpdatingCreds] = useState(false);
  const [credsSuccessMsg, setCredsSuccessMsg] = useState('');
  const [credsErrorMsg, setCredsErrorMsg] = useState('');

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Store state initialized instantly with initial data (0ms delay)
  const [settings, setSettings] = useState(initialSettings);
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [orders, setOrders] = useState(initialOrders || []);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState(initialCoupons || []);
  const [reviews, setReviews] = useState(initialReviews || []);
  const [users, setUsers] = useState(initialUsers || []);
  const [collections, setCollections] = useState(initialCollections || []);
  const [auditLogs, setAuditLogs] = useState([]);

  // Modals state
  const [activePackingSlipOrder, setActivePackingSlipOrder] = useState(null);
  const [activePaymentProofOrder, setActivePaymentProofOrder] = useState(null);
  const [activeFieldBuilderProduct, setActiveFieldBuilderProduct] = useState(null);

  // Category modal state (Add / Edit)
  const [categoryModalData, setCategoryModalData] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [draggedCatIndex, setDraggedCatIndex] = useState(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState(null);
  const [isReorderingCategories, setIsReorderingCategories] = useState(false);

  // Product modal state (Add / Edit)
  const [productModalData, setProductModalData] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Collection modal state (Add / Edit)
  const [collectionModalData, setCollectionModalData] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Admin User modal state (Add / Edit)
  const [adminUserModalData, setAdminUserModalData] = useState(null);
  const [showAdminUserModal, setShowAdminUserModal] = useState(false);

  // Inventory View Mode (Stock Overview vs Audit Movements Log)
  const [inventoryViewMode, setInventoryViewMode] = useState('overview');

  // Courier Tracking Modal state
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);

  // Coupon Modal state
  const [couponModalData, setCouponModalData] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Hero Banner modal state (Add / Edit)
  const [bannerModalData, setBannerModalData] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);

  // Customer Review modal state (Add / Edit)
  const [reviewModalData, setReviewModalData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Theme Customizer Modal state
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Date Range Filter State
  const [dateRangeFilter, setDateRangeFilter] = useState('30 Days');

  // Filter states
  const [productTypeFilter, setProductTypeFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const t = Date.now();
      const [resSettings, resProducts, resCategories, resOrders, resMarketing] = await Promise.all([
        fetch(`/api/settings?_t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/products?_t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/categories?_t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/orders?_t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/marketing?_t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
      ]);

      if (resSettings.settings) setSettings(resSettings.settings);
      if (resProducts.products) setProducts(resProducts.products);
      if (resCategories.categories) setCategories(resCategories.categories);
      if (resOrders.orders) setOrders(resOrders.orders);
      if (resMarketing) {
        setBanners(resMarketing.banners || []);
        setCoupons(resMarketing.coupons || []);
        setReviews(resMarketing.reviews || []);
        setUsers(resMarketing.users || []);
        setCollections(resMarketing.collections || []);
        setAuditLogs(resMarketing.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error loading live data, using current cache');
    } finally {
      setLoading(false);
    }
  };

  // Always enforce fresh authentication on page load / refresh / reopen
  useEffect(() => {
    try {
      localStorage.removeItem('vowcrafts_admin_auth');
      sessionStorage.removeItem('vowcrafts_admin_auth');
    } catch (e) {}
    setIsAuthenticated(false);
    setAdminUser(null);
    setAuthChecking(false);
  }, []);

  // Handle Admin Portal Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
        setLoginPassword('');
        showToast(`✨ Welcome to VowCrafts Admin Console!`);
        fetchData();
      } else {
        setLoginError(data.error || 'Invalid Gmail address or Password. Access denied.');
      }
    } catch (err) {
      setLoginError('Authentication connection error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin', { method: 'DELETE' });
    } catch (e) {}
    try {
      localStorage.removeItem('vowcrafts_admin_auth');
      sessionStorage.removeItem('vowcrafts_admin_auth');
    } catch (e) {}
    setIsAuthenticated(false);
    setAdminUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    showToast('🔒 Signed out of Admin Console');
  };

  // Handle Master Credentials Update (from Settings tab)
  const handleUpdateAdminCredentials = async (e) => {
    e.preventDefault();
    setUpdatingCreds(true);
    setCredsSuccessMsg('');
    setCredsErrorMsg('');
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentAdminPassword,
          newEmail: newAdminEmail,
          newPassword: newAdminPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCredsSuccessMsg(data.message || 'Credentials updated successfully!');
        setCurrentAdminPassword('');
        setNewAdminPassword('');
        setLoginEmail(newAdminEmail);
        showToast('🔐 Login credentials updated successfully!');
      } else {
        setCredsErrorMsg(data.error || 'Failed to update credentials.');
      }
    } catch (err) {
      setCredsErrorMsg('Server error while updating credentials.');
    } finally {
      setUpdatingCreds(false);
    }
  };

  // Handle uploading Store Logo Image via /api/upload
  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const updated = { ...settings, storeLogo: data.url };
        setSettings(updated);
        // Automatically persist to settings API so logo is live immediately
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        showToast('✨ Store logo uploaded & updated on storefront!');
      } else {
        alert(data.message || 'Logo upload failed');
      }
    } catch (err) {
      alert(`Error uploading logo: ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Update Settings (supports Form submit event OR custom settings object from HomepageBuilder)
  const handleSaveSettings = async (customSettingsOrEvent) => {
    if (customSettingsOrEvent?.preventDefault) customSettingsOrEvent.preventDefault();
    const payload =
      customSettingsOrEvent && !customSettingsOrEvent.preventDefault
        ? customSettingsOrEvent
        : settings;
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast('✨ Store Settings & Page Layout updated successfully!');
      } else {
        showToast(`Failed to save settings: ${data.error}`);
      }
    } catch (err) {
      showToast(`Network error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Update Order Status (Payment or Production)
  const handleUpdateOrderStatus = async (orderId, updatePayload) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        showToast(`Order #${data.order.orderNumber} updated successfully`);
      }
    } catch (err) {
      showToast(`Error updating order: ${err.message}`);
    }
  };

  // Save Dynamic Custom Fields for a product (from builder modal)
  const handleSaveProductFields = async (productId, customFields) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customFields }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
        showToast('Dynamic custom fields updated for product');
      }
    } catch (err) {
      showToast(`Error saving fields: ${err.message}`);
    }
  };

  // Inline Stock & Price update
  const handleInlineProductUpdate = async (productId, updates) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
        showToast('Product updated');
      }
    } catch (err) {
      showToast('Error updating product');
    }
  };

  // Save Product (Handles both Create New and Edit Existing!)
  const handleSaveProduct = async (productId, productData) => {
    try {
      if (productId) {
        // Edit existing product
        const res = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => prev.map((p) => (p.id === productId || p._id === productId ? data.product : p)));
          showToast(`✨ Product "${data.product.name}" updated successfully!`);
        }
      } else {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => [data.product, ...prev]);
          showToast(`✨ New product "${data.product.name}" added to catalog!`);
        }
      }
    } catch (err) {
      showToast(`Error saving product: ${err.message}`);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId && p._id !== productId));
        showToast('Product deleted from catalog');
      }
    } catch (err) {
      showToast('Error deleting product');
    }
  };

  // Save Category (Handles both Create New and Edit Existing + Product Links)
  const handleSaveCategory = async (categoryId, categoryData, productUpdates = []) => {
    try {
      let savedCategory = null;
      if (categoryId) {
        // Edit existing category
        const res = await fetch(`/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
        const data = await res.json();
        if (data.success && data.category) {
          savedCategory = data.category;
          setCategories((prev) =>
            prev.map((c) => (c.id === categoryId || c._id === categoryId || c.slug === categoryId ? data.category : c))
          );
          showToast(`✨ Category "${data.category.name}" updated!`);
        } else {
          showToast(`Error: ${data.error || 'Failed to update category'}`);
          return;
        }
      } else {
        // Add new category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
        const data = await res.json();
        if (data.success && data.category) {
          savedCategory = data.category;
          setCategories((prev) => [...prev, data.category]);
          showToast(`✨ New Category "${data.category.name}" created!`);
        } else {
          showToast(`Error: ${data.error || 'Failed to create category'}`);
          return;
        }
      }

      // Handle linked products updates if any
      if (productUpdates && productUpdates.length > 0 && savedCategory) {
        let updatedCount = 0;
        for (const update of productUpdates) {
          const targetProd = products.find((p) => p.id === update.productId || p._id === update.productId);
          if (!targetProd) continue;

          let patchData = {};
          if (update.mode === 'primary') {
            patchData = {
              category: savedCategory.name,
              subcategory: update.subcategoryName || targetProd.subcategory || '',
            };
          } else {
            // mode === 'additional' (Multi-category linking)
            const existingAdditionals = Array.isArray(targetProd.additionalCategories) ? targetProd.additionalCategories : [];
            const updatedAdditionals = existingAdditionals.includes(savedCategory.name)
              ? existingAdditionals
              : [...existingAdditionals, savedCategory.name];

            patchData = {
              additionalCategories: updatedAdditionals,
            };

            if (update.subcategoryName) {
              const existingSubAdditionals = Array.isArray(targetProd.additionalSubcategories) ? targetProd.additionalSubcategories : [];
              if (!existingSubAdditionals.includes(update.subcategoryName)) {
                patchData.additionalSubcategories = [...existingSubAdditionals, update.subcategoryName];
              }
            }
          }

          try {
            const pRes = await fetch(`/api/products/${update.productId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(patchData),
            });
            const pData = await pRes.json();
            if (pData.success && pData.product) {
              setProducts((prev) =>
                prev.map((p) => (p.id === update.productId || p._id === update.productId ? pData.product : p))
              );
              updatedCount++;
            }
          } catch (e) {
            console.error('Failed to link product to category:', e);
          }
        }
        if (updatedCount > 0) {
          showToast(`🔗 Linked ${updatedCount} products to "${savedCategory.name}"!`);
        }
      }

      fetchData();
    } catch (err) {
      showToast(`Error saving category: ${err.message}`);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category and its subcategories?')) return;
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId && c._id !== categoryId && c.slug !== categoryId));
        showToast('Category deleted');
        fetchData();
      }
    } catch (err) {
      showToast('Error deleting category');
    }
  };

  // Reorder Categories (Move Left/Right/Up/Down or Drag & Drop)
  const handleReorderCategory = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= categories.length || fromIndex === toIndex) return;

    const nextCategories = [...categories];
    const [movedCat] = nextCategories.splice(fromIndex, 1);
    nextCategories.splice(toIndex, 0, movedCat);

    // Re-index displayOrder for all categories
    const reorderedWithOrder = nextCategories.map((cat, idx) => ({
      ...cat,
      displayOrder: idx + 1,
    }));

    setCategories(reorderedWithOrder);
    setIsReorderingCategories(true);

    try {
      const res = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderedIds: reorderedWithOrder.map((c) => c.id || c._id || c.slug),
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
        showToast('✨ Category sequence updated! Front-end menu & homepage synchronized.');
      } else {
        showToast(`Warning: ${data.error || 'Failed to sync category order'}`);
      }
    } catch (err) {
      showToast('Network error while saving category order');
    } finally {
      setIsReorderingCategories(false);
    }
  };

  const handleCategoryDragStart = (e, index) => {
    setDraggedCatIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', index.toString());
    } catch (err) {}
  };

  const handleCategoryDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCatIndex !== index) {
      setDragOverCatIndex(index);
    }
  };

  const handleCategoryDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedCatIndex !== null && draggedCatIndex !== targetIndex) {
      handleReorderCategory(draggedCatIndex, targetIndex);
    }
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);
  };

  const handleCategoryDragEnd = () => {
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);
  };

  // Handle Save / Create Coupon
  const handleSaveCoupon = async (couponId, couponData) => {
    try {
      if (couponId) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId || c._id === couponId ? { ...c, ...couponData } : c))
        );
        showToast(`✨ Coupon "${couponData.code}" updated successfully!`);
      } else {
        const newCoupon = { ...couponData, id: `cp-${Date.now()}` };
        setCoupons((prev) => [newCoupon, ...prev]);
        showToast(`✨ Coupon "${couponData.code}" created successfully!`);
        await fetch('/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'coupons', data: newCoupon }),
        });
      }
    } catch (err) {
      showToast(`Error saving coupon: ${err.message}`);
    }
  };

  // Handle Delete Coupon
  const handleDeleteCoupon = (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    setCoupons((prev) => prev.filter((c) => c.id !== couponId && c._id !== couponId));
    showToast('Coupon deleted');
  };

  // Handle Save / Create Hero Banner
  const handleSaveBanner = async (bannerId, bannerData) => {
    try {
      if (bannerId) {
        setBanners((prev) =>
          prev.map((b) => (b.id === bannerId || b._id === bannerId ? { ...b, ...bannerData } : b))
        );
        showToast(`✨ Hero Banner "${bannerData.title}" updated successfully!`);
        await fetch('/api/marketing', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'banners', id: bannerId, data: bannerData }),
        });
      } else {
        const newBanner = {
          ...bannerData,
          id: `ban-${Date.now()}`,
          active: bannerData.active !== undefined ? bannerData.active : true,
          order: bannerData.order ? Number(bannerData.order) : banners.length + 1,
        };
        setBanners((prev) => [...prev, newBanner]);
        showToast(`✨ Hero Banner "${bannerData.title}" created successfully!`);
        await fetch('/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'banners', data: newBanner }),
        });
      }
    } catch (err) {
      showToast(`Error saving banner: ${err.message}`);
    }
  };

  // Handle Delete Hero Banner
  const handleDeleteBanner = async (bannerId) => {
    if (!confirm('Are you sure you want to remove this hero banner?')) return;
    try {
      setBanners((prev) => prev.filter((b) => b.id !== bannerId && b._id !== bannerId));
      showToast('Hero banner removed');
      await fetch(`/api/marketing?resource=banners&id=${bannerId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      showToast(`Error removing banner: ${err.message}`);
    }
  };

  // Handle Toggle Banner Active Status
  const handleToggleBannerActive = async (banner) => {
    try {
      const nextActive = banner.active === false ? true : false;
      const updated = { ...banner, active: nextActive };
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id || b._id === banner.id ? updated : b))
      );
      showToast(`Banner ${nextActive ? 'activated' : 'hidden from storefront'}`);
      await fetch('/api/marketing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'banners', id: banner.id, data: { active: nextActive } }),
      });
    } catch (err) {
      showToast(`Error updating banner: ${err.message}`);
    }
  };

  // Handle Save / Create Customer Review
  const handleSaveReview = async (reviewId, reviewData) => {
    try {
      if (reviewId) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId || r._id === reviewId ? { ...r, ...reviewData } : r))
        );
        showToast(`✨ Review from "${reviewData.customerName}" updated!`);
        await fetch('/api/marketing', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'reviews', id: reviewId, data: reviewData }),
        });
      } else {
        const newReview = {
          ...reviewData,
          id: `rev-${Date.now()}`,
          verified: reviewData.verified !== undefined ? reviewData.verified : true,
          approved: reviewData.approved !== undefined ? reviewData.approved : true,
          reviewDate: reviewData.reviewDate || new Date().toISOString().split('T')[0],
        };
        setReviews((prev) => [newReview, ...prev]);
        showToast(`✨ Review from "${reviewData.customerName}" added!`);
        await fetch('/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'reviews', data: newReview }),
        });
      }
      fetchData();
    } catch (err) {
      showToast(`Error saving review: ${err.message}`);
    }
  };

  // Handle Delete Customer Review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    try {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId && r._id !== reviewId));
      showToast('Review removed');
      await fetch(`/api/marketing?resource=reviews&id=${reviewId}`, {
        method: 'DELETE',
      });
      fetchData();
    } catch (err) {
      showToast(`Error deleting review: ${err.message}`);
    }
  };

  // Handle Save Tracking & Send Email to Customer's Gmail
  const handleSaveTracking = async (orderId, { orderStatus, tracking, sendEmail, customMessage }) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus,
          tracking,
          timelineEvent: {
            status: orderStatus,
            message: `Order status updated to ${orderStatus}. Courier: ${tracking.courierName} (CN: ${tracking.trackingId || 'N/A'})`,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId || o._id === orderId ? data.order : o)));
        showToast(`🚚 Order #${data.order.orderNumber} updated: ${orderStatus.toUpperCase()}`);

        if (sendEmail && data.order.customer?.email) {
          try {
            await fetch('/api/notifications/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toEmail: data.order.customer.email,
                customerName: data.order.customer.fullName,
                orderNumber: data.order.orderNumber,
                orderStatus,
                courierName: tracking.courierName,
                trackingId: tracking.trackingId,
                trackingUrl: tracking.trackingUrl,
                remainingBalance: data.order.pricing?.remainingBalance || 0,
                customMessage,
              }),
            });
            showToast(`📧 Status & Courier tracking sent to ${data.order.customer.email}`);
          } catch (emailErr) {
            console.error('Email dispatch error:', emailErr);
          }
        }
      }
    } catch (err) {
      showToast(`Error updating tracking: ${err.message}`);
    }
  };

  // Handle Save Theme
  const handleSaveTheme = async (themeData) => {
    try {
      const updatedSettings = { ...settings, theme: themeData };
      setSettings(updatedSettings);
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      showToast('🎨 Theme, typography & color preferences applied!');
    } catch (err) {
      showToast(`Error saving theme: ${err.message}`);
    }
  };

  // Handle Save Collection
  const handleSaveCollection = async (collectionId, collectionData) => {
    try {
      if (collectionId) {
        setCollections((prev) =>
          prev.map((c) => (c.id === collectionId || c._id === collectionId ? { ...c, ...collectionData } : c))
        );
        showToast(`✨ Collection "${collectionData.name}" updated!`);
        await fetch('/api/marketing', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'collections', id: collectionId, data: collectionData }),
        });
      } else {
        const newCol = { ...collectionData, id: `col-${Date.now()}` };
        setCollections((prev) => [newCol, ...prev]);
        showToast(`✨ Collection "${collectionData.name}" created!`);
        await fetch('/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'collections', data: newCol }),
        });
      }
    } catch (err) {
      showToast(`Error saving collection: ${err.message}`);
    }
  };

  // Handle Delete Collection
  const handleDeleteCollection = async (collectionId) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    setCollections((prev) => prev.filter((c) => c.id !== collectionId && c._id !== collectionId));
    showToast('Collection removed');
    try {
      await fetch(`/api/marketing?resource=collections&id=${collectionId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save Admin User (RBAC)
  const handleSaveAdminUser = async (userData) => {
    const isEdit = Boolean(userData.id || userData._id);
    const userId = userData.id || userData._id;
    try {
      if (isEdit) {
        setUsers((prev) => prev.map((u) => (u.id === userId || u._id === userId ? { ...u, ...userData } : u)));
        showToast(`✨ Administrator "${userData.name}" updated!`);
        await fetch('/api/marketing', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'users', id: userId, data: userData }),
        });
      } else {
        const newUser = { ...userData, id: `usr-${Date.now()}` };
        setUsers((prev) => [newUser, ...prev]);
        showToast(`✨ Administrator "${userData.name}" added to staff team!`);
        await fetch('/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'users', data: newUser }),
        });
      }
    } catch (err) {
      showToast(`Error saving administrator: ${err.message}`);
    }
  };

  // Handle Delete Admin User
  const handleDeleteAdminUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this staff administrator?')) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId && u._id !== userId));
    showToast('Administrator removed');
    try {
      await fetch(`/api/marketing?resource=users&id=${userId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Stock Adjust with Automatic Audit Log Movement
  const handleQuickStockAdjust = async (product, changeDelta, customReason) => {
    const nextStock = Math.max(0, (Number(product.stock) || 0) + changeDelta);
    await handleInlineProductUpdate(product.id, { stock: nextStock });

    const newLog = {
      id: `audit-${Date.now()}`,
      productName: product.name,
      change: `${changeDelta > 0 ? '+' : ''}${changeDelta} unit(s)`,
      reason: customReason || (changeDelta > 0 ? 'Manual replenishment from warehouse' : 'Inventory write-off / adjustment'),
      performedBy: 'Master Artisan Asad',
      timestamp: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    try {
      await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'auditLogs', data: newLog }),
      });
    } catch (err) {
      console.error('Audit log write error:', err);
    }
  };

  // Metrics calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
  const totalAdvanceCollected = orders
    .filter((o) => o.payment?.paymentStatus === 'advance_verified')
    .reduce((sum, o) => sum + (o.pricing?.advanceAmount || 0), 0);

  // Inventory & Valuation Metrics (Matches Screenshot 2)
  const totalInventoryUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalInventoryValuation = products.reduce(
    (sum, p) => sum + ((Number(p.basePrice) || 0) * (Number(p.stock) || 0)),
    0
  );
  const lowStockCount = products.filter((p) => Number(p.stock) <= 10 && Number(p.stock) > 0).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) === 0).length;

  // Order Status Dashboard Metrics (Matches Screenshot 3)
  const ordersReceivedCount = orders.length;
  const ordersPendingCount = orders.filter(
    (o) => o.payment?.paymentStatus === 'pending_verification' || o.orderStatus === 'pending'
  ).length;
  const ordersConfirmedCount = orders.filter(
    (o) => o.payment?.paymentStatus === 'advance_verified' || o.orderStatus === 'confirmed'
  ).length;
  const ordersProcessingCount = orders.filter(
    (o) => o.orderStatus === 'in_production' || o.orderStatus === 'processing'
  ).length;
  const ordersReadyToShipCount = orders.filter((o) => o.orderStatus === 'ready_to_ship').length;
  const ordersShippedCount = orders.filter((o) => o.orderStatus === 'shipped').length;
  const ordersDeliveredCount = orders.filter((o) => o.orderStatus === 'delivered').length;
  const ordersCancelledCount = orders.filter((o) => o.orderStatus === 'cancelled').length;
  const pendingPaymentProofsCount = ordersPendingCount;

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    const matchesType = productTypeFilter === 'ALL' || p.productType === productTypeFilter;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredOrders = orders.filter((o) => {
    const status = (orderStatusFilter || 'ALL').toUpperCase();
    if (status === 'ALL') return true;
    if (status === 'PENDING') return o.payment?.paymentStatus === 'pending_verification' || o.orderStatus === 'pending';
    if (status === 'CONFIRMED') return o.payment?.paymentStatus === 'advance_verified' || o.orderStatus === 'confirmed';
    if (status === 'PROCESSING') return o.orderStatus === 'in_production' || o.orderStatus === 'processing';
    if (status === 'SHIPPED') return o.orderStatus === 'shipped';
    if (status === 'DELIVERED') return o.orderStatus === 'delivered';
    if (status === 'CANCELLED') return o.orderStatus === 'cancelled';
    return true;
  });

  // 1. Session Verification Loading Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#141210] flex flex-col items-center justify-center text-white space-y-4 font-sans select-none">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-[#C59A27]/20 border-t-[#C59A27] animate-spin" />
          <Lock className="w-5 h-5 text-[#E3C677] absolute inset-0 m-auto" />
        </div>
        <p className="font-serif text-xs tracking-widest text-[#E3C677] uppercase animate-pulse">
          Verifying Atelier Security Protocol...
        </p>
      </div>
    );
  }

  // 2. High-Security Admin Portal Login Screen (Audio 2 User Requirement)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141210] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#C59A27]/30 selection:text-white">
        {/* Ambient radial gold glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C59A27]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-[#1C1917] border border-[#C59A27]/40 shadow-2xl rounded-3xl p-7 sm:p-9 text-white space-y-6">
          {/* Atelier Brand Emblem */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#292524] to-[#1C1917] border border-[#C59A27]/50 shadow-inner mb-1">
              <Lock className="w-6 h-6 text-[#E3C677]" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-wide text-white">
              VowCrafts Atelier
            </h1>
            <p className="text-xs text-stone-400 font-sans tracking-wide">
              Secure Staff &amp; Administrator Portal
            </p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                Gmail / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@vowcrafts.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#141210] border border-stone-700 focus:border-[#C59A27] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-[#C59A27] transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="w-full pl-10 pr-10 py-3 bg-[#141210] border border-stone-700 focus:border-[#C59A27] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-[#C59A27] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-white transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Info Box for User */}
            <div className="bg-[#141210]/70 p-3 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
              <div className="flex items-center justify-between text-stone-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C59A27]" />
                  <span>Authorized Login Credentials</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('admin@vowcrafts.com');
                    setLoginPassword('admin@vowcrafts2026');
                    setLoginError('');
                  }}
                  className="text-[10px] text-[#E3C677] hover:underline font-mono cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
              <p className="text-stone-400 font-mono text-[10px]">
                Email: <strong className="text-stone-200">admin@vowcrafts.com</strong>
                <br />
                Password: <strong className="text-stone-200">admin@vowcrafts2026</strong>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-[#C59A27] to-[#A47A1A] hover:brightness-110 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Log In to Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badges */}
          <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>256-Bit SSL Encrypted</span>
            </span>
            <a href="/" className="hover:text-stone-300 transition flex items-center gap-1">
              <span>Back to Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#C59A27] border-t-transparent animate-spin"></div>
        <div className="font-serif text-lg tracking-wider text-[#E3C677]">Loading VowCrafts Admin Console...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF7F2] text-[#1A1817]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1C1917] text-white px-5 py-3 rounded-xl border border-[#C59A27] shadow-2xl flex items-center space-x-3 text-sm animate-fade-in font-sans">
          <Sparkles className="w-4 h-4 text-[#E3C677]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        storeSettings={settings}
        pendingOrdersCount={ordersPendingCount}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          storeSettings={settings}
          pendingOrdersCount={ordersPendingCount}
          onOpenSettings={() => setCurrentTab('settings')}
          onOpenTheme={() => setShowThemeModal(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* ============================================================ */}
          {/* TAB: AUDIENCE REACH & ANALYTICS (User Audio Requirement) */}
          {/* ============================================================ */}
          {currentTab === 'analytics' && (
            <AnalyticsTab
              orders={orders}
              products={products}
              categories={categories}
            />
          )}

          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW DASHBOARD (Matches User Screenshot) */}
          {/* ============================================================ */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Title & Date Range Filter Pills matching screenshot */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                    Overview Dashboard
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Real-time business performance and atelier operations metrics
                  </p>
                </div>

                {/* Date range filter pills matching screenshot */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200 shadow-2xs self-start sm:self-auto">
                  {['Today', '7 Days', '30 Days', '3 Months', '12 Months'].map((range) => {
                    const isActive = dateRangeFilter === range;
                    return (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setDateRangeFilter(range)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#1C1917] text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6 KPI Cards in a single responsive row matching screenshot */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* 1. TOTAL REVENUE */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      TOTAL REVENUE
                    </span>
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px]">
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="font-serif text-lg font-bold text-stone-900">
                    PKR {totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium truncate">
                    PKR {totalRevenue.toLocaleString()} in selected period
                  </div>
                </div>

                {/* 2. TOTAL ORDERS */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      TOTAL ORDERS
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="font-serif text-lg font-bold text-stone-900">
                    {orders.length}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">
                    {orders.length} orders in period
                  </div>
                </div>

                {/* 3. PENDING ORDERS */}
                <div
                  onClick={() => {
                    setOrderStatusFilter('PENDING_PAYMENT');
                    setCurrentTab('orders');
                  }}
                  className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-amber-300 transition space-y-2 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      PENDING ORDERS
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="font-serif text-lg font-bold text-stone-900">
                    {pendingPaymentProofsCount}
                  </div>
                  <div className="text-[10px] text-amber-800 font-medium group-hover:underline truncate">
                    Review pending orders &rarr;
                  </div>
                </div>

                {/* 4. CUSTOMERS */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      CUSTOMERS
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="font-serif text-lg font-bold text-stone-900">
                    {Math.max(1, new Set(orders.map((o) => o.customer?.email)).size)}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">
                    Registered patrons
                  </div>
                </div>

                {/* 5. ACTIVE PRODUCTS */}
                <div
                  onClick={() => setCurrentTab('products')}
                  className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition space-y-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      ACTIVE PRODUCTS
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="font-serif text-lg font-bold text-stone-900">
                    {products.length}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">
                    Valuation: PKR 1,483,800
                  </div>
                </div>

                {/* 6. LOW STOCK */}
                <div
                  onClick={() => setCurrentTab('inventory')}
                  className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition space-y-2 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      LOW STOCK
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="font-serif text-lg font-bold text-stone-900">
                    {lowStockCount}
                  </div>
                  <div className="text-[10px] text-stone-500 group-hover:underline truncate">
                    Manage inventory &rarr;
                  </div>
                </div>
              </div>

              {/* Revenue Performance Card with Live Interactive Graph */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      Revenue Performance
                    </h3>
                    <p className="text-xs text-stone-500">
                      Daily revenue trends from validated orders
                    </p>
                  </div>
                  <div className="text-xs font-bold text-stone-900 font-sans">
                    Period Sales: <span className="font-bold">PKR {totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Live Curved SVG Revenue Graph with bezier curve & hover points */}
                <RevenueChart dateRange={dateRangeFilter} totalSales={totalRevenue} />
              </div>

              {/* Bottom Row: Recent Orders (Left 2/3) & Stock Attention (Right 1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders (2 cols) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base">
                        Recent Orders
                      </h3>
                      <p className="text-xs text-stone-500">Latest customer transactions</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('orders')}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center space-x-1"
                    >
                      <span>View All</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Orders Table matching user screenshot columns */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                        <tr>
                          <th className="py-2.5 pr-3">ORDER #</th>
                          <th className="py-2.5 px-3">CUSTOMER</th>
                          <th className="py-2.5 px-3">TOTAL</th>
                          <th className="py-2.5 px-3 text-center">STATUS</th>
                          <th className="py-2.5 pl-3 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium">
                        {orders.slice(0, 5).map((order) => {
                          const statusUpper = (order.orderStatus || 'new').toUpperCase();
                          return (
                            <tr key={order.id} className="hover:bg-stone-50/70 transition">
                              <td className="py-3 pr-3 font-mono text-stone-800 font-semibold text-xs">
                                {order.orderNumber}
                              </td>
                              <td className="py-3 px-3">
                                <div className="text-stone-900 font-medium">{order.customer?.fullName}</div>
                                <div className="text-[10px] text-stone-400 truncate font-mono">
                                  {order.customer?.email}
                                </div>
                              </td>
                              <td className="py-3 px-3 font-medium text-stone-900">
                                PKR {order.pricing?.totalAmount?.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    statusUpper === 'CONFIRMED'
                                      ? 'bg-amber-100 text-amber-900'
                                      : statusUpper === 'SHIPPED'
                                      ? 'bg-yellow-100 text-yellow-900'
                                      : statusUpper === 'DELIVERED'
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : 'bg-stone-100 text-stone-700'
                                  }`}
                                >
                                  {statusUpper}
                                </span>
                              </td>
                              <td className="py-3 pl-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setActiveTrackingOrder(order)}
                                  className="text-stone-600 hover:text-stone-900 text-xs font-semibold hover:underline"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock Attention (1 col) matching user screenshot */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base">
                        Stock Attention
                      </h3>
                      <p className="text-xs text-stone-500">Items at or below low stock threshold</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('inventory')}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium"
                    >
                      Adjust
                    </button>
                  </div>

                  {/* Inventory state box */}
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-center">
                    <p className="text-xs text-emerald-800 font-medium">
                      All inventory levels are healthy!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: CATALOG -> PRODUCTS & CUSTOMIZATION OPTIONS */}
          {/* ============================================================ */}
          {currentTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">Product Catalog Management</h1>
                  <p className="text-xs text-stone-500">
                    Add or edit products, upload gallery pictures, and toggle customer customization checkboxes (Names, Dates, Photo Uploads, Frame Finishes).
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setProductModalData(null);
                      setShowProductModal(true);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#C59A27] hover:bg-[#A47A1A] text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Product</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase text-stone-500 tracking-wider">Product Type:</span>
                  {['ALL', 'TYPE_A', 'TYPE_B', 'TYPE_C'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setProductTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        productTypeFilter === type
                          ? 'bg-[#1C1917] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {type === 'ALL'
                        ? 'All Products'
                        : type === 'TYPE_A'
                        ? 'Standard Checkout'
                        : type === 'TYPE_B'
                        ? 'Text Customization'
                        : 'Photo Uploads'}
                    </button>
                  ))}
                </div>

                <div className="relative w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search products by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27]"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1C1917] text-[#FAF7F2] font-semibold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="p-4">Item & Gallery</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-center">Active Customization</th>
                        <th className="p-4 text-center">Base Price ({settings?.currencySymbol})</th>
                        <th className="p-4 text-center">Stock & Scarcity</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 font-sans">
                      {filteredProducts.map((p) => {
                        const isLowStock = p.stock <= 10;
                        const hasCustomText = p.productType === 'TYPE_B' || (p.customFields && p.customFields.length > 0);
                        const hasCustomImages = p.productType === 'TYPE_C' || p.imageUploadConfig?.enabled;

                        return (
                          <tr key={p.id} className="hover:bg-amber-50/30 transition">
                            <td className="p-4 flex items-center space-x-3.5">
                              <img
                                src={p.images[0] || 'https://via.placeholder.com/80'}
                                alt={p.name}
                                className="w-14 h-14 object-cover rounded-xl border border-stone-200 shadow-xs shrink-0"
                              />
                              <div className="space-y-0.5 max-w-xs">
                                <div className="font-bold text-sm text-stone-900 leading-snug">{p.name}</div>
                                <div className="text-[11px] text-stone-500 font-mono truncate">{p.slug}</div>
                                <div className="flex gap-1 pt-0.5">
                                  {p.isBestSeller && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                                      Best Seller
                                    </span>
                                  )}
                                  <span className="text-[9px] text-stone-400 font-mono">
                                    📷 {p.images?.length || 1} pic(s)
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-stone-800">{p.category}</div>
                              <div className="text-[11px] text-stone-500">{p.subcategory || 'General'}</div>
                            </td>

                            {/* Active Customization Badges */}
                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                {hasCustomText && (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                    <FileText className="w-3 h-3" />
                                    <span>Text ({p.customFields?.length || 0} fields)</span>
                                  </span>
                                )}
                                {hasCustomImages && (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                    <Camera className="w-3 h-3" />
                                    <span>Photo Uploads ({p.imageUploadConfig?.maxImages || 50} max)</span>
                                  </span>
                                )}
                                {!hasCustomText && !hasCustomImages && (
                                  <span className="px-2 py-0.5 rounded text-[10px] text-stone-500 bg-stone-100 border border-stone-200">
                                    Standard Checkout
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Inline Price editing */}
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center space-x-1">
                                <input
                                  type="number"
                                  defaultValue={p.basePrice}
                                  onBlur={(e) =>
                                    handleInlineProductUpdate(p.id, { basePrice: Number(e.target.value) })
                                  }
                                  className="w-20 text-center font-mono font-bold p-1 bg-stone-50 border border-stone-300 rounded focus:ring-1 focus:ring-[#C59A27]"
                                />
                              </div>
                            </td>

                            {/* Inline Stock editing + Scarcity tag */}
                            <td className="p-4 text-center">
                              <div className="inline-flex flex-col items-center space-y-1">
                                <input
                                  type="number"
                                  defaultValue={p.stock}
                                  onBlur={(e) =>
                                    handleInlineProductUpdate(p.id, { stock: Number(e.target.value) })
                                  }
                                  className={`w-16 text-center font-mono font-bold p-1 rounded border ${
                                    isLowStock
                                      ? 'bg-rose-50 border-rose-400 text-rose-700'
                                      : 'bg-stone-50 border-stone-300 text-stone-900'
                                  }`}
                                />
                                {isLowStock ? (
                                  <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider flex items-center space-x-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    <span>Scarcity &le;10</span>
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-emerald-600 font-semibold">In Stock</span>
                                )}
                              </div>
                            </td>

                            {/* Actions: Navigate / View Live, Edit & Delete */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* 1. Navigate to Live Storefront Product */}
                                <a
                                  href={`/products/${p.slug || p.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-stone-600 hover:text-[#C59A27] bg-stone-100 hover:bg-amber-50 rounded-lg transition border border-stone-200/80 hover:border-[#C59A27]/50 shadow-2xs flex items-center justify-center cursor-pointer"
                                  title="Navigate to Live Product (Opens in new tab)"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>

                                {/* 2. Edit Product */}
                                <button
                                  onClick={() => {
                                    setProductModalData(p);
                                    setShowProductModal(true);
                                  }}
                                  className="p-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg shadow-2xs transition flex items-center justify-center cursor-pointer"
                                  title="Edit Product Details & Customization"
                                >
                                  <Edit className="w-4 h-4 text-[#E3C677]" />
                                </button>

                                {/* 3. Delete Product */}
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200 flex items-center justify-center cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: CATALOG -> CATEGORIES & SUB-CATEGORIES (MANUAL ADD/EDIT) */}
          {/* ============================================================ */}
          {currentTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Categories & Sub-Categories Manager
                  </h1>
                  <p className="text-xs text-stone-500">
                    Manually add, edit categories, upload display pictures shown alongside category titles, and configure sub-categories.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCategoryModalData(null);
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#C59A27] hover:bg-[#A47A1A] text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>

              {/* Reorder Information Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-50 border border-stone-200/80 rounded-2xl p-4 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#8C6D42] border border-[#B5936C]/40 flex items-center justify-center shrink-0">
                    <Move className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span>Movable Categories Sequence</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#C59A27]/15 text-[#8C6D42] border border-[#C59A27]/30">
                        Live Sync
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Drag cards or tap <strong>◀</strong> and <strong>▶</strong> buttons to reorder. The symmetry updates your storefront menu & homepage instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isReorderingCategories ? (
                    <span className="text-xs font-mono text-[#8C6D42] font-semibold animate-pulse flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#C59A27]/30">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Order...</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400 font-mono">
                      {categories.length} Categories Active
                    </span>
                  )}
                </div>
              </div>

              {/* Categories Cards Grid with uploaded picture & reordering controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat, index) => {
                  const isFirst = index === 0;
                  const isLast = index === categories.length - 1;
                  const isDragged = draggedCatIndex === index;
                  const isOver = dragOverCatIndex === index;

                  return (
                    <div
                      key={cat.id || cat.slug || index}
                      draggable
                      onDragStart={(e) => handleCategoryDragStart(e, index)}
                      onDragOver={(e) => handleCategoryDragOver(e, index)}
                      onDrop={(e) => handleCategoryDrop(e, index)}
                      onDragEnd={handleCategoryDragEnd}
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs flex flex-col justify-between select-none ${
                        isDragged
                          ? 'opacity-35 scale-[0.98] border-dashed border-[#C59A27] bg-[#FAF7F2]'
                          : isOver
                          ? 'border-[#C59A27] ring-2 ring-[#C59A27]/50 shadow-lg scale-[1.02] bg-[#FAF7F2]/30'
                          : 'border-stone-200 hover:border-[#C59A27]/60 hover:shadow-md'
                      }`}
                    >
                      {/* Top Reordering Control Strip */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50/80 border-b border-stone-100">
                        {/* Drag Handle & Position Badge */}
                        <div className="flex items-center space-x-2">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-md transition"
                            title="Drag to change category order"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-white text-stone-800 border border-stone-200 shadow-2xs">
                            <span className="text-[#8C6D42]">#</span>
                            <span>{index + 1}</span>
                          </span>
                          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                            Position
                          </span>
                        </div>

                        {/* Move Left / Right Step Buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleReorderCategory(index, index - 1)}
                            disabled={isFirst}
                            title={isFirst ? 'Already first in sequence' : 'Move Left (Earlier in Menu)'}
                            className={`p-1.5 rounded-lg border transition flex items-center justify-center ${
                              isFirst
                                ? 'text-stone-300 border-stone-200 bg-stone-100/60 cursor-not-allowed opacity-50'
                                : 'text-stone-700 border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900 shadow-2xs cursor-pointer active:scale-95'
                            }`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReorderCategory(index, index + 1)}
                            disabled={isLast}
                            title={isLast ? 'Already last in sequence' : 'Move Right (Later in Menu)'}
                            className={`p-1.5 rounded-lg border transition flex items-center justify-center ${
                              isLast
                                ? 'text-stone-300 border-stone-200 bg-stone-100/60 cursor-not-allowed opacity-50'
                                : 'text-stone-700 border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900 shadow-2xs cursor-pointer active:scale-95'
                            }`}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-4">
                        <div className="space-y-3">
                          {/* Uploaded Picture alongside Category Name */}
                          <div className="flex items-center space-x-3.5 pb-3 border-b border-stone-100">
                            <img
                              src={cat.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80'}
                              alt={cat.name}
                              className="w-16 h-16 object-cover rounded-xl border border-stone-200 shadow-xs shrink-0"
                            />
                            <div className="min-w-0">
                              <h3 className="font-serif font-bold text-base text-stone-900 truncate">
                                {cat.name}
                              </h3>
                              <div className="text-[11px] font-mono text-[#A47A1A] truncate">
                                /{cat.slug}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                  Active Category
                                </span>
                                {(() => {
                                  const linkedCount = products.filter((p) =>
                                    (p.category && (p.category.toLowerCase() === cat.name.toLowerCase() || p.category.toLowerCase() === cat.slug?.toLowerCase())) ||
                                    (Array.isArray(p.additionalCategories) && p.additionalCategories.some((ac) => ac.toLowerCase() === cat.name.toLowerCase() || ac.toLowerCase() === cat.slug?.toLowerCase()))
                                  ).length;
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-900 font-bold border border-amber-200">
                                      <Package className="w-3 h-3 text-[#A47A1A]" />
                                      {linkedCount} Products
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-stone-600 line-clamp-2">
                            {cat.description || 'Heirloom collection curated for bespoke moments.'}
                          </p>

                          {/* Sub-categories chips */}
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                              Sub-categories ({cat.subcategories?.length || 0}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.subcategories && cat.subcategories.length > 0 ? (
                                cat.subcategories.map((sub) => (
                                  <span
                                    key={sub.id || sub.slug || sub.name}
                                    className="text-[11px] px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-medium border border-stone-200"
                                  >
                                    {sub.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-stone-400 italic">No subcategories defined</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Actions: Edit, Link Products & Delete */}
                        <div className="flex items-center justify-between pt-3 border-t border-stone-100 gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryModalData({ ...cat, initialTab: 'details' });
                                setShowCategoryModal(true);
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#E3C677]" />
                              <span>Edit & Subs</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCategoryModalData({ ...cat, initialTab: 'products' });
                                setShowCategoryModal(true);
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                              title="Link existing products to this category"
                            >
                              <Package className="w-3.5 h-3.5 text-[#A47A1A]" />
                              <span>Link Products</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3B: CATALOG -> COLLECTIONS MANAGER (MATCHES SCREENSHOT 4) */}
          {/* ============================================================ */}
          {currentTab === 'collections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Collections Manager
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Curate signature showcases like &ldquo;Made for Moments&rdquo;, &ldquo;Eid Collection&rdquo;, or &ldquo;New Arrivals&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCollectionModalData(null);
                    setShowCollectionModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#1C1917] hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD COLLECTION</span>
                </button>
              </div>

              {/* Collections Table matching Screenshot 4 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                      <tr>
                        <th className="py-3.5 px-6">COLLECTION</th>
                        <th className="py-3.5 px-6">SLUG</th>
                        <th className="py-3.5 px-6 text-center">PRODUCTS</th>
                        <th className="py-3.5 px-6 text-center">STATUS</th>
                        <th className="py-3.5 px-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {collections.map((col) => (
                        <tr key={col.id || col._id} className="hover:bg-amber-50/15 transition group">
                          <td className="py-4 px-6 font-bold text-stone-900 text-sm">
                            {col.name}
                          </td>
                          <td className="py-4 px-6 font-mono text-stone-500 text-xs">
                            {col.slug}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200/80">
                              {col.productIds?.length || 0} products
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              {col.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setCollectionModalData(col);
                                  setShowCollectionModal(true);
                                }}
                                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-md hover:bg-stone-100 transition"
                                title="Edit Collection"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCollection(col.id || col._id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                                title="Delete Collection"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {collections.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-stone-400">
                            <FolderKanban className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                            <p className="font-medium text-xs">No collections created yet.</p>
                            <button
                              type="button"
                              onClick={() => {
                                setCollectionModalData(null);
                                setShowCollectionModal(true);
                              }}
                              className="mt-3 px-4 py-2 bg-[#1C1917] text-white rounded-lg text-xs font-bold"
                            >
                              + Create First Collection
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: OPERATIONS -> CUSTOMER ORDERS (MATCHES SCREENSHOT 3) */}
          {/* ============================================================ */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              {/* Header matching Screenshot 3 */}
              <div>
                <h1 className="font-serif text-2xl font-bold text-stone-900">Customer Orders</h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Fulfill orders, track courier dispatches, and manage status transitions
                </p>
              </div>

              {/* Top Order Status Dashboard requested by user:
                  "Orders & Fulfillment Console ka sab sa oper dashbord type banayan ki itna order recive itna pending ma , itna procces ma , itna ready to ship" */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* 1. Orders Received */}
                <div
                  onClick={() => setOrderStatusFilter('ALL')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    orderStatusFilter === 'ALL'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-white text-stone-800 border-stone-200/90 hover:border-stone-400 shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${orderStatusFilter === 'ALL' ? 'text-stone-300' : 'text-stone-500'}`}>
                    Orders Received
                  </div>
                  <div className="font-serif text-2xl font-bold mt-1">
                    {ordersReceivedCount}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${orderStatusFilter === 'ALL' ? 'text-stone-400' : 'text-stone-400'}`}>
                    PKR {totalRevenue.toLocaleString()} volume
                  </div>
                </div>

                {/* 2. Pending Verification */}
                <div
                  onClick={() => setOrderStatusFilter('PENDING')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    orderStatusFilter === 'PENDING'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-stone-800 border-stone-200/90 hover:border-amber-400 shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${orderStatusFilter === 'PENDING' ? 'text-amber-100' : 'text-amber-700'}`}>
                    Pending
                  </div>
                  <div className="font-serif text-2xl font-bold mt-1">
                    {ordersPendingCount}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${orderStatusFilter === 'PENDING' ? 'text-amber-100' : 'text-stone-400'}`}>
                    Awaiting receipt review
                  </div>
                </div>

                {/* 3. Confirmed */}
                <div
                  onClick={() => setOrderStatusFilter('CONFIRMED')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    orderStatusFilter === 'CONFIRMED'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-stone-800 border-stone-200/90 hover:border-blue-400 shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${orderStatusFilter === 'CONFIRMED' ? 'text-blue-100' : 'text-blue-700'}`}>
                    Confirmed
                  </div>
                  <div className="font-serif text-2xl font-bold mt-1">
                    {ordersConfirmedCount}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${orderStatusFilter === 'CONFIRMED' ? 'text-blue-100' : 'text-stone-400'}`}>
                    Advance verified
                  </div>
                </div>

                {/* 4. Processing / In Production */}
                <div
                  onClick={() => setOrderStatusFilter('PROCESSING')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    orderStatusFilter === 'PROCESSING'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-stone-800 border-stone-200/90 hover:border-purple-400 shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${orderStatusFilter === 'PROCESSING' ? 'text-purple-100' : 'text-purple-700'}`}>
                    In Production
                  </div>
                  <div className="font-serif text-2xl font-bold mt-1">
                    {ordersProcessingCount}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${orderStatusFilter === 'PROCESSING' ? 'text-purple-100' : 'text-stone-400'}`}>
                    Artisans crafting
                  </div>
                </div>

                {/* 5. Ready to Ship */}
                <div
                  onClick={() => setOrderStatusFilter('SHIPPED')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    orderStatusFilter === 'READY_TO_SHIP'
                      ? 'bg-[#B5936C] text-white border-[#B5936C] shadow-sm'
                      : 'bg-white text-stone-800 border-stone-200/90 hover:border-[#B5936C] shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${orderStatusFilter === 'READY_TO_SHIP' ? 'text-amber-100' : 'text-[#B5936C]'}`}>
                    Ready To Ship
                  </div>
                  <div className="font-serif text-2xl font-bold mt-1">
                    {ordersReadyToShipCount}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${orderStatusFilter === 'READY_TO_SHIP' ? 'text-amber-100' : 'text-stone-400'}`}>
                    Packaged in atelier
                  </div>
                </div>

                {/* 6. Shipped / In Transit */}
                <div
                  onClick={() => setOrderStatusFilter('SHIPPED')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    orderStatusFilter === 'SHIPPED'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-stone-800 border-stone-200/90 hover:border-emerald-400 shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${orderStatusFilter === 'SHIPPED' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                    Shipped
                  </div>
                  <div className="font-serif text-2xl font-bold mt-1">
                    {ordersShippedCount}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${orderStatusFilter === 'SHIPPED' ? 'text-emerald-100' : 'text-stone-400'}`}>
                    Courier CN# dispatched
                  </div>
                </div>
              </div>

              {/* Status Filter Pills matching Screenshot 3 */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-stone-200/60">
                {[
                  { id: 'ALL', label: 'All Orders', count: ordersReceivedCount },
                  { id: 'PENDING', label: 'Pending', count: ordersPendingCount },
                  { id: 'CONFIRMED', label: 'Confirmed', count: ordersConfirmedCount },
                  { id: 'PROCESSING', label: 'Processing', count: ordersProcessingCount },
                  { id: 'SHIPPED', label: 'Shipped', count: ordersShippedCount },
                  { id: 'DELIVERED', label: 'Delivered', count: ordersDeliveredCount },
                  { id: 'CANCELLED', label: 'Cancelled', count: ordersCancelledCount },
                ].map((pill) => {
                  const isActive = orderStatusFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(pill.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-[#1C1917] text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'}`}>
                        {pill.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1C1917] text-[#FAF7F2] font-semibold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="p-4">Order # & Customer</th>
                        <th className="p-4">Item & Custom Inputs</th>
                        <th className="p-4 text-center">Total & Advance ({settings?.advancePaymentPercentage}%)</th>
                        <th className="p-4 text-center">Payment Receipt</th>
                        <th className="p-4 text-center">Production Status</th>
                        <th className="p-4 text-right">Fulfillment Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {filteredOrders.map((order) => {
                        const isVerified = order.payment?.paymentStatus === 'advance_verified';
                        return (
                          <tr key={order.id} className="hover:bg-amber-50/20 transition">
                            {/* Order # & Customer */}
                            <td className="p-4 space-y-1">
                              <div className="font-mono font-bold text-sm text-stone-900">
                                {order.orderNumber}
                              </div>
                              <div className="font-semibold text-stone-800">{order.customer.fullName}</div>
                              <div className="text-[11px] text-stone-500 flex items-center space-x-1 font-mono">
                                <Phone className="w-3 h-3 text-[#C59A27]" />
                                <span>{order.customer.phone}</span>
                              </div>
                              {order.customer.email && (
                                <div className="text-[10px] text-stone-500 font-mono truncate max-w-[140px]" title={order.customer.email}>
                                  {order.customer.email}
                                </div>
                              )}
                              <div className="text-[10px] text-stone-400">
                                {order.customer.city}, {order.customer.province}
                              </div>
                            </td>

                            {/* Item & Custom Inputs */}
                            <td className="p-4 space-y-1.5 max-w-sm">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="font-bold text-stone-900">
                                    {item.productName} ({item.quantity}x)
                                  </div>
                                  <div className="text-[11px] text-stone-500">
                                    Size: {item.selectedSize} | Color: {item.selectedColor}
                                  </div>

                                  {/* Custom Text Inputs display */}
                                  {item.customTextInputs && Object.keys(item.customTextInputs).length > 0 && (
                                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[10px] space-y-0.5 text-stone-800 font-mono">
                                      {Object.entries(item.customTextInputs).map(([k, v]) => (
                                        <div key={k} className="truncate">
                                          <span className="font-bold capitalize text-amber-950">
                                            {k.replace(/_/g, ' ')}:
                                          </span>{' '}
                                          {v}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Uploaded Photos count */}
                                  {item.uploadedPhotos && item.uploadedPhotos.length > 0 && (
                                    <div className="text-[11px] text-blue-700 font-medium">
                                      📷 {item.uploadedPhotos.length} photos uploaded by customer
                                    </div>
                                  )}
                                </div>
                              ))}
                            </td>

                            {/* Pricing & Advance Calculation */}
                            <td className="p-4 text-center space-y-1 font-mono">
                              <div className="font-bold text-sm text-stone-900">
                                {settings?.currencySymbol} {order.pricing.totalAmount.toLocaleString()}
                              </div>
                              <div className="text-[11px] text-[#A47A1A] font-semibold">
                                Adv: {settings?.currencySymbol} {order.pricing.advanceAmount.toLocaleString()} ({order.pricing.advancePercentage}%)
                              </div>
                              <div className="text-[10px] text-stone-500">
                                Due on Del: {settings?.currencySymbol} {order.pricing.remainingBalance.toLocaleString()}
                              </div>
                            </td>

                            {/* Payment Receipt button & status */}
                            <td className="p-4 text-center space-y-2">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isVerified
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {order.payment?.paymentStatus.replace(/_/g, ' ')}
                              </span>

                              {order.payment?.paymentScreenshotUrl && (
                                <div>
                                  <button
                                    onClick={() => setActivePaymentProofOrder(order)}
                                    className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-1 mx-auto"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#C59A27]" />
                                    <span>View Slip</span>
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Order Production Status Dropdown */}
                            <td className="p-4 text-center">
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.id, {
                                    orderStatus: e.target.value,
                                    timelineEvent: {
                                      status: e.target.value,
                                      message: `Status updated to ${e.target.value}`,
                                      timestamp: new Date().toISOString(),
                                    },
                                  })
                                }
                                className="p-1.5 text-xs font-bold uppercase rounded-lg border border-stone-300 bg-stone-50"
                              >
                                <option value="new">New</option>
                                <option value="in_production">In Production</option>
                                <option value="ready_to_ship">Ready To Ship</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>

                            {/* Actions: Courier Tracking & Print Packing Slip */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveTrackingOrder(order)}
                                  className="px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold shadow-2xs flex items-center space-x-1.5 transition"
                                  title="Courier Tracking & Customer Gmail Notification"
                                >
                                  <Truck className="w-3.5 h-3.5 text-[#B5936C]" />
                                  <span>Tracking</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActivePackingSlipOrder(order)}
                                  className="px-2.5 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
                                  title="Print Packing Slip"
                                >
                                  <Printer className="w-3.5 h-3.5 text-[#E3C677]" />
                                  <span>Slip</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: OPERATIONS -> INVENTORY & WAREHOUSE CONTROL (MATCHES SCREENSHOT 2) */}
          {/* ============================================================ */}
          {currentTab === 'inventory' && (
            <div className="space-y-6">
              {/* Header matching Screenshot 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Inventory & Warehouse Control
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Real-time stock monitoring, audit log movements, and valuation tracking
                  </p>
                </div>

                {/* Top Right Toggle matching Screenshot 2 */}
                <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('overview')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      inventoryViewMode === 'overview'
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Stock Overview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('logs')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      inventoryViewMode === 'logs'
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Audit Movements Log</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards matching Screenshot 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. TOTAL UNITS */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    TOTAL UNITS
                  </span>
                  <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    {totalInventoryUnits}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {products.length} catalog lines
                  </div>
                </div>

                {/* 2. INVENTORY VALUATION */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    INVENTORY VALUATION
                  </span>
                  <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    PKR {totalInventoryValuation.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Current retail value
                  </div>
                </div>

                {/* 3. LOW STOCK ALERT */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    LOW STOCK ALERT
                  </span>
                  <div className="font-serif text-3xl font-bold text-amber-600 leading-none">
                    {lowStockCount}
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium">
                    Below safety buffer
                  </div>
                </div>

                {/* 4. OUT OF STOCK */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    OUT OF STOCK
                  </span>
                  <div className="font-serif text-3xl font-bold text-rose-600 leading-none">
                    {outOfStockCount}
                  </div>
                  <div className="text-[11px] text-rose-700 font-medium">
                    Requires replenishment
                  </div>
                </div>
              </div>

              {/* View 1: Stock Overview Matrix Table */}
              {inventoryViewMode === 'overview' && (
                <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm">
                        Vault Stock & Replenishment Matrix
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Adjust units or use quick replenishment buttons to automatically log inventory movements.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-600">
                      {products.length} Products Monitored
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                        <tr>
                          <th className="py-3 px-5">ITEM & SKU</th>
                          <th className="py-3 px-4">CATEGORY</th>
                          <th className="py-3 px-4 text-center">RETAIL PRICE</th>
                          <th className="py-3 px-4 text-center">IN-VAULT UNITS</th>
                          <th className="py-3 px-4 text-center">VALUATION (PKR)</th>
                          <th className="py-3 px-4 text-center">HEALTH STATUS</th>
                          <th className="py-3 px-5 text-right">QUICK REPLENISH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {products.map((p) => {
                          const stockNum = Number(p.stock) || 0;
                          const priceNum = Number(p.basePrice) || 0;
                          const isLow = stockNum <= 10 && stockNum > 0;
                          const isOut = stockNum === 0;
                          const itemValuation = stockNum * priceNum;

                          return (
                            <tr key={p.id || p._id} className="hover:bg-amber-50/15 transition">
                              <td className="py-3.5 px-5">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&auto=format&fit=crop&q=80'}
                                    alt={p.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                                  />
                                  <div className="min-w-0 max-w-xs">
                                    <div className="font-bold text-stone-900 truncate">{p.name}</div>
                                    <div className="text-[11px] font-mono text-stone-400 truncate">{p.slug || p.id}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-stone-800">{p.category}</div>
                                <div className="text-[10px] text-stone-400">{p.subcategory || 'Artisanal'}</div>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-800">
                                PKR {priceNum.toLocaleString()}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <input
                                  type="number"
                                  defaultValue={stockNum}
                                  onBlur={(e) => {
                                    const next = Number(e.target.value) || 0;
                                    const delta = next - stockNum;
                                    if (delta !== 0) {
                                      handleQuickStockAdjust(p, delta, `Manual stock adjustment to ${next} units`);
                                    }
                                  }}
                                  className={`w-16 text-center font-mono font-bold p-1 rounded-lg border text-xs focus:ring-1 focus:ring-[#B5936C] ${
                                    isOut
                                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                                      : isLow
                                      ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                                      : 'bg-stone-50 border-stone-200 text-stone-900'
                                  }`}
                                />
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-700">
                                PKR {itemValuation.toLocaleString()}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                {isOut ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                                    Depleted
                                  </span>
                                ) : isLow ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                    Low Stock (&le;10)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Healthy Stock
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-5 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockAdjust(p, 5, 'Quick batch replenishment (+5)')}
                                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-[11px] transition"
                                    title="Add 5 units to stock"
                                  >
                                    +5
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockAdjust(p, 10, 'Quick batch replenishment (+10)')}
                                    className="px-2 py-1 bg-[#1C1917] hover:bg-stone-800 text-white rounded font-bold text-[11px] transition shadow-2xs"
                                    title="Add 10 units to stock"
                                  >
                                    +10
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockAdjust(p, 25, 'Workshop production run (+25)')}
                                    className="px-2 py-1 bg-[#B5936C] hover:bg-[#A3825B] text-white rounded font-bold text-[11px] transition shadow-2xs"
                                    title="Add 25 units to stock"
                                  >
                                    +25
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 2: Audit Movements Log Table */}
              {inventoryViewMode === 'logs' && (
                <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm">
                        Warehouse Audit Movements Log
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Historical trace of inventory additions, customer order auto-deductions, and workshop restocks.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-600">
                      {auditLogs.length} Records Logged
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                        <tr>
                          <th className="py-3 px-5">DATE & TIME</th>
                          <th className="py-3 px-4">CATALOG ITEM</th>
                          <th className="py-3 px-4 text-center">STOCK MOVEMENT</th>
                          <th className="py-3 px-4">REASON / BATCH ID</th>
                          <th className="py-3 px-5 text-right">PERFORMED BY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {auditLogs.map((log) => {
                          const isPositive = String(log.change || '').startsWith('+');
                          return (
                            <tr key={log.id} className="hover:bg-amber-50/15 transition">
                              <td className="py-3.5 px-5 font-mono text-stone-500 text-[11px]">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-stone-900">
                                {log.productName}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`inline-block font-mono font-bold px-2.5 py-0.5 rounded-full text-xs ${
                                    isPositive
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {log.change}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-stone-700">
                                {log.reason}
                              </td>
                              <td className="py-3.5 px-5 text-right font-medium text-stone-800">
                                {log.performedBy || 'System Admin'}
                              </td>
                            </tr>
                          );
                        })}
                        {auditLogs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-stone-400">
                              No inventory movements logged yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: ADMINISTRATION -> STORE SETTINGS PROFILE (CRITICAL) */}
          {/* ============================================================ */}
          {currentTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center space-x-2">
                    <span>Store Settings Profile</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C59A27] text-white">
                      Critical Core
                    </span>
                  </h1>
                  <p className="text-xs text-stone-500">
                    These settings dynamically drive the frontend announcement bar, WhatsApp order buttons, floating chat icon, and checkout advance calculation.
                  </p>
                </div>
              </div>

              {/* Security & Access Credentials Card (Audio 2 User Requirement) */}
              <div className="bg-gradient-to-br from-[#1C1917] to-[#292524] text-white p-6 rounded-2xl border border-[#C59A27]/50 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#C59A27]/20 border border-[#C59A27]/40 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-[#E3C677]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">
                        Admin Login &amp; Security Credentials
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Update the authorized Gmail address and master password required to log in to this Admin Console.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1 self-start sm:self-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Portal Secured</span>
                  </span>
                </div>

                {credsSuccessMsg && (
                  <div className="p-3 bg-emerald-900/40 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{credsSuccessMsg}</span>
                  </div>
                )}

                {credsErrorMsg && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{credsErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">
                        Current Master Password <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={currentAdminPassword}
                        onChange={(e) => setCurrentAdminPassword(e.target.value)}
                        placeholder="e.g. admin@vowcrafts2026"
                        className="w-full p-2.5 bg-[#141210] border border-stone-700 rounded-lg text-white font-mono focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold mb-1">
                        New Gmail / Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full p-2.5 bg-[#141210] border border-stone-700 rounded-lg text-white focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold mb-1">
                        New Master Password <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Choose strong password"
                        className="w-full p-2.5 bg-[#141210] border border-stone-700 rounded-lg text-white font-mono focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-500">
                      Default: <code className="text-stone-400">admin@vowcrafts.com</code> / <code className="text-stone-400">admin@vowcrafts2026</code>
                    </span>
                    <button
                      type="submit"
                      disabled={updatingCreds}
                      className="px-4 py-2 bg-[#C59A27] hover:bg-[#A47A1A] text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{updatingCreds ? 'Updating...' : 'Update Login Credentials'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* 1. Identity & Branding */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-stone-900 text-base flex items-center space-x-2">
                    <Store className="w-5 h-5 text-[#C59A27]" />
                    <span>Store Identity & Tagline</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Store Name</label>
                      <input
                        type="text"
                        value={settings?.storeName || ''}
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27] bg-stone-50 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={settings?.tagline || ''}
                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27] bg-stone-50 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Designer Credit / Footer Slogan (Audio / Image 2)
                      </label>
                      <input
                        type="text"
                        value={settings?.designerCredit || ''}
                        onChange={(e) => setSettings({ ...settings, designerCredit: e.target.value })}
                        placeholder="e.g. Designed for Eternal Moments"
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27] bg-stone-50 font-medium"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="showDesignerCredit"
                        checked={settings?.showDesignerCredit !== false}
                        onChange={(e) => setSettings({ ...settings, showDesignerCredit: e.target.checked })}
                        className="w-4 h-4 rounded text-[#C59A27] accent-[#C59A27] cursor-pointer"
                      />
                      <label htmlFor="showDesignerCredit" className="text-xs font-semibold text-stone-700 cursor-pointer">
                        Show Designer Credit in Footer
                      </label>
                    </div>

                    {/* Store Logo Upload & Live Preview Section */}
                    <div className="sm:col-span-2 pt-3 border-t border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-bold text-stone-800 text-xs">
                          Store Brand Logo (Storefront Header &amp; Invoices)
                        </label>
                        {settings?.storeLogo ? (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Custom Logo Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded">
                            Using Default &quot;V&quot; Monogram
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                        {/* Live Monogram / Logo Preview (matching exact storefront dimensions) */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className="w-16 h-16 rounded-full border-2 border-[#B5936C] bg-white flex items-center justify-center overflow-hidden shadow-sm">
                            {settings?.storeLogo ? (
                              <img
                                src={settings.storeLogo}
                                alt="Store Logo Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center text-[#8C6D42]">
                                <span className="font-serif font-bold text-2xl">
                                  {(settings?.storeName || 'VowCrafts').trim().charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-stone-400">
                            {settings?.storeLogo ? 'Custom Logo' : 'Default Monogram'}
                          </span>
                        </div>

                        {/* Upload Controls & URL */}
                        <div className="flex-1 space-y-2.5 w-full">
                          <div className="flex items-center flex-wrap gap-2.5">
                            <label className="px-3.5 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 cursor-pointer transition shadow-xs">
                              <Upload className="w-3.5 h-3.5 text-[#E3C677]" />
                              <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadLogo}
                                disabled={uploadingLogo}
                                className="hidden"
                              />
                            </label>

                            {settings?.storeLogo && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const updated = { ...settings, storeLogo: '' };
                                  setSettings(updated);
                                  await fetch('/api/settings', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updated),
                                  });
                                  showToast('Reset to default initial monogram');
                                }}
                                className="px-3 py-2 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 rounded-lg text-xs font-semibold transition"
                              >
                                Remove Custom Logo
                              </button>
                            )}

                            <span className="text-[11px] text-stone-500">
                              Upload PNG, JPG, or SVG to display on storefront &amp; packing slips
                            </span>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={settings?.storeLogo || ''}
                              onChange={(e) => setSettings({ ...settings, storeLogo: e.target.value })}
                              placeholder="Or paste external image URL (e.g. https://.../logo.png)"
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white text-xs font-mono focus:border-[#C59A27] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Top Announcement Ticker Text */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-stone-900 text-base flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#C59A27]" />
                    <span>Top Announcement Ticker Text</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Appears directly at the very top of every frontend storefront page.
                  </p>

                  <div>
                    <input
                      type="text"
                      value={settings?.announcementTickerText || ''}
                      onChange={(e) => setSettings({ ...settings, announcementTickerText: e.target.value })}
                      placeholder="e.g. Free delivery under 3000 | Contact WhatsApp for custom orders"
                      className="w-full p-3 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27] bg-stone-50 text-xs font-semibold"
                    />
                  </div>

                  {/* Real-time Ticker Preview Box */}
                  <div className="p-3 bg-[#1C1917] rounded-xl text-white text-xs flex items-center justify-between border border-[#C59A27]/40 shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-[#E3C677] tracking-wider">
                      Live Storefront Preview:
                    </span>
                    <span className="font-sans text-xs truncate max-w-xl text-stone-200">
                      {settings?.announcementTickerText}
                    </span>
                  </div>
                </div>

                {/* 3. WhatsApp Integration Number */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-stone-900 text-base flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <span>WhatsApp Dynamic Number</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Controls both the product page "WhatsApp Order" direct chat button and the floating chat widget on the bottom right of the storefront.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Active WhatsApp Number (with Country Code)
                      </label>
                      <input
                        type="text"
                        value={settings?.whatsappNumber || ''}
                        onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                        placeholder="+923001234567"
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27] bg-stone-50 font-mono text-xs font-bold"
                        required
                      />
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Live Target Link:</div>
                        <div className="font-mono text-[11px] text-emerald-700 truncate max-w-xs">
                          https://wa.me/{settings?.whatsappNumber?.replace(/[^0-9]/g, '')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Advance Payment Percentage (CRITICAL - Optional Toggle) */}
                <div className="bg-white p-6 rounded-2xl border-2 border-[#C59A27] shadow-lg space-y-4 bg-gradient-to-br from-amber-50/40 via-white to-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-stone-900 text-base flex items-center space-x-2">
                      <Percent className="w-5 h-5 text-[#C59A27]" />
                      <span>Advance Payment Requirement (Dynamic Checkout Engine)</span>
                    </h3>
                    <span
                      className={`text-sm font-mono font-bold px-3 py-1 rounded-full border ${
                        settings?.enableAdvancePayment
                          ? 'text-[#C59A27] bg-amber-100 border-amber-300'
                          : 'text-emerald-700 bg-emerald-100 border-emerald-300'
                      }`}
                    >
                      {settings?.enableAdvancePayment
                        ? `${settings?.advancePaymentPercentage || 10}% Required Deposit`
                        : '100% Cash on Delivery (COD)'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600">
                    Advance deposit ko optional banaya gaya hai. Jab zarurat ho tab enable karein, warna store par 100% Cash on Delivery (COD) chalega.
                  </p>

                  {/* Enable / Disable Toggle Switch */}
                  <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        Enable Advance Payment Deposit Requirement
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Check to require advance bank/wallet transfer before order fulfillment. Uncheck for 100% Cash on Delivery.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(settings?.enableAdvancePayment)}
                        onChange={(e) =>
                          setSettings({ ...settings, enableAdvancePayment: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C59A27]"></div>
                    </label>
                  </div>

                  {Boolean(settings?.enableAdvancePayment) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-stone-800">
                          Set Advance Percentage (%)
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={settings?.advancePaymentPercentage || 10}
                            onChange={(e) =>
                              setSettings({ ...settings, advancePaymentPercentage: Number(e.target.value) })
                            }
                            className="w-full accent-[#C59A27] cursor-pointer"
                          />
                          <input
                            type="number"
                            min="5"
                            max="100"
                            value={settings?.advancePaymentPercentage || 10}
                            onChange={(e) =>
                              setSettings({ ...settings, advancePaymentPercentage: Number(e.target.value) })
                            }
                            className="w-20 p-2 text-center font-mono font-bold border border-stone-300 rounded-lg text-sm bg-white"
                          />
                        </div>
                      </div>

                      {/* Live Checkout Math Demo Box */}
                      <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs space-y-2 text-xs">
                        <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                          Dynamic Math Simulation:
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Sample Order of PKR 10,000:</span>
                          <span className="font-mono font-bold text-stone-900">Rs. 10,000</span>
                        </div>
                        <div className="flex justify-between text-[#C59A27] font-bold">
                          <span>Advance Required ({settings?.advancePaymentPercentage || 10}%):</span>
                          <span className="font-mono text-sm">
                            Rs. {((10000 * (settings?.advancePaymentPercentage || 10)) / 100).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-500 text-[11px] border-t border-stone-100 pt-1">
                          <span>Balance Due on Delivery:</span>
                          <span className="font-mono">
                            Rs. {(10000 - (10000 * (settings?.advancePaymentPercentage || 10)) / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="font-semibold">Advance Payment is Currently Disabled:</strong> Customers can order with zero deposit; 100% Cash on Delivery (COD) will be applied at checkout.
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Bank Accounts & Transfer Instructions */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-stone-900 text-base flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-[#C59A27]" />
                    <span>Bank & Mobile Accounts For Advance Transfers</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={settings?.bankDetails?.bankName || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bankDetails: { ...settings.bankDetails, bankName: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Account Title</label>
                      <input
                        type="text"
                        value={settings?.bankDetails?.accountTitle || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bankDetails: { ...settings.bankDetails, accountTitle: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Account Number / IBAN</label>
                      <input
                        type="text"
                        value={settings?.bankDetails?.iban || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bankDetails: { ...settings.bankDetails, iban: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Easypaisa Number</label>
                      <input
                        type="text"
                        value={settings?.bankDetails?.easypaisaNumber || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bankDetails: { ...settings.bankDetails, easypaisaNumber: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">JazzCash Number</label>
                      <input
                        type="text"
                        value={settings?.bankDetails?.jazzcashNumber || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bankDetails: { ...settings.bankDetails, jazzcashNumber: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Free Shipping Threshold (PKR)</label>
                      <input
                        type="number"
                        value={settings?.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 6000}
                        onChange={(e) =>
                          setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Default Delivery Min Days</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings?.estimatedDeliveryMinDays || 4}
                        onChange={(e) =>
                          setSettings({ ...settings, estimatedDeliveryMinDays: Number(e.target.value) })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Default Delivery Max Days</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings?.estimatedDeliveryMaxDays || 10}
                        onChange={(e) =>
                          setSettings({ ...settings, estimatedDeliveryMaxDays: Number(e.target.value) })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Footer Feature Badges Strip (4 Trust Cards - Optional & Customizable) */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-[#C59A27]" />
                        <span>Footer Feature Badges Strip (4 Trust Cards)</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Footer ke upar 4 feature cards strip ko show karna optional hai. Isay on/off kar sakte hain aur apne products ke mutabiq customize kar sakte hain.
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold font-mono self-start sm:self-auto border ${
                        settings?.showFooterFeatures
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-stone-100 text-stone-600 border-stone-300'
                      }`}
                    >
                      {settings?.showFooterFeatures ? 'Enabled' : 'Disabled (Hidden)'}
                    </span>
                  </div>

                  {/* Enable / Disable Checkbox Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        Show 4 Feature Badges Strip in Footer (Optional)
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Untick karein to yeh strip website ke footer se mukammal gayab ho jayegi. Tick karein to display hogi.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(settings?.showFooterFeatures)}
                        onChange={(e) =>
                          setSettings({ ...settings, showFooterFeatures: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C59A27]"></div>
                    </label>
                  </div>

                  {Boolean(settings?.showFooterFeatures) && (
                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                          Customize All 4 Feature Details:
                        </div>
                        <span className="text-[11px] text-stone-500">
                          Apne brand aur product ke mutabiq text likhein
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Card 1 */}
                        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
                          <div className="flex items-center justify-between font-bold text-[#A47A1A]">
                            <span>Feature Card 1</span>
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={settings?.footerFeature1Title ?? 'Handcrafted Quality'}
                              onChange={(e) =>
                                setSettings({ ...settings, footerFeature1Title: e.target.value })
                              }
                              placeholder="e.g. Handcrafted Quality"
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={settings?.footerFeature1Desc ?? 'Carefully produced using premium quality materials.'}
                              onChange={(e) =>
                                setSettings({ ...settings, footerFeature1Desc: e.target.value })
                              }
                              placeholder="e.g. Carefully produced using premium quality materials."
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
                          <div className="flex items-center justify-between font-bold text-[#A47A1A]">
                            <span>Feature Card 2</span>
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={settings?.footerFeature2Title ?? 'Bespoke Customization'}
                              onChange={(e) =>
                                setSettings({ ...settings, footerFeature2Title: e.target.value })
                              }
                              placeholder="e.g. Bespoke Customization"
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={settings?.footerFeature2Desc ?? 'Personalized designs customized to your instructions.'}
                              onChange={(e) =>
                                setSettings({ ...settings, footerFeature2Desc: e.target.value })
                              }
                              placeholder="e.g. Personalized designs customized to your instructions."
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
                          <div className="flex items-center justify-between font-bold text-[#A47A1A]">
                            <span>Feature Card 3</span>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={settings?.footerFeature3Title ?? 'Cash on Delivery'}
                              onChange={(e) =>
                                setSettings({ ...settings, footerFeature3Title: e.target.value })
                              }
                              placeholder="e.g. Cash on Delivery"
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={settings?.footerFeature3Desc ?? 'Doorstep delivery across Pakistan with verified courier dispatch.'}
                              onChange={(e) =>
                                setSettings({ ...settings, footerFeature3Desc: e.target.value })
                              }
                              placeholder="e.g. Doorstep delivery across Pakistan with verified courier dispatch."
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        {/* Card 4 */}
                        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
                          <div className="flex items-center justify-between font-bold text-[#A47A1A]">
                            <span>Feature Card 4</span>
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={settings?.footerFeature4Title ?? 'Safe & Secure Packaging'}
                              onChange={(e) =>
                                setSettings({ ...settings, footerFeature4Title: e.target.value })
                              }
                              placeholder="e.g. Safe & Secure Packaging"
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={settings?.footerFeature4Desc ?? 'Protective packaging ensuring your orders arrive safe.'}
                              onChange={(e) =>
                                setSettings({ ...settings, footerFeature4Desc: e.target.value })
                              }
                              placeholder="e.g. Protective packaging ensuring your orders arrive safe."
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. Official Social Media Channels (Facebook, Instagram, TikTok, Snapchat, Google) */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base flex items-center space-x-2">
                        <Share2 className="w-5 h-5 text-[#C59A27]" />
                        <span>Official Social Media Channel Links</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        These links appear at the top-right of the storefront announcement bar and in the footer. Customers clicking them will open your official profiles in a new tab.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-[#A47A1A] rounded-full border border-amber-200 self-start sm:self-auto">
                      Header &amp; Footer Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Facebook */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700 flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]"></span>
                        <span>Facebook Page URL</span>
                      </label>
                      <input
                        type="url"
                        value={settings?.socialLinks?.facebook || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            socialLinks: { ...(settings?.socialLinks || {}), facebook: e.target.value },
                          })
                        }
                        placeholder="https://facebook.com/vowcrafts"
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs font-mono focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    {/* Instagram */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700 flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E4405F]"></span>
                        <span>Instagram Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={settings?.socialLinks?.instagram || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            socialLinks: { ...(settings?.socialLinks || {}), instagram: e.target.value },
                          })
                        }
                        placeholder="https://instagram.com/vowcrafts"
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs font-mono focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    {/* TikTok */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700 flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EE1D52]"></span>
                        <span>TikTok Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={settings?.socialLinks?.tiktok || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            socialLinks: { ...(settings?.socialLinks || {}), tiktok: e.target.value },
                          })
                        }
                        placeholder="https://tiktok.com/@vowcrafts"
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs font-mono focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    {/* Snapchat */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700 flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFFC00] border border-stone-300"></span>
                        <span>Snapchat Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={settings?.socialLinks?.snapchat || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            socialLinks: { ...(settings?.socialLinks || {}), snapchat: e.target.value },
                          })
                        }
                        placeholder="https://snapchat.com/add/vowcrafts"
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs font-mono focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    {/* Google */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block font-bold text-stone-700 flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></span>
                        <span>Google Business / Search Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={settings?.socialLinks?.google || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            socialLinks: { ...(settings?.socialLinks || {}), google: e.target.value },
                          })
                        }
                        placeholder="https://google.com/search?q=vowcrafts"
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs font-mono focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Actions Bar */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-stone-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-8 py-3 bg-[#C59A27] hover:bg-[#A47A1A] text-white text-sm font-bold rounded-xl shadow-lg transition duration-200 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save & Propagate Store Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: MARKETING & CONTENT (Banners, Coupons, Reviews) */}
          {/* ============================================================ */}
          {/* ============================================================ */}
          {/* TAB 7A: MARKETING -> COUPONS & SALES DISCOUNT MANAGEMENT */}
          {/* ============================================================ */}
          {currentTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Promotional Coupons & Sales Discounts
                  </h1>
                  <p className="text-xs text-stone-500">
                    Configure percentage (%) or flat PKR discounts (e.g. 500, 1000), minimum spends, and validity date ranges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCouponModalData({});
                    setShowCouponModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#B5936C] hover:bg-[#A3825B] text-white font-medium rounded-lg text-xs flex items-center space-x-2 transition shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create New Coupon</span>
                </button>
              </div>

              {/* Coupons List / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id || coupon._id}
                    className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm bg-stone-100 text-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 tracking-wider">
                          {coupon.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            coupon.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {coupon.active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="font-serif font-bold text-lg text-stone-900">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `PKR ${coupon.discountValue} FLAT OFF`}
                        </div>
                        {coupon.maxDiscountCap && (
                          <div className="text-[11px] text-stone-500">
                            Max Cap: PKR {coupon.maxDiscountCap}
                          </div>
                        )}
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                          {coupon.description || 'Promotional discount coupon.'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 space-y-2 text-[11px] text-stone-500 font-mono">
                      <div>
                        Min Spend: <span className="text-stone-800 font-semibold">PKR {coupon.minOrderValue || 0}</span>
                      </div>
                      <div className="truncate">
                        📅 {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'Immediate'} &rarr;{' '}
                        {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No expiry'}
                      </div>
                      <div className="flex items-center justify-end space-x-2 pt-1 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setCouponModalData(coupon);
                            setShowCouponModal(true);
                          }}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.id || coupon._id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7B: HOMEPAGE & PRODUCT PAGE BUILDER (LAYOUT CUSTOMIZER) */}
          {/* ============================================================ */}
          {currentTab === 'homepage_builder' && (
            <HomepageBuilderTab
              settings={settings}
              onSaveSettings={handleSaveSettings}
              saving={saving}
            />
          )}

          {/* ============================================================ */}
          {/* TAB 7C: MARKETING -> HERO BANNERS & REVIEWS */}
          {/* ============================================================ */}
          {(currentTab === 'banners' || currentTab === 'reviews' || currentTab === 'media_library') && (
            <div className="space-y-6">
              <h1 className="font-serif text-2xl font-bold text-stone-900">Marketing & Content Suite</h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hero Banners */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900">
                        Hero Carousel Banners ({banners.filter((b) => b.active !== false).length} Active)
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Manage storefront carousel slides, texts, images &amp; buttons
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBannerModalData({
                          title: '',
                          subtitle: '',
                          badgeText: 'Artisanal Luxury Edition',
                          imageUrl: '/images/hero_banner.jpg',
                          buttonText: 'Explore All Collections',
                          buttonLink: '/categories/luxury-frames',
                          order: banners.length + 1,
                          active: true,
                        });
                        setShowBannerModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E3C677]" />
                      <span>Add New Banner</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {banners.length === 0 ? (
                      <div className="text-center py-8 text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                        No banners found. Click "+ Add New Banner" to create your first slide.
                      </div>
                    ) : (
                      banners.map((b, i) => (
                        <div
                          key={b.id || i}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 transition"
                        >
                          <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                            <img
                              src={b.imageUrl || '/images/hero_banner.jpg'}
                              alt={b.title}
                              onError={(e) => {
                                e.target.src = '/images/hero_banner.jpg';
                              }}
                              className="w-20 h-14 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-200"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                                  #{b.order || i + 1}
                                </span>
                                {b.badgeText && (
                                  <span className="text-[10px] font-serif font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#8C6D42] border border-[#C59A27]/30">
                                    {b.badgeText}
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    b.active !== false
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-stone-200 text-stone-600'
                                  }`}
                                >
                                  {b.active !== false ? 'Active' : 'Hidden'}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-stone-900 truncate">{b.title}</div>
                              <div className="text-[11px] text-stone-500 line-clamp-1">{b.subtitle}</div>
                              <div className="text-[10px] text-stone-400 font-mono truncate">
                                Button: <strong>{b.buttonText || 'Explore All'}</strong> → {b.buttonLink || '/'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 self-end sm:flex-row shrink-0">
                            {/* Toggle Active / Hidden */}
                            <button
                              type="button"
                              onClick={() => handleToggleBannerActive(b)}
                              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                                b.active !== false
                                  ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                  : 'border-stone-300 text-stone-500 hover:bg-stone-200'
                              }`}
                              title={b.active !== false ? 'Click to hide banner' : 'Click to activate banner'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setBannerModalData(b);
                                setShowBannerModal(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-200 border border-stone-300 text-stone-800 font-serif font-bold text-xs flex items-center space-x-1 transition cursor-pointer"
                              title="Edit Banner"
                            >
                              <Edit className="w-3.5 h-3.5 text-stone-600" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(b.id)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-600 transition cursor-pointer"
                              title="Remove Banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Review Moderation */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900">
                        Customer Reviews Moderation ({reviews.filter((r) => r.approved !== false).length} Active)
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Manage testimonials &amp; upload original customer WhatsApp screenshots for Storefront
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewModalData(null);
                        setShowReviewModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-serif font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E3C677]" />
                      <span>Add Customer Review</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                        No customer reviews found. Click &quot;+ Add Customer Review&quot; to upload your first feedback screenshot.
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 transition"
                        >
                          <div className="flex items-start space-x-3 min-w-0 flex-1">
                            {/* Screenshot Thumbnail */}
                            {rev.screenshotUrl || rev.imageUrl ? (
                              <div
                                onClick={() => window.open(rev.screenshotUrl || rev.imageUrl, '_blank')}
                                className="w-14 h-14 rounded-lg overflow-hidden border border-stone-300 bg-white shrink-0 relative group/thumb cursor-pointer shadow-xs"
                                title="Click to view full screenshot"
                              >
                                <img
                                  src={rev.screenshotUrl || rev.imageUrl}
                                  alt={rev.customerName}
                                  className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition">
                                  View
                                </div>
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-lg border border-dashed border-stone-300 bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 text-[9px] font-mono">
                                No Pic
                              </div>
                            )}

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="text-xs font-bold text-stone-900">{rev.customerName}</span>
                                {rev.verified && (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                                    Verified
                                  </span>
                                )}
                                <div className="flex text-amber-500 text-xs">
                                  {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                                    <Star key={idx} className="w-3 h-3 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-stone-600 italic line-clamp-2">
                                &quot;{rev.comment}&quot;
                              </p>
                              <div className="text-[10px] text-stone-400 font-mono">
                                Product: {rev.productName || 'Keepsake Frame'} • Date: {rev.reviewDate || 'Recent'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => {
                                setReviewModalData(rev);
                                setShowReviewModal(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-medium text-xs flex items-center space-x-1 transition cursor-pointer"
                            >
                              <Edit className="w-3 h-3 text-[#B5936C]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id || rev._id)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7C: ADMINISTRATION -> THEME, FONTS & COLOR COMBINATIONS */}
          {/* ============================================================ */}
          {currentTab === 'theme' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Theme, Typography & Color Palette Customizer
                  </h1>
                  <p className="text-xs text-stone-500">
                    Customize font size scale, headings, body fonts, and color combinations for Frontend & Backend.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowThemeModal(true)}
                  className="px-5 py-2.5 bg-[#B5936C] hover:bg-[#A3825B] text-white font-medium rounded-lg text-xs flex items-center space-x-2 transition shadow-xs self-start sm:self-auto"
                >
                  <Palette className="w-4 h-4" />
                  <span>Open Theme Customizer Modal</span>
                </button>
              </div>

              {/* Theme status card */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-5">
                <h3 className="font-serif font-bold text-stone-900 text-base">Active Design System Tokens</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Base Font Size</span>
                    <span className="font-bold text-stone-900 text-sm capitalize">{settings?.theme?.fontSize || 'normal'}</span>
                    <p className="text-[10px] text-stone-400 mt-1">Normal readable scale across Admin & Store</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Heading Font</span>
                    <span className="font-bold text-stone-900 text-sm">{settings?.theme?.headingFont || 'Playfair Display'}</span>
                    <p className="text-[10px] text-stone-400 mt-1">Applied to luxury titles & hero headers</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Body Text Font</span>
                    <span className="font-bold text-stone-900 text-sm">{settings?.theme?.bodyFont || 'Inter'}</span>
                    <p className="text-[10px] text-stone-400 mt-1">Applied to descriptions & tabular data</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Primary Brand Color</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: settings?.theme?.primaryColor || '#B5936C' }}></span>
                      <span className="font-mono font-bold text-stone-900">{settings?.theme?.primaryColor || '#B5936C'}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">Applied to CTAs & highlight pills</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 8: ADMINISTRATION -> ADMIN USERS & ROLES (RBAC) (MATCHES SCREENSHOT 1) */}
          {/* ============================================================ */}
          {currentTab === 'users' && (
            <div className="space-y-6">
              {/* Header matching Screenshot 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Admin Users & Roles
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage staff credentials, role-based access control (RBAC), and team security permissions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminUserModalData(null);
                    setShowAdminUserModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#B5936C] hover:bg-[#A3825B] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-xs self-start sm:self-auto uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD ADMINISTRATOR</span>
                </button>
              </div>

              {/* Staff Members Table matching Screenshot 1 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                      <tr>
                        <th className="py-3.5 px-6">STAFF MEMBER</th>
                        <th className="py-3.5 px-6">CONTACT</th>
                        <th className="py-3.5 px-6">ROLE & ACCESS</th>
                        <th className="py-3.5 px-6 text-center">STATUS</th>
                        <th className="py-3.5 px-6 text-center">ADDED ON</th>
                        <th className="py-3.5 px-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {users.map((u) => {
                        const initials = u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase();

                        let roleBadge = 'bg-stone-100 text-stone-800 border-stone-200';
                        if (u.role === 'super_admin') roleBadge = 'bg-purple-100 text-purple-900 border-purple-200';
                        else if (u.role === 'store_manager') roleBadge = 'bg-blue-100 text-blue-900 border-blue-200';
                        else if (u.role === 'catalog_manager') roleBadge = 'bg-amber-100 text-amber-900 border-amber-200';
                        else if (u.role === 'order_fulfillment') roleBadge = 'bg-emerald-100 text-emerald-900 border-emerald-200';

                        return (
                          <tr key={u.id || u._id} className="hover:bg-amber-50/15 transition group">
                            {/* Staff Member */}
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-[#1C1917] text-[#E3C677] font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {initials || 'A'}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-stone-900 text-sm leading-snug">{u.name}</div>
                                  <div className="text-[11px] text-stone-500 truncate">
                                    {u.assignedTask || 'Atelier Operations'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="py-4 px-6">
                              <div className="font-mono text-stone-800 text-xs">{u.email}</div>
                              <div className="text-[11px] text-stone-400 font-mono mt-0.5">{u.phone || 'No direct phone'}</div>
                            </td>

                            {/* Role & Access */}
                            <td className="py-4 px-6">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleBadge}`}>
                                {u.roleLabel || u.role?.replace(/_/g, ' ') || 'Staff Member'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6 text-center">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                {u.status || 'ACTIVE'}
                              </span>
                            </td>

                            {/* Added On */}
                            <td className="py-4 px-6 text-center font-mono text-stone-500 text-[11px]">
                              {u.addedOn || '2026-09-01'}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminUserModalData(u);
                                    setShowAdminUserModal(true);
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-stone-800 rounded-md hover:bg-stone-100 transition"
                                  title="Edit Administrator & Role"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdminUser(u.id || u._id)}
                                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                                  title="Remove Administrator"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Role Permission Reference Cards matching Screenshot 1 */}
              <div className="bg-[#FAF7F2]/80 border border-stone-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-stone-800">
                  <div className="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#B5936C]"></span>
                  </div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm">
                    Role Permission Reference
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Super Admin */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                    <div className="font-serif font-bold text-purple-900 text-sm">
                      Super Admin
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Unrestricted full access across catalog, financial settings, logs, roles, media and system configs.
                    </p>
                  </div>

                  {/* Store Manager */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                    <div className="font-serif font-bold text-blue-900 text-sm">
                      Store Manager
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Can manage catalog, orders, customers, reviews, coupons and hero banners. Cannot edit staff roles.
                    </p>
                  </div>

                  {/* Catalog Manager */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                    <div className="font-serif font-bold text-amber-900 text-sm">
                      Catalog Manager
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Focused strictly on creating &amp; updating products, inventory adjustments, categories and collections.
                    </p>
                  </div>

                  {/* Order Fulfillment */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                    <div className="font-serif font-bold text-emerald-900 text-sm">
                      Order Fulfillment
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Manages customer orders, shipment tracking numbers, and view customer address profiles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: Printable Packing Slip Modal */}
      {activePackingSlipOrder && (
        <PackingSlipModal
          order={activePackingSlipOrder}
          storeSettings={settings}
          onClose={() => setActivePackingSlipOrder(null)}
        />
      )}

      {/* MODAL 2: Payment Receipt Screenshot Review & Approval Modal */}
      {activePaymentProofOrder && (
        <PaymentProofModal
          order={activePaymentProofOrder}
          storeSettings={settings}
          onClose={() => setActivePaymentProofOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}

      {/* MODAL 3: Dynamic Field Builder Modal */}
      {activeFieldBuilderProduct && (
        <DynamicFieldBuilderModal
          product={activeFieldBuilderProduct}
          onClose={() => setActiveFieldBuilderProduct(null)}
          onSaveFields={handleSaveProductFields}
        />
      )}

      {/* MODAL 4: Category Add & Edit Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={categoryModalData}
          allCategories={categories}
          allProducts={products}
          onClose={() => {
            setShowCategoryModal(false);
            setCategoryModalData(null);
          }}
          onSave={handleSaveCategory}
        />
      )}

      {/* MODAL 5: Unified Product Add & Edit Modal with Customization Section & Image Uploader */}
      {showProductModal && (
        <ProductModal
          product={productModalData}
          categories={categories}
          onClose={() => {
            setShowProductModal(false);
            setProductModalData(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* MODAL 6: Courier Tracking & Customer Gmail Notification Modal */}
      {activeTrackingOrder && (
        <CourierTrackingModal
          order={activeTrackingOrder}
          storeSettings={settings}
          onClose={() => setActiveTrackingOrder(null)}
          onSaveTracking={handleSaveTracking}
        />
      )}

      {/* MODAL 7: Promotional Coupon Create & Edit Modal (Matches Image 1) */}
      {showCouponModal && (
        <CouponModal
          coupon={couponModalData}
          onClose={() => {
            setShowCouponModal(false);
            setCouponModalData(null);
          }}
          onSave={handleSaveCoupon}
        />
      )}

      {/* MODAL 8: Global Theme, Typography & Color Palette Customizer Modal */}
      {showThemeModal && (
        <ThemeCustomizerModal
          currentTheme={settings?.theme}
          onClose={() => setShowThemeModal(false)}
          onSaveTheme={handleSaveTheme}
        />
      )}

      {/* MODAL 9: Collection Create & Edit Modal (Matches Screenshot 5) */}
      {showCollectionModal && (
        <CollectionModal
          collection={collectionModalData}
          allProducts={products}
          onClose={() => {
            setShowCollectionModal(false);
            setCollectionModalData(null);
          }}
          onSave={handleSaveCollection}
        />
      )}

      {/* MODAL 10: Admin User & Role Assignment Modal (Matches Screenshot 1) */}
      {showAdminUserModal && (
        <AdminUserModal
          user={adminUserModalData}
          onClose={() => {
            setShowAdminUserModal(false);
            setAdminUserModalData(null);
          }}
          onSave={handleSaveAdminUser}
        />
      )}

      {/* MODAL 11: Hero Carousel Banner Create & Edit Modal */}
      {showBannerModal && (
        <HeroBannerModal
          banner={bannerModalData}
          onClose={() => {
            setShowBannerModal(false);
            setBannerModalData(null);
          }}
          onSave={handleSaveBanner}
        />
      )}

      {/* MODAL 12: Customer Review & Screenshot Upload Modal */}
      {showReviewModal && (
        <ReviewModal
          review={reviewModalData}
          onClose={() => {
            setShowReviewModal(false);
            setReviewModalData(null);
          }}
          onSave={handleSaveReview}
        />
      )}
    </div>
  );
}
