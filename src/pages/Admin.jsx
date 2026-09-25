import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  ImageOff,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  UtensilsCrossed,
  Images,
  Image as ImageIcon,
  Settings,
  Clock,
  Store,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useRestaurantSettings } from '../context/RestaurantSettingsContext';
import { authService } from '../services/authService';
import restaurantConfig from '../config/restaurantConfig';
import {
  galleryService,
  DEFAULT_GALLERY_CATEGORIES,
  validateImageFile,
  compressAndProcessImage,
} from '../services/galleryService';
import { uploadImageToStorage } from '../services/storageService';
import { checkSupabaseConnection, migrateAllToSupabase } from '../services/migrationService';
import { menuService } from '../services/menuService';
import './Admin.css';

export default function Admin() {
  // ── Menu Context ──────────────────────────────────────────
  const {
    items,
    categories,
    updateItem,
    addItem,
    deleteItem,
    toggleAvailability,
    toggleFeatured,
    resetMenu,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useMenu();

  // ── Shared Restaurant Settings Context ────────────────────
  const { settings, updateSettings, resetSettings } = useRestaurantSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // ── Authentication & Route Protection ─────────────────────
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((session) => {
      setIsAuthenticated(Boolean(session));
    });
    return unsubscribe;
  }, []);

  // ── Active Navigation Tab ─────────────────────────────────
  // 'menu' | 'gallery' | 'settings' | 'profile'
  const [activeTab, setActiveTab] = useState('menu');

  // ── Notification Toast ────────────────────────────────────
  const [notification, setNotification] = useState('');
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // ==========================================================
  // MENU MANAGEMENT STATE
  // ==========================================================
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('pizza');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSmallPrice, setFormSmallPrice] = useState('');
  const [formMediumPrice, setFormMediumPrice] = useState('');
  const [formLargePrice, setFormLargePrice] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [alsoAddToGallery, setAlsoAddToGallery] = useState(false);

  // Category Management Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🍽️');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatIcon, setEditingCatIcon] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Admin Profile / Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fileInputRef = useRef(null);
  const quickFileInputRef = useRef(null);
  const [quickTargetItemId, setQuickTargetItemId] = useState(null);

  // ==========================================================
  // GALLERY MANAGEMENT STATE
  // ==========================================================
  const [galleryItems, setGalleryItems] = useState(() => galleryService.getItems());
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('All');

  // Multi-upload Modal State
  const [isGalleryUploadModalOpen, setIsGalleryUploadModalOpen] = useState(false);
  const [uploadBatch, setUploadBatch] = useState([]); // [{ id, preview, title, category, description, hidden }]
  const [isCompressing, setIsCompressing] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState('');
  const galleryMultiInputRef = useRef(null);

  // Single Edit Modal State
  const [isGalleryEditModalOpen, setIsGalleryEditModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [editGalleryTitle, setEditGalleryTitle] = useState('');
  const [editGalleryCategory, setEditGalleryCategory] = useState('Pizza');
  const [editGalleryDescription, setEditGalleryDescription] = useState('');
  const [editGalleryHidden, setEditGalleryHidden] = useState(false);
  const [editGalleryImage, setEditGalleryImage] = useState('');
  const galleryReplaceInputRef = useRef(null);

  // Listen for storage events so gallery updates stay in sync
  useEffect(() => {
    const handleGalleryUpdate = (e) => {
      if (e.detail) {
        setGalleryItems(e.detail);
      } else {
        setGalleryItems(galleryService.getItems());
      }
    };
    window.addEventListener('gallery-updated', handleGalleryUpdate);
    window.addEventListener('storage', handleGalleryUpdate);
    return () => {
      window.removeEventListener('gallery-updated', handleGalleryUpdate);
      window.removeEventListener('storage', handleGalleryUpdate);
    };
  }, []);

  // ── Logout Handler ───────────────────────────────────────
  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login', { replace: true });
  };

  // ── Supabase Status & Safe Migration State ────────────────
  const [supabaseStatus, setSupabaseStatus] = useState({ checked: false, connected: false, message: '' });
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatusMsg, setMigrationStatusMsg] = useState('');

  useEffect(() => {
    checkSupabaseConnection().then(setSupabaseStatus);
    if (authService.isAuthenticated()) {
      menuService.saveCategoryToSupabase({ id: 'shawarma', name: 'Shawarma', icon: '🌯' });
    }
  }, []);

  const handleRunMigration = async () => {
    if (!authService.isAuthenticated()) {
      alert('You must be signed in with an authenticated Supabase Admin account to perform cloud migration.');
      return;
    }
    setIsMigrating(true);
    setMigrationStatusMsg('Reading existing localStorage and preparing data...');
    try {
      const res = await migrateAllToSupabase();
      if (res.success) {
        setMigrationStatusMsg(
          `✅ Successfully synced data to Supabase! (${res.results.categories} categories, ${res.results.menuItems} menu items, ${res.results.galleryItems} gallery items).`
        );
        showNotification('Data successfully synced to Supabase!');
      } else {
        setMigrationStatusMsg(
          `⚠️ Migration notice: ${res.results?.errors?.join('; ') || res.error || 'Please ensure SQL setup script has been executed in Supabase SQL editor.'}`
        );
        showNotification('Sync finished with notes.');
      }
    } catch (err) {
      setMigrationStatusMsg(`❌ Migration error: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // ==========================================================
  // MENU MANAGEMENT HANDLERS
  // ==========================================================
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    const defaultCat = (selectedCategory && selectedCategory !== 'all')
      ? selectedCategory
      : (categories.find((c) => c.id !== 'all')?.id || 'pizza');
    setFormCategory(defaultCat);
    setFormDescription('');
    setFormPrice('');
    setFormSmallPrice('');
    setFormMediumPrice('');
    setFormLargePrice('');
    setFormAvailable(true);
    setFormFeatured(false);
    setPreviewImage('');
    setImageFileName('');
    setAlsoAddToGallery(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name || '');
    setFormCategory(item.category || 'pizza');
    setFormDescription(item.description || '');
    setFormAvailable(item.available !== false);
    setFormFeatured(Boolean(item.featured || item.show_on_homepage));
    setPreviewImage(item.image || '');
    setImageFileName('');
    setAlsoAddToGallery(false);

    if (item.sizes && item.sizes.length > 0) {
      const s = item.sizes.find((x) => x.label === 'Small');
      const m = item.sizes.find((x) => x.label === 'Medium');
      const l = item.sizes.find((x) => x.label === 'Large');
      setFormSmallPrice(s && s.price !== undefined ? String(s.price) : '');
      setFormMediumPrice(m && m.price !== undefined ? String(m.price) : '');
      setFormLargePrice(l && l.price !== undefined ? String(l.price) : '');
      setFormPrice(item.price !== undefined && item.price !== null ? String(item.price) : (s ? String(s.price) : ''));
    } else {
      setFormPrice(item.price !== undefined && item.price !== null ? String(item.price) : '');
      setFormSmallPrice('');
      setFormMediumPrice('');
      setFormLargePrice('');
    }

    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setImageFileName(file.name);
    try {
      const result = await compressAndProcessImage(file, 1000, 0.82);
      let finalUrl = result.dataUrl;
      const uploadRes = await uploadImageToStorage(result.dataUrl, 'menu', file.name);
      if (uploadRes.success && uploadRes.url) {
        finalUrl = uploadRes.url;
      }
      setPreviewImage(finalUrl);
    } catch (err) {
      alert(`Error processing image: ${err.message}`);
    }
  };

  const handleTriggerQuickUpload = (itemId) => {
    setQuickTargetItemId(itemId);
    if (quickFileInputRef.current) {
      quickFileInputRef.current.value = '';
      quickFileInputRef.current.click();
    }
  };

  const handleQuickFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !quickTargetItemId) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const result = await compressAndProcessImage(file, 1000, 0.82);
      let finalUrl = result.dataUrl;
      const uploadRes = await uploadImageToStorage(result.dataUrl, 'menu', file.name);
      if (uploadRes.success && uploadRes.url) {
        finalUrl = uploadRes.url;
      }
      updateItem(quickTargetItemId, { image: finalUrl });
      showNotification('Menu image updated successfully!');
    } catch (err) {
      alert(`Error processing image: ${err.message}`);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();

    if (!formName.trim()) {
      alert('Food Name is required');
      return;
    }

    const isPizza = formCategory === 'pizza';
    let sizes = null;
    let price = Number(formPrice) || 0;

    if (isPizza) {
      const sPrice = Number(formSmallPrice) || 0;
      const mPrice = Number(formMediumPrice) || 0;
      const lPrice = Number(formLargePrice) || 0;
      sizes = [
        { label: 'Small', price: sPrice },
        { label: 'Medium', price: mPrice },
        { label: 'Large', price: lPrice },
      ];
      price = sPrice || Number(formPrice) || 0;
    }

    const isFeatured = Boolean(formFeatured);
    const payload = {
      name: formName.trim(),
      category: formCategory,
      category_id: formCategory,
      description: formDescription.trim(),
      image: previewImage || '',
      available: Boolean(formAvailable),
      featured: isFeatured,
      show_on_homepage: isFeatured,
      price,
      sizes: isPizza ? sizes : null,
    };

    if (editingItem) {
      const res = await updateItem(editingItem.id, payload);
      if (res && res.success === false) {
        alert(`Failed to save item: ${res.error}`);
        return;
      }
      showNotification(`"${payload.name}" updated successfully!`);
    } else {
      const newId = `${formCategory}-${Date.now()}`;
      const res = await addItem({ id: newId, ...payload });
      if (res && res.success === false) {
        alert(`Failed to create item: ${res.error}`);
        return;
      }
      showNotification(`"${payload.name}" created successfully!`);
    }

    // ── Requirement 7: Menu images & Gallery images remain separate
    // Only if admin explicitly checked "Also add to Gallery" will it add to gallery
    if (alsoAddToGallery && previewImage) {
      let galCat = 'Other';
      if (formCategory === 'pizza') galCat = 'Pizza';
      else if (formCategory === 'burgers') galCat = 'Burger';
      else if (formCategory === 'fried-chicken' || formCategory === 'chicken-specials') galCat = 'Chicken';
      else if (formCategory === 'mojitos-juices' || formCategory === 'milkshakes') galCat = 'Beverages';

      await galleryService.addItem({
        title: payload.name,
        category: galCat,
        description: payload.description || `${payload.name} from our fresh cafe menu`,
        image: previewImage,
        hidden: false,
      });
      setGalleryItems(galleryService.getItems());
      showNotification(`"${payload.name}" saved & added to public Gallery!`);
    }

    setIsModalOpen(false);
  };


  const filteredItems = items.filter((item) => {
    const itemCat = item.category || item.category_id;
    const matchesCat = selectedCategory === 'all' || itemCat === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // ==========================================================
  // GALLERY MANAGEMENT HANDLERS
  // ==========================================================
  const handleOpenGalleryUploadModal = () => {
    setUploadBatch([]);
    setGalleryUploadError('');
    setIsGalleryUploadModalOpen(true);
  };

  const handleGalleryFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setGalleryUploadError('');
    setIsCompressing(true);

    const validFiles = [];
    const errors = [];

    for (const file of files) {
      const val = validateImageFile(file);
      if (!val.valid) {
        errors.push(val.error);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setGalleryUploadError(errors.join(' | '));
    }

    if (validFiles.length === 0) {
      setIsCompressing(false);
      return;
    }

    try {
      const processedBatch = [];
      for (const file of validFiles) {
        const result = await compressAndProcessImage(file, 1200, 0.85);
        let finalUrl = result.dataUrl;
        const uploadRes = await uploadImageToStorage(result.dataUrl, 'gallery', file.name);
        if (uploadRes.success && uploadRes.url) {
          finalUrl = uploadRes.url;
        }

        // Default clean title from file name
        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        processedBatch.push({
          id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          preview: finalUrl,
          title: cleanTitle,
          category: 'Pizza',
          description: '',
          hidden: false,
        });
      }

      setUploadBatch((prev) => [...prev, ...processedBatch]);
    } catch (err) {
      setGalleryUploadError(`Failed to process image: ${err.message}`);
    } finally {
      setIsCompressing(false);
      if (galleryMultiInputRef.current) {
        galleryMultiInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFromBatch = (batchId) => {
    setUploadBatch((prev) => prev.filter((b) => b.id !== batchId));
  };

  const handleUpdateBatchItem = (batchId, field, value) => {
    setUploadBatch((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, [field]: value } : b))
    );
  };

  const handleSaveGalleryBatch = async () => {
    if (uploadBatch.length === 0) {
      alert('Please select at least one image to upload.');
      return;
    }

    // Save to gallery service (writes to localStorage & Supabase)
    const newItems = await galleryService.addMultipleItems(
      uploadBatch.map((b) => ({
        title: b.title.trim() || 'Food Showcase',
        category: b.category,
        description: b.description.trim(),
        image: b.preview,
        hidden: b.hidden,
      }))
    );

    setGalleryItems(galleryService.getItems());
    setIsGalleryUploadModalOpen(false);
    setUploadBatch([]);
    showNotification(`Uploaded ${newItems.length} photo(s) to Gallery!`);
  };

  // Edit Single Gallery Item
  const handleOpenGalleryEdit = (item) => {
    setEditingGalleryItem(item);
    setEditGalleryTitle(item.title || '');
    setEditGalleryCategory(item.category || 'Pizza');
    setEditGalleryDescription(item.description || '');
    setEditGalleryHidden(Boolean(item.hidden));
    setEditGalleryImage(item.image || '');
    setIsGalleryEditModalOpen(true);
  };

  const handleGalleryReplaceSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const val = validateImageFile(file);
    if (!val.valid) {
      alert(val.error);
      return;
    }

    try {
      const res = await compressAndProcessImage(file, 1200, 0.85);
      let finalUrl = res.dataUrl;
      const uploadRes = await uploadImageToStorage(res.dataUrl, 'gallery', file.name);
      if (uploadRes.success && uploadRes.url) {
        finalUrl = uploadRes.url;
      }
      setEditGalleryImage(finalUrl);
      showNotification('New image loaded into preview.');
    } catch (err) {
      alert(`Could not process image: ${err.message}`);
    }
  };

  const handleSaveGalleryEdit = async (e) => {
    e.preventDefault();
    if (!editingGalleryItem) return;

    if (!editGalleryTitle.trim()) {
      alert('Image title is required');
      return;
    }

    await galleryService.updateItem(editingGalleryItem.id, {
      title: editGalleryTitle.trim(),
      category: editGalleryCategory,
      description: editGalleryDescription.trim(),
      hidden: editGalleryHidden,
      image: editGalleryImage,
    });

    setGalleryItems(galleryService.getItems());
    setIsGalleryEditModalOpen(false);
    setEditingGalleryItem(null);
    showNotification(`"${editGalleryTitle}" updated successfully!`);
  };

  // Delete Gallery Item with Confirmation
  const handleDeleteGalleryItem = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}" from the public gallery?\n\nThis will immediately remove it from the customer website.`
    );
    if (confirmed) {
      await galleryService.deleteItem(item.id);
      setGalleryItems(galleryService.getItems());
      showNotification(`"${item.title}" deleted from Gallery`);
    }
  };

  // Toggle Visibility (Hide/Show)
  const handleToggleGalleryVisibility = async (item) => {
    const updated = await galleryService.toggleHidden(item.id);
    setGalleryItems(galleryService.getItems());
    showNotification(
      `"${item.title}" is now ${updated && updated.hidden ? 'Hidden' : 'Visible'} on the public gallery`
    );
  };

  // Reset Gallery to Defaults
  const handleResetGalleryDefaults = () => {
    if (window.confirm('Reset gallery to default food showcases? This replaces current photos.')) {
      galleryService.resetToDefault();
      setGalleryItems(galleryService.getItems());
      showNotification('Gallery reset to defaults');
    }
  };

  // Filtered Gallery Items
  const filteredGalleryItems = galleryItems.filter((item) => {
    const matchesCat =
      galleryCategoryFilter === 'All' || item.category === galleryCategoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(gallerySearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Dynamic Categories in Gallery
  const availableGalleryCategories = Array.from(
    new Set([...DEFAULT_GALLERY_CATEGORIES, ...galleryItems.map((g) => g.category)])
  ).filter(Boolean);

  // ==========================================================
  // RESTAURANT SETTINGS HANDLERS
  // ==========================================================
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(localSettings);
    showNotification('Restaurant settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all restaurant settings to defaults?')) {
      const def = resetSettings();
      setLocalSettings(def);
      showNotification('Restaurant settings reset to defaults');
    }
  };

  // ==========================================================
  // CATEGORY MANAGEMENT HANDLERS
  // ==========================================================
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    if (!newCatName.trim()) {
      setCategoryError('Please enter a category name');
      return;
    }
    const res = await addCategory({ name: newCatName.trim(), icon: newCatIcon.trim() || '🍽️' });
    if (res.success) {
      setNewCatName('');
      setNewCatIcon('🍽️');
      if (res.category?.id) {
        setFormCategory(res.category.id);
      }
      showNotification(`Category "${res.category.name}" added successfully!`);
    } else {
      setCategoryError(res.error);
    }
  };

  const handleUpdateCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    if (!editingCatName.trim()) {
      setCategoryError('Category name cannot be empty');
      return;
    }
    const res = await updateCategory(editingCatId, {
      name: editingCatName.trim(),
      icon: editingCatIcon.trim() || '🍽️',
    });
    if (res.success) {
      setEditingCatId(null);
      setEditingCatName('');
      setEditingCatIcon('');
      showNotification('Category updated successfully!');
    } else {
      setCategoryError(res.error);
    }
  };

  const handleDeleteCategoryClick = async (catId, catName) => {
    setCategoryError('');
    const confirmed = window.confirm(`Are you sure you want to delete category "${catName}"?`);
    if (!confirmed) return;
    const res = await deleteCategory(catId);
    if (res.success) {
      showNotification(`Category "${catName}" deleted successfully`);
    } else {
      setCategoryError(res.error);
    }
  };

  // ==========================================================
  // ADMIN PASSWORD CHANGE HANDLER
  // ==========================================================
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const res = await authService.changePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (res.success) {
      setPasswordSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotification('Admin password changed successfully in Supabase Auth!');
    } else {
      setPasswordError(res.error);
    }
  };



  // If someone visits /admin without being authenticated, redirect them to /admin/login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // ==========================================================
  // AUTHENTICATED DASHBOARD WITH SIDEBAR
  // ==========================================================
  return (
    <main className="admin-page" id="admin-page">
      {/* Hidden file input for quick inline image upload */}
      <input
        type="file"
        ref={quickFileInputRef}
        onChange={handleQuickFileSelected}
        accept=".jpg,.jpeg,.png,.webp,image/*"
        style={{ display: 'none' }}
      />

      {/* Hidden file input for gallery multi-upload */}
      <input
        type="file"
        ref={galleryMultiInputRef}
        onChange={handleGalleryFilesSelected}
        accept=".jpg,.jpeg,.png,.webp,image/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* Hidden file input for gallery image replacement */}
      <input
        type="file"
        ref={galleryReplaceInputRef}
        onChange={handleGalleryReplaceSelected}
        accept=".jpg,.jpeg,.png,.webp,image/*"
        style={{ display: 'none' }}
      />

      <div className="container admin-container-custom">
        {/* Notification Toast */}
        {notification && (
          <div className="admin-toast animate-fade-in">
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}

        {/* ── Dashboard Layout: Sidebar + Main Content ── */}
        <div className="admin-dashboard-layout">
          {/* ── Admin Sidebar ── */}
          <aside className="admin-sidebar" aria-label="Admin Navigation Sidebar">
            <div className="admin-sidebar__header">
              <img src={restaurantConfig.logo} alt="" className="admin-sidebar__logo" />
              <div>
                <h3 className="admin-sidebar__title">Call N Pizza</h3>
                <span className="admin-sidebar__badge">Admin Control</span>
              </div>
            </div>

            <nav className="admin-sidebar__nav">
              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'menu' ? 'admin-nav-item--active' : ''}`}
                onClick={() => setActiveTab('menu')}
                id="admin-nav-menu"
              >
                <UtensilsCrossed size={18} />
                <span>Menu Management</span>
                <span className="admin-nav-item__count">{items.length}</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'gallery' ? 'admin-nav-item--active' : ''}`}
                onClick={() => setActiveTab('gallery')}
                id="admin-nav-gallery"
              >
                <Images size={18} />
                <span>Gallery Management</span>
                <span className="admin-nav-item__count">{galleryItems.length}</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'settings' ? 'admin-nav-item--active' : ''}`}
                onClick={() => setActiveTab('settings')}
                id="admin-nav-settings"
              >
                <Settings size={18} />
                <span>Restaurant Settings</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeTab === 'profile' ? 'admin-nav-item--active' : ''}`}
                onClick={() => setActiveTab('profile')}
                id="admin-nav-profile"
              >
                <ShieldCheck size={18} />
                <span>Admin Profile</span>
              </button>
            </nav>

            <div className="admin-sidebar__footer">
              <Link
                to={activeTab === 'gallery' ? '/gallery' : '/menu'}
                className="admin-sidebar__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={15} />
                <span>View Public {activeTab === 'gallery' ? 'Gallery' : 'Menu'}</span>
              </Link>
              <button
                type="button"
                className="admin-sidebar__logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* ── Main Admin Content ── */}
          <section className="admin-main-panel">
            {/* ======================================================== */}
            {/* TAB 1: MENU MANAGEMENT                                   */}
            {/* ======================================================== */}
            {activeTab === 'menu' && (
              <div className="admin-tab-content animate-fade-in">
                {/* Top Bar */}
                <div className="admin-topbar">
                  <div>
                    <h1 className="admin-title">Menu Management</h1>
                    <p className="admin-subtitle">
                      Manage food items, pizza sizes, prices, images & availability
                    </p>
                  </div>
                  <div className="admin-topbar__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--outline"
                      onClick={() => {
                        setCategoryError('');
                        setIsCategoryModalOpen(true);
                      }}
                      id="admin-manage-categories-btn"
                    >
                      <Filter size={16} />
                      <span>Manage Categories</span>
                    </button>
                    <Link to="/menu" className="admin-btn admin-btn--outline" target="_blank">
                      <Eye size={16} />
                      <span>Preview Menu</span>
                    </Link>
                    <button className="admin-btn admin-btn--primary" onClick={handleOpenAdd} id="admin-add-food-btn">
                      <Plus size={16} />
                      <span>Add Food Item</span>
                    </button>
                  </div>
                </div>

                {/* Stats Strip */}
                <div className="admin-stats-strip">
                  <div className="admin-stat-box">
                    <span className="admin-stat-num">{items.length}</span>
                    <span className="admin-stat-label">Total Dishes</span>
                  </div>
                  <div className="admin-stat-box">
                    <span className="admin-stat-num">
                      {items.filter((i) => i.available !== false).length}
                    </span>
                    <span className="admin-stat-label">Available</span>
                  </div>
                  <div className="admin-stat-box">
                    <span className="admin-stat-num">
                      {items.filter((i) => i.available === false).length}
                    </span>
                    <span className="admin-stat-label">Sold Out</span>
                  </div>
                  <div className="admin-stat-box">
                    <span className="admin-stat-num">{items.filter((i) => i.image).length}</span>
                    <span className="admin-stat-label">With Photos</span>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="admin-filter-bar">
                  <div className="admin-search-wrap">
                    <Search size={16} className="admin-search-icon" />
                    <input
                      type="text"
                      placeholder="Search food item by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="admin-search-input"
                    />
                  </div>

                  <div className="admin-category-filter">
                    <Filter size={16} />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="admin-select"
                    >
                      <option value="all">All Categories ({items.length})</option>
                      {categories
                        .filter((c) => c.id !== 'all')
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} ({items.filter((i) => i.category === cat.id).length})
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    className="admin-btn admin-btn--ghost"
                    onClick={() => {
                      if (window.confirm('Reset all menu items and images to defaults?')) {
                        resetMenu();
                        showNotification('Menu reset to defaults');
                      }
                    }}
                    title="Reset menu to defaults"
                  >
                    <RefreshCw size={14} />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                {/* Food Items Table */}
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Food</th>
                        <th>Image</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Show on Homepage</th>
                        <th>Available</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="admin-table__empty">
                            No food items match your filter.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => (
                          <tr
                            key={item.id}
                            className={item.available === false ? 'admin-row--unavailable' : ''}
                          >
                            <td className="admin-table__food-col">
                              <strong className="admin-food-name">{item.name}</strong>
                              {item.description && (
                                <p className="admin-food-desc">{item.description}</p>
                              )}
                              {(item.featured || item.show_on_homepage) && (
                                <span className="admin-badge admin-badge--featured">Featured</span>
                              )}
                            </td>

                            <td className="admin-table__image-col">
                              {item.image ? (
                                <div className="admin-thumb-wrap">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="admin-thumb-img"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      if (e.currentTarget.nextSibling) {
                                        e.currentTarget.nextSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                  <div className="admin-thumb-fallback" style={{ display: 'none' }}>
                                    <ImageOff size={16} />
                                  </div>
                                  <button
                                    type="button"
                                    className="admin-thumb-replace-btn"
                                    onClick={() => handleTriggerQuickUpload(item.id)}
                                    title="Replace image"
                                  >
                                    Replace
                                  </button>
                                </div>
                              ) : (
                                <div className="admin-no-img-box">
                                  <span className="admin-no-img-text">No Image</span>
                                  <button
                                    type="button"
                                    className="admin-upload-btn-sm"
                                    onClick={() => handleTriggerQuickUpload(item.id)}
                                  >
                                    <Upload size={12} />
                                    <span>Upload</span>
                                  </button>
                                </div>
                              )}
                            </td>

                            <td>
                              <span className="admin-category-badge">
                                {categories.find((c) => c.id === item.category)?.name || item.category}
                              </span>
                            </td>

                            <td className="admin-price-col">
                              {item.sizes && item.sizes.length > 0 ? (
                                <div className="admin-sizes-price">
                                  {item.sizes.map((s) => (
                                    <span key={s.label} className="admin-size-pill">
                                      {s.label[0]}: ₹{s.price}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <strong className="admin-single-price">₹{item.price}</strong>
                              )}
                            </td>

                            <td>
                              <button
                                type="button"
                                className={`admin-toggle-btn ${(item.featured || item.show_on_homepage) ? 'admin-toggle-btn--active' : ''}`}
                                onClick={async () => {
                                  const res = await toggleFeatured(item.id);
                                  const isNowFeatured = !(item.featured || item.show_on_homepage);
                                  showNotification(
                                    `"${item.name}" ${isNowFeatured ? 'will now show on' : 'removed from'} homepage`
                                  );
                                }}
                                title="Toggle Show on Homepage"
                                id={`toggle-featured-${item.id}`}
                              >
                                {(item.featured || item.show_on_homepage) ? (
                                  <>
                                    <Sparkles size={14} /> Shown
                                  </>
                                ) : (
                                  <>
                                    <X size={14} /> Hidden
                                  </>
                                )}
                              </button>
                            </td>

                            <td>
                              <button
                                type="button"
                                className={`admin-toggle-btn ${item.available !== false ? 'admin-toggle-btn--active' : ''}`}
                                onClick={() => {
                                  toggleAvailability(item.id);
                                  showNotification(
                                    `"${item.name}" marked as ${item.available === false ? 'Available' : 'Unavailable'}`
                                  );
                                }}
                              >
                                {item.available !== false ? (
                                  <>
                                    <CheckCircle2 size={14} /> Available
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} /> Unavailable
                                  </>
                                )}
                              </button>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div className="admin-actions-cell">
                                <button
                                  type="button"
                                  className="admin-icon-action-btn admin-icon-action-btn--edit"
                                  onClick={() => handleOpenEdit(item)}
                                  title="Edit Food Item"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="admin-icon-action-btn admin-icon-action-btn--delete"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                      deleteItem(item.id);
                                      showNotification(`"${item.name}" removed`);
                                    }
                                  }}
                                  title="Delete Food Item"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: GALLERY MANAGEMENT                                */}
            {/* ======================================================== */}
            {activeTab === 'gallery' && (
              <div className="admin-tab-content animate-fade-in">
                {/* Top Bar with Prominent Upload Button */}
                <div className="admin-topbar">
                  <div>
                    <h1 className="admin-title">Gallery Management</h1>
                    <p className="admin-subtitle">
                      Upload, categorize, and showcase food photos on the public gallery page
                    </p>
                  </div>

                  <div className="admin-topbar__actions">
                    <Link to="/gallery" className="admin-btn admin-btn--outline" target="_blank">
                      <Eye size={16} />
                      <span>Public Gallery</span>
                    </Link>

                    {/* PROMINENT [+ Upload Images] BUTTON */}
                    <button
                      className="admin-btn admin-btn--primary admin-btn--prominent"
                      onClick={handleOpenGalleryUploadModal}
                      id="admin-upload-gallery-btn"
                    >
                      <Plus size={18} />
                      <span>+ Upload Images</span>
                    </button>
                  </div>
                </div>

                {/* Gallery Stats Strip */}
                <div className="admin-stats-strip">
                  <div className="admin-stat-box">
                    <span className="admin-stat-num">{galleryItems.length}</span>
                    <span className="admin-stat-label">Total Gallery Photos</span>
                  </div>
                  <div className="admin-stat-box">
                    <span className="admin-stat-num">
                      {galleryItems.filter((g) => !g.hidden).length}
                    </span>
                    <span className="admin-stat-label">Visible to Customers</span>
                  </div>
                  <div className="admin-stat-box">
                    <span className="admin-stat-num">
                      {galleryItems.filter((g) => g.hidden).length}
                    </span>
                    <span className="admin-stat-label">Hidden / Draft</span>
                  </div>
                  <div className="admin-stat-box">
                    <span className="admin-stat-num">{availableGalleryCategories.length}</span>
                    <span className="admin-stat-label">Photo Categories</span>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="admin-filter-bar">
                  <div className="admin-search-wrap">
                    <Search size={16} className="admin-search-icon" />
                    <input
                      type="text"
                      placeholder="Search gallery photos by title or description..."
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                      className="admin-search-input"
                    />
                  </div>

                  <div className="admin-category-filter">
                    <Filter size={16} />
                    <select
                      value={galleryCategoryFilter}
                      onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                      className="admin-select"
                    >
                      <option value="All">All Categories ({galleryItems.length})</option>
                      {availableGalleryCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat} ({galleryItems.filter((g) => g.category === cat).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="admin-btn admin-btn--ghost"
                    onClick={handleResetGalleryDefaults}
                    title="Reset gallery photos to defaults"
                  >
                    <RefreshCw size={14} />
                    <span>Reset Gallery</span>
                  </button>
                </div>

                {/* ── Responsive Grid of Image Thumbnails ── */}
                {filteredGalleryItems.length === 0 ? (
                  <div className="admin-empty-gallery-card">
                    <ImageIcon size={48} className="admin-empty-icon" />
                    <h3>No Gallery Photos Found</h3>
                    <p>
                      {gallerySearch || galleryCategoryFilter !== 'All'
                        ? 'Try changing your search filter or category.'
                        : 'Your public gallery is currently empty.'}
                    </p>
                    <button
                      type="button"
                      className="admin-btn admin-btn--primary"
                      onClick={handleOpenGalleryUploadModal}
                      style={{ marginTop: '16px' }}
                    >
                      <Plus size={16} />
                      <span>Upload Food Photos Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="admin-gallery-grid" id="admin-gallery-grid">
                    {filteredGalleryItems.map((photo) => (
                      <div
                        key={photo.id}
                        className={`admin-gallery-card ${photo.hidden ? 'admin-gallery-card--hidden' : ''}`}
                      >
                        {/* Image Thumbnail with Overlay Badges */}
                        <div className="admin-gallery-card__thumb">
                          <img
                            src={photo.image}
                            alt={photo.title}
                            className="admin-gallery-card__img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="admin-gallery-card__fallback" style={{ display: 'none' }}>
                            <ImageOff size={28} />
                          </div>

                          {/* Category Badge */}
                          <span className="admin-gallery-badge admin-gallery-badge--category">
                            {photo.category}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`admin-gallery-badge ${photo.hidden ? 'admin-gallery-badge--hidden' : 'admin-gallery-badge--visible'}`}
                          >
                            {photo.hidden ? 'Hidden' : 'Visible'}
                          </span>

                          {/* Quick Toggle Eye Button */}
                          <button
                            type="button"
                            className="admin-gallery-card__quick-toggle"
                            onClick={() => handleToggleGalleryVisibility(photo)}
                            title={photo.hidden ? 'Click to show on public gallery' : 'Click to hide from public gallery'}
                          >
                            {photo.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="admin-gallery-card__body">
                          <h4 className="admin-gallery-card__title" title={photo.title}>
                            {photo.title}
                          </h4>
                          <p className="admin-gallery-card__desc">
                            {photo.description || <em style={{ color: 'var(--color-text-muted)' }}>No description provided</em>}
                          </p>
                        </div>

                        {/* Action Buttons: [Edit] [Delete] */}
                        <div className="admin-gallery-card__actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn--sm admin-btn--outline"
                            onClick={() => handleOpenGalleryEdit(photo)}
                            id={`edit-gallery-${photo.id}`}
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="admin-btn admin-btn--sm admin-btn--danger-ghost"
                            onClick={() => handleDeleteGalleryItem(photo)}
                            id={`delete-gallery-${photo.id}`}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: RESTAURANT SETTINGS                               */}
            {/* ======================================================== */}
            {activeTab === 'settings' && (
              <div className="admin-tab-content animate-fade-in">
                <div className="admin-topbar">
                  <div>
                    <h1 className="admin-title">Restaurant Settings</h1>
                    <p className="admin-subtitle">
                      Configure store open/closed status, operating hours, and ordering information
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="admin-settings-form">
                  {/* Store Status Card */}
                  <div className="admin-settings-card">
                    <h3 className="admin-settings-card__title">
                      <Store size={18} /> Store Open / Closed Status
                    </h3>
                    <p className="admin-settings-card__desc">
                      Control whether your restaurant is currently accepting online orders & dine-in.
                    </p>

                    <div className="admin-status-toggle-box">
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          checked={localSettings.isOpen}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({ ...prev, isOpen: e.target.checked }))
                          }
                          id="settings-is-open-toggle"
                        />
                        <span className="admin-slider round"></span>
                      </label>
                      <span className={`admin-status-text ${localSettings.isOpen ? 'admin-status--open' : 'admin-status--closed'}`}>
                        {localSettings.isOpen ? '🟢 Cafe is OPEN for Orders' : '🔴 Cafe is CLOSED Temporarily'}
                      </span>
                    </div>
                  </div>

                  {/* Operating Hours Card */}
                  <div className="admin-settings-card">
                    <h3 className="admin-settings-card__title">
                      <Clock size={18} /> Operating Hours
                    </h3>

                    <div className="admin-form-row">
                      <div className="form-group">
                        <label htmlFor="settings-open-time">Opening Time</label>
                        <input
                          type="text"
                          id="settings-open-time"
                          value={localSettings.openingTime}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({ ...prev, openingTime: e.target.value }))
                          }
                          placeholder="e.g. 10:00 AM"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="settings-close-time">Closing Time</label>
                        <input
                          type="text"
                          id="settings-close-time"
                          value={localSettings.closingTime}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({ ...prev, closingTime: e.target.value }))
                          }
                          placeholder="e.g. 10:00 PM"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="settings-days">Operating Days</label>
                        <input
                          type="text"
                          id="settings-days"
                          value={localSettings.daysOpen}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({ ...prev, daysOpen: e.target.value }))
                          }
                          placeholder="e.g. Every Day"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ordering & Contact Card */}
                  <div className="admin-settings-card">
                    <h3 className="admin-settings-card__title">
                      <ShieldCheck size={18} /> Ordering & Contact Info
                    </h3>

                    <div className="admin-form-row">
                      <div className="form-group">
                        <label htmlFor="settings-phone">Customer Contact Phone</label>
                        <input
                          type="text"
                          id="settings-phone"
                          value={localSettings.phone}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="e.g. 99443 99984"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="settings-whatsapp">WhatsApp Order Number</label>
                        <input
                          type="text"
                          id="settings-whatsapp"
                          value={localSettings.whatsapp}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({ ...prev, whatsapp: e.target.value }))
                          }
                          placeholder="e.g. 9944399984"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="admin-toggles-row" style={{ marginTop: '16px' }}>
                      <label className="admin-checkbox-label">
                        <input
                          type="checkbox"
                          checked={localSettings.isHalal}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({ ...prev, isHalal: e.target.checked }))
                          }
                        />
                        <span>100% Halal Certified</span>
                      </label>

                      <label className="admin-checkbox-label">
                        <input
                          type="checkbox"
                          checked={localSettings.homeDelivery}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({ ...prev, homeDelivery: e.target.checked }))
                          }
                        />
                        <span>Home Delivery Available</span>
                      </label>
                    </div>
                  </div>

                  {/* Supabase Cloud Database & Storage Sync Card */}
                  <div className="admin-settings-card">
                    <h3 className="admin-settings-card__title">
                      <RefreshCw size={18} /> Supabase Cloud Sync
                    </h3>
                    <p className="admin-settings-card__desc">
                      Safely synchronize your customized cafe menu items, categories, gallery photos, and settings into Supabase without duplicates.
                    </p>

                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.9rem', color: supabaseStatus.connected ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {supabaseStatus.connected ? '🟢 Connected to Supabase' : '🟡 Supabase Read Ready (Run supabase_setup.sql in Supabase SQL editor)'}
                      </div>

                      {migrationStatusMsg && (
                        <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'var(--color-bg-secondary, #f3f4f6)', fontSize: '0.85rem' }}>
                          {migrationStatusMsg}
                        </div>
                      )}

                      <div>
                        <button
                          type="button"
                          className="admin-btn admin-btn--outline"
                          onClick={handleRunMigration}
                          disabled={isMigrating}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <RefreshCw size={16} className={isMigrating ? 'spin' : ''} />
                          {isMigrating ? 'Syncing...' : 'Sync Local Data to Supabase'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="admin-settings-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="admin-btn admin-btn--primary admin-btn--lg" id="save-settings-btn">
                      Save Restaurant Settings
                    </button>
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--lg" onClick={handleResetSettings}>
                      Reset to Defaults
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: ADMIN PROFILE & CHANGE PASSWORD                   */}
            {/* ======================================================== */}
            {activeTab === 'profile' && (
              <div className="admin-tab-content animate-fade-in">
                <div className="admin-topbar">
                  <div>
                    <h1 className="admin-title">Admin Profile</h1>
                    <p className="admin-subtitle">
                      Manage dashboard credentials and security settings
                    </p>
                  </div>
                </div>

                <div className="admin-settings-card" style={{ maxWidth: '560px' }}>
                  <h3 className="admin-settings-card__title">
                    <ShieldCheck size={18} /> Change Password
                  </h3>
                  <p className="admin-settings-card__desc">
                    Enter your current password and choose a new password. The new password will be required on future logins and remains saved after browser refresh.
                  </p>

                  {passwordError && (
                    <div
                      className="admin-error-banner"
                      style={{
                        margin: '16px 0',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div
                      className="admin-success-banner"
                      style={{
                        margin: '16px 0',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#4ade80',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleChangePasswordSubmit}
                    className="admin-password-form"
                    style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                  >
                    <div className="form-group">
                      <label htmlFor="admin-current-pwd">Current Password *</label>
                      <input
                        type="password"
                        id="admin-current-pwd"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password (demo hint: admin)"
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="admin-new-pwd">New Password * (Min 6 characters)</label>
                      <input
                        type="password"
                        id="admin-new-pwd"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="form-input"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="admin-confirm-pwd">Confirm New Password *</label>
                      <input
                        type="password"
                        id="admin-confirm-pwd"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="form-input"
                        required
                        minLength={6}
                      />
                    </div>

                    <div style={{ paddingTop: '8px' }}>
                      <button
                        type="submit"
                        className="admin-btn admin-btn--primary admin-btn--lg"
                        id="admin-change-pwd-btn"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT MENU FOOD ITEM                         */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">
                {editingItem ? `Edit: ${editingItem.name}` : 'Add New Food Item'}
              </h2>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="admin-modal__form">
              <div className="admin-modal__body">
                {/* Food Name & Category */}
                <div className="admin-form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label htmlFor="modal-name">Food Name *</label>
                    <input
                      type="text"
                      id="modal-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Crispy Fried Chicken - 4 Pcs"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label htmlFor="modal-category" style={{ margin: 0 }}>Category *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryError('');
                          setIsCategoryModalOpen(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        + New Category
                      </button>
                    </div>
                    <select
                      id="modal-category"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="form-input"
                    >
                      {categories
                        .filter((c) => c.id !== 'all')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="modal-desc">Description</label>
                  <textarea
                    id="modal-desc"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short appetising description..."
                    rows={2}
                    className="form-input form-textarea"
                  />
                </div>

                {/* Image Upload & Preview */}
                <div className="admin-image-upload-section">
                  <label className="admin-section-label">Food Image</label>

                  <div className="admin-image-preview-card">
                    <div className="admin-image-preview-box">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="admin-preview-img" />
                      ) : (
                        <div className="admin-preview-empty">
                          <ImageOff size={32} />
                          <span>No Image Attached</span>
                        </div>
                      )}
                    </div>

                    <div className="admin-image-preview-controls">
                      <p className="admin-image-hint">
                        Supports JPG, PNG, WEBP (auto-compressed for fast loading).
                      </p>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        accept=".jpg,.jpeg,.png,.webp,image/*"
                        style={{ display: 'none' }}
                      />

                      <div className="admin-image-btn-row">
                        <button
                          type="button"
                          className="admin-btn admin-btn--outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={16} />
                          <span>{previewImage ? 'Replace Image' : 'Upload Image'}</span>
                        </button>

                        {previewImage && (
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger-ghost"
                            onClick={() => {
                              setPreviewImage('');
                              setImageFileName('');
                              setAlsoAddToGallery(false);
                            }}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      {imageFileName && (
                        <span className="admin-file-name">Selected: {imageFileName}</span>
                      )}

                      {/* Requirement 7: Explicit checkbox to also add to gallery */}
                      {previewImage && (
                        <div className="admin-gallery-sync-box">
                          <label className="admin-checkbox-label">
                            <input
                              type="checkbox"
                              checked={alsoAddToGallery}
                              onChange={(e) => setAlsoAddToGallery(e.target.checked)}
                            />
                            <span>☑ Also add to Gallery</span>
                          </label>
                          <span className="admin-hint-text">
                            (Unchecked by default — Menu images remain separate from Gallery unless selected)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                {formCategory === 'pizza' ? (
                  <div className="admin-pizza-prices-box">
                    <label className="admin-section-label">Pizza Size Prices (₹)</label>
                    <div className="admin-price-triple-row">
                      <div className="form-group">
                        <label htmlFor="p-small">Small Price (₹)</label>
                        <input
                          type="number"
                          id="p-small"
                          value={formSmallPrice}
                          onChange={(e) => setFormSmallPrice(e.target.value)}
                          className="form-input"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="p-med">Medium Price (₹)</label>
                        <input
                          type="number"
                          id="p-med"
                          value={formMediumPrice}
                          onChange={(e) => setFormMediumPrice(e.target.value)}
                          className="form-input"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="p-large">Large Price (₹)</label>
                        <input
                          type="number"
                          id="p-large"
                          value={formLargePrice}
                          onChange={(e) => setFormLargePrice(e.target.value)}
                          className="form-input"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="form-group" style={{ maxWidth: '240px' }}>
                    <label htmlFor="modal-single-price">Price (₹) *</label>
                    <input
                      type="number"
                      id="modal-single-price"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="form-input"
                      min="0"
                      required
                    />
                  </div>
                )}

                {/* Toggles */}
                <div className="admin-toggles-row">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formAvailable}
                      onChange={(e) => setFormAvailable(e.target.checked)}
                    />
                    <span>Available for Ordering</span>
                  </label>

                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      id="modal-featured-checkbox"
                    />
                    <span>Show on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Save Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: GALLERY UPLOAD (SINGLE OR MULTIPLE IMAGES)        */}
      {/* ======================================================== */}
      {isGalleryUploadModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsGalleryUploadModalOpen(false)}>
          <div
            className="admin-modal admin-modal--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <div>
                <h2 className="admin-modal__title">Upload Gallery Photos</h2>
                <p className="admin-modal__subtitle">
                  Upload one or multiple photos. Supports JPG, JPEG, PNG, WEBP (Max 10MB each).
                </p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setIsGalleryUploadModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal__body">
              {/* Error Banner */}
              {galleryUploadError && (
                <div className="admin-error-banner animate-fade-in">
                  <AlertCircle size={18} />
                  <span>{galleryUploadError}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div
                className="admin-dropzone"
                onClick={() => galleryMultiInputRef.current?.click()}
              >
                <Upload size={36} className="admin-dropzone__icon" />
                <h4>Click or Drag to Select Photo(s)</h4>
                <p>Supports multiple JPG, JPEG, PNG or WEBP photos</p>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary admin-btn--sm"
                  style={{ marginTop: '10px' }}
                >
                  Browse Files
                </button>
              </div>

              {isCompressing && (
                <div className="admin-loading-row">
                  <RefreshCw size={18} className="spin-icon" />
                  <span>Compressing and optimizing photos for fast gallery loading...</span>
                </div>
              )}

              {/* Selected Batch Preview */}
              {uploadBatch.length > 0 && (
                <div className="admin-batch-preview-section">
                  <div className="admin-batch-header">
                    <h4>Selected Photos to Upload ({uploadBatch.length})</h4>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setUploadBatch([])}
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="admin-batch-list">
                    {uploadBatch.map((batchItem) => (
                      <div key={batchItem.id} className="admin-batch-item">
                        <img
                          src={batchItem.preview}
                          alt="preview"
                          className="admin-batch-thumb"
                        />

                        <div className="admin-batch-fields">
                          <div className="admin-form-row">
                            <div className="form-group" style={{ flex: 2 }}>
                              <label>Title *</label>
                              <input
                                type="text"
                                value={batchItem.title}
                                onChange={(e) =>
                                  handleUpdateBatchItem(batchItem.id, 'title', e.target.value)
                                }
                                placeholder="Photo Title"
                                className="form-input form-input--sm"
                                required
                              />
                            </div>

                            <div className="form-group" style={{ flex: 1.5 }}>
                              <label>Category</label>
                              <select
                                value={batchItem.category}
                                onChange={(e) =>
                                  handleUpdateBatchItem(batchItem.id, 'category', e.target.value)
                                }
                                className="form-input form-input--sm"
                              >
                                {availableGalleryCategories.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Caption / Description (Optional)</label>
                            <input
                              type="text"
                              value={batchItem.description}
                              onChange={(e) =>
                                handleUpdateBatchItem(batchItem.id, 'description', e.target.value)
                              }
                              placeholder="e.g. Handcrafted stone-baked crust with Italian toppings"
                              className="form-input form-input--sm"
                            />
                          </div>

                          <div className="admin-batch-toggle-row">
                            <label className="admin-checkbox-label">
                              <input
                                type="checkbox"
                                checked={!batchItem.hidden}
                                onChange={(e) =>
                                  handleUpdateBatchItem(batchItem.id, 'hidden', !e.target.checked)
                                }
                              />
                              <span>Visible in Public Gallery</span>
                            </label>

                            <button
                              type="button"
                              className="admin-btn admin-btn--danger-ghost admin-btn--xs"
                              onClick={() => handleRemoveFromBatch(batchItem.id)}
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => setIsGalleryUploadModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                disabled={uploadBatch.length === 0 || isCompressing}
                onClick={handleSaveGalleryBatch}
                id="admin-save-batch-btn"
              >
                Save {uploadBatch.length > 0 ? `(${uploadBatch.length}) Photo(s)` : ''} to Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT SINGLE GALLERY PHOTO                         */}
      {/* ======================================================== */}
      {isGalleryEditModalOpen && editingGalleryItem && (
        <div className="admin-modal-overlay" onClick={() => setIsGalleryEditModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div>
                <h2 className="admin-modal__title">Edit Gallery Photo</h2>
                <p className="admin-modal__subtitle">Update photo details or replace the image</p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setIsGalleryEditModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGalleryEdit} className="admin-modal__form">
              <div className="admin-modal__body">
                {/* Image Preview & Replace */}
                <div className="admin-gallery-edit-preview-row">
                  <div className="admin-gallery-edit-box">
                    <img
                      src={editGalleryImage}
                      alt={editGalleryTitle}
                      className="admin-gallery-edit-img"
                    />
                  </div>

                  <div className="admin-gallery-edit-controls">
                    <p className="admin-image-hint">
                      Want to replace this photo with a new one?
                    </p>
                    <button
                      type="button"
                      className="admin-btn admin-btn--outline admin-btn--sm"
                      onClick={() => galleryReplaceInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      <span>Replace Photo</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="form-group">
                  <label htmlFor="edit-gallery-title">Photo Title *</label>
                  <input
                    type="text"
                    id="edit-gallery-title"
                    value={editGalleryTitle}
                    onChange={(e) => setEditGalleryTitle(e.target.value)}
                    placeholder="e.g. Woodfired Chicken Supreme Pizza"
                    required
                    className="form-input"
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label htmlFor="edit-gallery-cat">Gallery Category *</label>
                  <select
                    id="edit-gallery-cat"
                    value={editGalleryCategory}
                    onChange={(e) => setEditGalleryCategory(e.target.value)}
                    className="form-input"
                  >
                    {availableGalleryCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="edit-gallery-desc">Description / Caption</label>
                  <textarea
                    id="edit-gallery-desc"
                    value={editGalleryDescription}
                    onChange={(e) => setEditGalleryDescription(e.target.value)}
                    placeholder="Short description displayed on hover/tap in the public gallery..."
                    rows={3}
                    className="form-input form-textarea"
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="admin-toggles-row">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={!editGalleryHidden}
                      onChange={(e) => setEditGalleryHidden(!e.target.checked)}
                    />
                    <span>Visible in Public Customer Gallery</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setIsGalleryEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  id="admin-save-gallery-edit-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CATEGORY MANAGEMENT                               */}
      {/* ======================================================== */}
      {isCategoryModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="admin-modal__header">
              <div>
                <h2 className="admin-modal__title">Category Management</h2>
                <p className="admin-modal__subtitle">
                  Add, edit/rename, or delete menu categories. Updates will immediately reflect across the public menu.
                </p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal__body">
              {categoryError && (
                <div
                  className="admin-error-banner"
                  style={{
                    marginBottom: '16px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{categoryError}</span>
                </div>
              )}

              {/* Add New Category Box */}
              <form
                onSubmit={handleAddCategorySubmit}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border)',
                  marginBottom: '20px',
                }}
              >
                <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>+ Add New Category</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Emoji"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="form-input"
                    style={{ width: '65px', textAlign: 'center' }}
                    title="Category Emoji / Icon"
                  />
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Combo Meals)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="form-input"
                    id="new-category-name-input"
                    style={{ flex: 1 }}
                    required
                  />
                  <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    id="add-category-btn"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Plus size={15} />
                    <span>Add Category</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>
                Existing Categories ({categories.filter((c) => c.id !== 'all').length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((cat) => {
                    const itemCount = items.filter((item) => item.category === cat.id).length;
                    const isEditing = editingCatId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          gap: '12px',
                        }}
                      >
                        {isEditing ? (
                          <form
                            onSubmit={handleUpdateCategorySubmit}
                            style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}
                          >
                            <input
                              type="text"
                              value={editingCatIcon}
                              onChange={(e) => setEditingCatIcon(e.target.value)}
                              className="form-input"
                              style={{ width: '50px', textAlign: 'center', padding: '6px' }}
                            />
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="form-input"
                              style={{ flex: 1, padding: '6px 10px' }}
                              required
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="admin-btn admin-btn--sm admin-btn--primary"
                              id={`save-cat-${cat.id}`}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn--sm admin-btn--ghost"
                              onClick={() => setEditingCatId(null)}
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '1.2rem' }}>{cat.icon || '🍽️'}</span>
                              <strong style={{ fontSize: '0.95rem' }}>{cat.name}</strong>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="admin-btn admin-btn--sm admin-btn--outline"
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditingCatName(cat.name);
                                  setEditingCatIcon(cat.icon || '🍽️');
                                }}
                                title="Rename Category"
                                id={`edit-cat-${cat.id}`}
                              >
                                <Edit2 size={13} />
                                <span>Rename</span>
                              </button>

                              <button
                                type="button"
                                className="admin-btn admin-btn--sm admin-btn--danger-ghost"
                                onClick={() => handleDeleteCategoryClick(cat.id, cat.name)}
                                title={
                                  itemCount > 0
                                    ? `Cannot delete: contains ${itemCount} items`
                                    : 'Delete Category'
                                }
                                id={`delete-cat-${cat.id}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="admin-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
