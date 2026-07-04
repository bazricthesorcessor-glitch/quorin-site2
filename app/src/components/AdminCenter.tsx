import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, X, Palette, ShoppingBag, Settings2 } from 'lucide-react';
import { getProductId, quorinData, type Product } from '@/data/products';
import { rgba, getThemeColors } from '@/lib/theme';

const colors = getThemeColors();

type Workspace = 'design' | 'commerce' | 'system';

const workspaceTabs: { id: Workspace; label: string; icon: typeof Plus }[] = [
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'commerce', label: 'Commerce', icon: ShoppingBag },
  { id: 'system', label: 'System', icon: Settings2 },
];

export interface AdminTheme {
  brand: string;
  tagline: string;
  
  /* Colors */
  background: string;
  surface: string;
  surfaceHover: string;
  ivory: string;
  structure: string;
  structureDark: string;
  structureLight: string;
  action: string;
  actionBright: string;
  accent: string;
  accentSoft: string;
  accentMedium: string;
  logoColor: string;
  decorative: string;
  
  /* Text */
  textPrimary: string;
  textOnCream: string;
  textOnWhite: string;
  textSecondary: string;
  textMuted: string;
  
  /* Borders & Inputs */
  border: string;
  borderSubtle: string;
  borderHover: string;
  input: string;
  dominant: string;
  
  /* Shadows */
  shadowCard: string;
  shadowHover: string;
  shadowDeep: string;
  
  /* Halos */
  haloGold: string;
  haloGoldStrong: string;
  
  /* Status */
  destructive: string;
  destructiveHover: string;
  success: string;
  
  /* Typography */
  fontFamily: string;
}

interface AdminCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: AdminTheme) => void;
  onCatalogUpdate: (mutator: (catalog: typeof quorinData) => void) => void;
}

const createBlankProduct = (): Product => ({
  id: `new-${Date.now()}`,
  name: 'New QUORIN Item',
  description: '',
  price: 0,
  mrp: 0,
  images: [],
  category: 'resin-art',
  discount: '0%',
  tags: ['new'],
});

const hexFromRgba = (value: string): string => {
  const rgbaMatch = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  const hexMatch = value.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return '#' + hex.slice(0, 6);
  }
  return '#808080';
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const cloneCatalog = () => JSON.parse(JSON.stringify(quorinData)) as typeof quorinData;

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const readThemeSnapshot = (): AdminTheme => {
  const styles = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => styles.getPropertyValue(`--${name}`).trim() || fallback;
  
  const background = get('color-background', '#F8F5EF');
  const action = get('color-action', '#C9A96E');
  
  return {
    brand: quorinData.brand,
    tagline: quorinData.tagline,
    
    /* Colors */
    background,
    surface: get('color-surface', '#FFFDF7'),
    surfaceHover: get('color-surface-hover', 'rgba(255, 253, 247, 0.6)'),
    ivory: get('color-ivory', '#FDF8F0'),
    structure: get('color-structure', '#2A2118'),
    structureDark: get('color-structure-dark', '#1F1812'),
    structureLight: get('color-structure-light', '#3D2B1F'),
    action,
    actionBright: get('color-action-bright', '#D8B97A'),
    accent: action,
    accentSoft: get('color-accent-soft', 'rgba(201, 169, 110, 0.1)'),
    accentMedium: get('color-accent-medium', 'rgba(201, 169, 110, 0.15)'),
    logoColor: get('color-logo', '#C89B52'),
    decorative: get('color-decorative', '#BFC2C8'),
    
    /* Text */
    textPrimary: get('color-text-primary', '#1A1410'),
    textOnCream: get('color-text-on-cream', '#1A1410'),
    textOnWhite: get('color-text-on-white', '#1A1410'),
    textSecondary: get('color-text-secondary', '#3D2B1F'),
    textMuted: get('color-text-muted', '#5B5045'),
    
    /* Borders & Inputs */
    border: get('color-border', '#E8E2D9'),
    borderSubtle: get('color-border-subtle', 'rgba(232, 226, 217, 0.5)'),
    borderHover: get('color-border-hover', '#C9A96E'),
    input: get('color-input', '#FFFDF7'),
    dominant: get('color-structure', '#2A2118'),
    
    /* Shadows */
    shadowCard: get('shadow-card', 'rgba(42, 33, 24, 0.06)'),
    shadowHover: get('shadow-hover', 'rgba(201, 169, 110, 0.12)'),
    shadowDeep: get('shadow-deep', 'rgba(42, 33, 24, 0.1)'),
    
    /* Halos */
    haloGold: get('halo-gold', 'rgba(201, 169, 110, 0.2)'),
    haloGoldStrong: get('halo-gold-strong', 'rgba(201, 169, 110, 0.3)'),
    
    /* Status */
    destructive: get('color-destructive', '#8B4513'),
    destructiveHover: get('color-destructive-hover', '#A0522D'),
    success: get('color-success', '#6B8E5A'),
    
    /* Typography */
    fontFamily: getComputedStyle(document.body).fontFamily || '"Copperplate", "Gill Sans", "Trebuchet MS", sans-serif',
  };
};

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="text-xs tracking-[0.15em] uppercase" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
        {hint ? <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-text-muted)' }}>{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

export default function AdminCenter({ isOpen, onClose, onThemeChange, onCatalogUpdate }: AdminCenterProps) {
  const [draftTheme, setDraftTheme] = useState<AdminTheme>(readThemeSnapshot);
  const [draftCatalog, setDraftCatalog] = useState<typeof quorinData>(cloneCatalog);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(quorinData.categories[0]?.id ?? '');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productDraft, setProductDraft] = useState<Product>(createBlankProduct());
  const [categoryDraft, setCategoryDraft] = useState({ id: '', title: '', description: '' });
  const [workspace, setWorkspace] = useState<Workspace>('design');
  const [dirty, setDirty] = useState(false);

  const selectedCategory = draftCatalog.categories.find((category) => category.id === selectedCategoryId) ?? draftCatalog.categories[0];
  const selectedProduct = selectedCategory
    ? selectedCategory.products.find((product) => getProductId(product) === selectedProductId) ??
      selectedCategory.products[0] ??
      null
    : null;

  useEffect(() => {
    if (!isOpen) return;
    setDraftTheme(readThemeSnapshot());
    const nextCatalog = cloneCatalog();
    setDraftCatalog(nextCatalog);
    setSelectedCategoryId(nextCatalog.categories[0]?.id ?? '');
    setSelectedProductId('');
    setProductDraft(createBlankProduct());
    setCategoryDraft({ id: '', title: '', description: '' });
    setDirty(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedCategory) return;
    setCategoryDraft({
      id: selectedCategory.id,
      title: selectedCategory.title,
      description: selectedCategory.description,
    });

    const firstProduct = selectedCategory.products[0];
    if (firstProduct && !selectedCategory.products.some((product) => getProductId(product) === selectedProductId)) {
      setSelectedProductId(getProductId(firstProduct));
    }
  }, [isOpen, selectedCategory, selectedProductId]);

  useEffect(() => {
    if (!isOpen) return;
    setProductDraft(selectedProduct ? JSON.parse(JSON.stringify(selectedProduct)) : createBlankProduct());
  }, [isOpen, selectedProduct]);

  if (!isOpen) return null;

  const markDirty = () => setDirty(true);

  const updateTheme = (patch: Partial<AdminTheme>) => {
    setDraftTheme((prev) => ({ ...prev, ...patch }));
    markDirty();
  };

  const saveTheme = () => {
    onThemeChange(draftTheme);
    setDirty(false);
  };

  const saveCategory = () => {
    if (!selectedCategory) return;

    const nextId = slugify(categoryDraft.id || categoryDraft.title || selectedCategory.id);
    const nextCatalog = {
      ...draftCatalog,
      categories: draftCatalog.categories.map((category) =>
        category.id === selectedCategory.id
          ? {
              ...category,
              id: nextId,
              title: categoryDraft.title || category.title,
              description: categoryDraft.description || category.description,
            }
          : category
      ),
    };
    setDraftCatalog(nextCatalog);
    setSelectedCategoryId(nextId);
    onCatalogUpdate((catalog) => {
      catalog.brand = nextCatalog.brand;
      catalog.tagline = nextCatalog.tagline;
      catalog.categories = JSON.parse(JSON.stringify(nextCatalog.categories)) as typeof nextCatalog.categories;
    });
    setDirty(false);
  };

  const addCategory = () => {
    const nextCategory = {
      id: slugify(categoryDraft.id || categoryDraft.title || `category-${Date.now()}`),
      title: categoryDraft.title || 'New Category',
      description: categoryDraft.description || 'Describe this collection here.',
      products: [] as Product[],
    };

    setDraftCatalog((prev) => ({
      ...prev,
      categories: [nextCategory, ...prev.categories],
    }));
    setSelectedCategoryId(nextCategory.id);
    setSelectedProductId('');
    setDirty(true);
  };

  const deleteCategory = () => {
    if (!selectedCategory) return;
    setDraftCatalog((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category.id !== selectedCategory.id),
    }));
    setSelectedCategoryId('');
    setSelectedProductId('');
    setDirty(true);
  };

  const saveProduct = () => {
    if (!selectedCategory) return;

    const nextProduct = {
      ...productDraft,
      name: productDraft.name.trim() || 'New QUORIN Item',
      tags: productDraft.tags.length ? productDraft.tags : ['new'],
    };

    const nextCatalog = {
      ...draftCatalog,
      categories: draftCatalog.categories.map((category) => {
        if (category.id !== selectedCategory.id) return category;
        const productId = selectedProduct ? getProductId(selectedProduct) : selectedProductId;
        const index = category.products.findIndex((product) => getProductId(product) === productId);

        const nextProducts =
          index >= 0
            ? category.products.map((product, idx) => (idx === index ? nextProduct : product))
            : [...category.products, nextProduct];

        return { ...category, products: nextProducts };
      }),
    };
    setDraftCatalog(nextCatalog);
    setSelectedProductId(getProductId(nextProduct));
    onCatalogUpdate((catalog) => {
      catalog.brand = nextCatalog.brand;
      catalog.tagline = nextCatalog.tagline;
      catalog.categories = JSON.parse(JSON.stringify(nextCatalog.categories)) as typeof nextCatalog.categories;
    });
    setDirty(false);
  };

  const addProduct = () => {
    if (!selectedCategory) return;
    const nextProduct = {
      ...createBlankProduct(),
      name: productDraft.name.trim() || 'New QUORIN Item',
    };

    setDraftCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === selectedCategory.id
          ? { ...category, products: [...category.products, nextProduct] }
          : category
      ),
    }));
    setSelectedProductId(getProductId(nextProduct));
    setDirty(true);
  };

  const deleteProduct = () => {
    if (!selectedCategory || !selectedProduct) return;
    const productId = getProductId(selectedProduct);
    setDraftCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === selectedCategory.id
          ? { ...category, products: category.products.filter((product) => getProductId(product) !== productId) }
          : category
      ),
    }));
    setSelectedProductId('');
    setDirty(true);
  };

  const applyAll = () => {
    onThemeChange(draftTheme);
    onCatalogUpdate((catalog) => {
      catalog.brand = draftTheme.brand;
      catalog.tagline = draftTheme.tagline;
      catalog.categories = JSON.parse(JSON.stringify(draftCatalog.categories)) as typeof draftCatalog.categories;
    });
    setDirty(false);
  };

  const editingLabel = selectedProduct ? `Editing item: ${selectedProduct.name}` : selectedCategory ? `Editing category: ${selectedCategory.title}` : 'Editing brand theme';

  const workspaceEditingLabel = workspace === 'design' ? 'Editing brand theme' : workspace === 'commerce' ? (selectedProduct ? `Editing item: ${selectedProduct.name}` : selectedCategory ? `Editing category: ${selectedCategory.title}` : 'Editing catalog') : 'System settings';

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'rgba(42, 33, 24, 0.25)', overscrollBehavior: 'contain' }}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="quorin-no-scrollbar w-full max-w-6xl max-h-[88vh] overflow-y-auto overflow-x-hidden rounded-2xl border"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border-subtle)',
          overscrollBehavior: 'contain',
        }}
        data-lenis-prevent
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 18, scale: 0.97 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div>
            <p className="text-xs tracking-[0.15em]" style={{ color: 'var(--color-accent)' }}>Admin</p>
            <h3 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Content editor</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm rounded-full" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} onClick={onClose}>
              Close
            </button>
            <button className="p-2 rounded-full" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div
            className="border-r p-5 space-y-5"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            data-lenis-prevent
          >
            <section className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-ivory)' }}>
              <p className="text-xs tracking-[0.15em] mb-2" style={{ color: 'var(--color-text-muted)' }}>Currently Editing</p>
              <h4 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{workspaceEditingLabel}</h4>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Changes stay in this draft until you save them. Closing the panel discards them.
              </p>
            </section>

            <section className="space-y-2">
              <p className="text-xs tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--color-text-muted)' }}>Workspace</p>
              <div className="space-y-1">
                {workspaceTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${workspace === tab.id ? 'ring-1' : ''}`}
                      style={{
                        background: workspace === tab.id ? 'var(--color-accent-soft)' : 'transparent',
                        borderColor: workspace === tab.id ? 'var(--color-accent)' : 'transparent',
                        color: workspace === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      }}
                      onClick={() => setWorkspace(tab.id)}
                    >
                      <Icon size={16} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Brand & Typography
              </h4>
              <Field label="Brand name" hint="Main logo text">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={draftTheme.brand}
                  onChange={(e) => updateTheme({ brand: e.target.value })}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Tagline" hint="Short line under brand">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={draftTheme.tagline}
                  onChange={(e) => updateTheme({ tagline: e.target.value })}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Font family" hint="Example: Copperplate, serif">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={draftTheme.fontFamily}
                  onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Surface Colors
              </h4>
              <div className="space-y-3">
                <Field label="Background">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.background)} onChange={(e) => updateTheme({ background: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.background}
                      onChange={(e) => updateTheme({ background: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Surface">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.surface)} onChange={(e) => updateTheme({ surface: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.surface}
                      onChange={(e) => updateTheme({ surface: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Ivory">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.ivory)} onChange={(e) => updateTheme({ ivory: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.ivory}
                      onChange={(e) => updateTheme({ ivory: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Structure Colors
              </h4>
              <div className="space-y-3">
                <Field label="Structure">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.structure)} onChange={(e) => updateTheme({ structure: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.structure}
                      onChange={(e) => updateTheme({ structure: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Structure Dark">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.structureDark)} onChange={(e) => updateTheme({ structureDark: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.structureDark}
                      onChange={(e) => updateTheme({ structureDark: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Structure Light">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.structureLight)} onChange={(e) => updateTheme({ structureLight: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.structureLight}
                      onChange={(e) => updateTheme({ structureLight: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Accent & Gold
              </h4>
              <div className="space-y-3">
                <Field label="Action / Accent">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.action)} onChange={(e) => updateTheme({ action: e.target.value, accent: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.action}
                      onChange={(e) => updateTheme({ action: e.target.value, accent: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Action Bright">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.actionBright)} onChange={(e) => updateTheme({ actionBright: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.actionBright}
                      onChange={(e) => updateTheme({ actionBright: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Accent Soft (opacity)" hint="rgba value">
                  <input
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none font-mono"
                    value={draftTheme.accentSoft}
                    onChange={(e) => updateTheme({ accentSoft: e.target.value })}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />
                </Field>
                <Field label="Accent Medium (opacity)" hint="rgba value">
                  <input
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none font-mono"
                    value={draftTheme.accentMedium}
                    onChange={(e) => updateTheme({ accentMedium: e.target.value })}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />
                </Field>
                <Field label="Logo Color">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.logoColor)} onChange={(e) => updateTheme({ logoColor: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.logoColor}
                      onChange={(e) => updateTheme({ logoColor: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Decorative / Silver">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.decorative)} onChange={(e) => updateTheme({ decorative: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.decorative}
                      onChange={(e) => updateTheme({ decorative: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Text Colors
              </h4>
              <div className="space-y-3">
                <Field label="Primary Text">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.textPrimary)} onChange={(e) => updateTheme({ textPrimary: e.target.value, textOnCream: e.target.value, textOnWhite: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.textPrimary}
                      onChange={(e) => updateTheme({ textPrimary: e.target.value, textOnCream: e.target.value, textOnWhite: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Secondary Text">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.textSecondary)} onChange={(e) => updateTheme({ textSecondary: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.textSecondary}
                      onChange={(e) => updateTheme({ textSecondary: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Muted Text">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.textMuted)} onChange={(e) => updateTheme({ textMuted: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.textMuted}
                      onChange={(e) => updateTheme({ textMuted: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Borders & Inputs
              </h4>
              <div className="space-y-3">
                <Field label="Border">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.border)} onChange={(e) => updateTheme({ border: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.border}
                      onChange={(e) => updateTheme({ border: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Border Subtle (opacity)" hint="rgba value">
                  <input
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none font-mono"
                    value={draftTheme.borderSubtle}
                    onChange={(e) => updateTheme({ borderSubtle: e.target.value })}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />
                </Field>
                <Field label="Border Hover">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.borderHover)} onChange={(e) => updateTheme({ borderHover: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.borderHover}
                      onChange={(e) => updateTheme({ borderHover: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Input Background">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.input)} onChange={(e) => updateTheme({ input: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.input}
                      onChange={(e) => updateTheme({ input: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Shadows
              </h4>
              <div className="space-y-3">
                <Field label="Shadow Card" hint="rgba value">
                  <input
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none font-mono"
                    value={draftTheme.shadowCard}
                    onChange={(e) => updateTheme({ shadowCard: e.target.value })}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />
                </Field>
                <Field label="Shadow Hover" hint="rgba value">
                  <input
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none font-mono"
                    value={draftTheme.shadowHover}
                    onChange={(e) => updateTheme({ shadowHover: e.target.value })}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />
                </Field>
                <Field label="Shadow Deep" hint="rgba value">
                  <input
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none font-mono"
                    value={draftTheme.shadowDeep}
                    onChange={(e) => updateTheme({ shadowDeep: e.target.value })}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Halos & Effects
              </h4>
              <div className="space-y-3">
                <Field label="Halo Gold" hint="rgba value">
                  <input
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none font-mono"
                    value={draftTheme.haloGold}
                    onChange={(e) => updateTheme({ haloGold: e.target.value })}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />
                </Field>
                <Field label="Halo Gold Strong" hint="rgba value">
                  <input
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none font-mono"
                    value={draftTheme.haloGoldStrong}
                    onChange={(e) => updateTheme({ haloGoldStrong: e.target.value })}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Status Colors
              </h4>
              <div className="space-y-3">
                <Field label="Destructive">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.destructive)} onChange={(e) => updateTheme({ destructive: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.destructive}
                      onChange={(e) => updateTheme({ destructive: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Destructive Hover">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.destructiveHover)} onChange={(e) => updateTheme({ destructiveHover: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.destructiveHover}
                      onChange={(e) => updateTheme({ destructiveHover: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
                <Field label="Success">
                  <div className="flex gap-2">
                    <input type="color" value={hexFromRgba(draftTheme.success)} onChange={(e) => updateTheme({ success: e.target.value })} className="h-10 w-12 rounded-lg border-0 p-0" />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                      value={draftTheme.success}
                      onChange={(e) => updateTheme({ success: e.target.value })}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                Categories
              </h4>
              <Field label="Select category" hint="Pick what you want to edit">
                <select
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={selectedCategory?.id ?? ''}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                >
                  {draftCatalog.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Category id" hint="URL-safe slug">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={categoryDraft.id}
                  onChange={(e) => {
                    setCategoryDraft((prev) => ({ ...prev, id: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Category title">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={categoryDraft.title}
                  onChange={(e) => {
                    setCategoryDraft((prev) => ({ ...prev, title: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Category description">
                <textarea
                  className="w-full min-h-24 rounded-lg p-4 outline-none"
                  value={categoryDraft.description}
                  onChange={(e) => {
                    setCategoryDraft((prev) => ({ ...prev, description: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--color-accent)', color: 'white' }} onClick={saveCategory}>Save</button>
                <button className="rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} onClick={addCategory}>New</button>
                <button className="rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-subtle)' }} onClick={deleteCategory}><Trash2 size={14} /></button>
              </div>
            </section>
          </div>

          <div className="p-5 space-y-5" data-lenis-prevent>
            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl border p-5" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-ivory)' }}>
                <p className="text-xs tracking-[0.15em] mb-3" style={{ color: 'var(--color-text-muted)' }}>Live Preview</p>
                <div className="rounded-xl p-5" style={{ background: `linear-gradient(135deg, ${draftTheme.accent}15, ${draftTheme.accent}10)`, border: `1px solid ${draftTheme.accent}30` }}>
                  <h2 className="text-3xl font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: draftTheme.fontFamily }}>{draftTheme.brand}</h2>
                  <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>{draftTheme.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'var(--color-accent)', color: 'white' }}>Accent</span>
                    <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-muted)' }}>Silver</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-5" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-ivory)' }}>
                <p className="text-xs tracking-[0.15em] mb-3" style={{ color: 'var(--color-text-muted)' }}>Scope</p>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    Brand text, tagline, fonts, colors, and background
                  </div>
                  <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    Categories and product cards
                  </div>
                  <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    No changes are applied until save
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>Products</h4>
                <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} onClick={addProduct}>
                  <Plus size={14} />
                  Add item
                </button>
              </div>
              <Field label="Select item" hint="Choose an item to edit">
                <select
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                >
                  {selectedCategory?.products.map((product) => (
                    <option key={getProductId(product)} value={getProductId(product)}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </Field>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Product title / name" hint="Shown on the card">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={productDraft.name}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, name: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Product type">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={productDraft.type ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, type: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Variant">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={productDraft.variant ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, variant: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Size / quantity">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={productDraft.size ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, size: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Price">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  type="number"
                  value={productDraft.price}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, price: Number(e.target.value) }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Cost price">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  type="number"
                  value={productDraft.costPrice ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, costPrice: e.target.value ? Number(e.target.value) : undefined }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="MRP">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  type="number"
                  value={productDraft.mrp}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, mrp: Number(e.target.value) }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Discount">
                <input
                  className="w-full rounded-lg px-4 py-3 outline-none"
                  value={productDraft.discount}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, discount: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
            </section>

            <section className="space-y-4">
              <Field label="Description">
                <textarea
                  className="w-full min-h-28 rounded-lg p-4 outline-none"
                  value={productDraft.description ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, description: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Image URL(s)" hint="Comma separated if multiple">
                <textarea
                  className="w-full min-h-24 rounded-lg p-4 outline-none"
                  value={(productDraft.images ?? []).join(', ')}
                  onChange={(e) => {
                    setProductDraft((prev) => ({
                      ...prev,
                      images: e.target.value
                        .split(',')
                        .map((image) => image.trim())
                        .filter(Boolean),
                    }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
              <Field label="Tags" hint="Comma separated">
                <textarea
                  className="w-full min-h-24 rounded-lg p-4 outline-none"
                  value={(productDraft.tags ?? []).join(', ')}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) }));
                    markDirty();
                  }}
                  style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                />
              </Field>
            </section>

            <section className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'var(--color-accent)', color: 'white' }} onClick={saveProduct}>
                <Save size={14} />
                Save item
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} onClick={saveTheme}>
                <Save size={14} />
                Save theme
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} onClick={applyAll}>
                <Save size={14} />
                Save all
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-subtle)' }} onClick={deleteProduct}>
                <Trash2 size={14} />
                Remove item
              </button>
            </section>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {dirty ? 'Unsaved draft changes are active.' : 'Nothing saved yet in this draft.'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
