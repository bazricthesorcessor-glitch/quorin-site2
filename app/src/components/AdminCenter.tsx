import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { getProductId, quorinData, type Product } from '@/data/products';

export interface AdminTheme {
  brand: string;
  tagline: string;
  accent: string;
  teal: string;
  dominant: string;
  textPrimary: string;
  textSecondary: string;
  fontFamily: string;
}

interface AdminCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: AdminTheme) => void;
  onCatalogUpdate: (mutator: (catalog: typeof quorinData) => void) => void;
}

const createBlankProduct = (): Product => ({
  name: 'New QUORIN Item',
  price: 0,
  mrp: 0,
  discount: '0%',
  tags: ['new'],
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const cloneCatalog = () => JSON.parse(JSON.stringify(quorinData)) as typeof quorinData;

const readThemeSnapshot = (): AdminTheme => {
  const styles = getComputedStyle(document.documentElement);
  return {
    brand: quorinData.brand,
    tagline: quorinData.tagline,
    accent: styles.getPropertyValue('--color-accent').trim() || '#ff1a3c',
    teal: styles.getPropertyValue('--color-teal').trim() || '#00d4ff',
    dominant: styles.getPropertyValue('--color-dominant').trim() || '#08080d',
    textPrimary: styles.getPropertyValue('--color-text-primary').trim() || '#f0f0f5',
    textSecondary: styles.getPropertyValue('--color-text-secondary').trim() || '#8a8a9a',
    fontFamily: getComputedStyle(document.body).fontFamily || '"Copperplate", "Gill Sans", "Trebuchet MS", sans-serif',
  };
};

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="text-xs tracking-[0.28em] uppercase text-white/60">{label}</label>
        {hint ? <span className="text-[10px] uppercase tracking-[0.24em] text-white/35">{hint}</span> : null}
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

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'rgba(8, 8, 13, 0.82)', overscrollBehavior: 'contain' }}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="quorin-no-scrollbar w-full max-w-6xl max-h-[88vh] overflow-y-auto overflow-x-hidden rounded-[2rem] border"
        style={{
          background: `radial-gradient(circle at top, rgba(255,26,60,0.12), rgba(12,12,20,0.98) 40%), rgba(12,12,20,0.98)`,
          borderColor: 'rgba(255,255,255,0.08)',
          overscrollBehavior: 'contain',
        }}
        data-lenis-prevent
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 18, scale: 0.97 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-xs tracking-[0.3em]" style={{ color: draftTheme.teal }}>ADMIN CENTER</p>
            <h3 className="text-2xl font-bold" style={{ color: draftTheme.textPrimary }}>Draft mode editor</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: draftTheme.textPrimary }} onClick={onClose}>
              Close
            </button>
            <button className="rounded-full p-2" style={{ background: 'rgba(255,255,255,0.06)', color: draftTheme.textPrimary }} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div
            className="border-r p-5 space-y-5"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            data-lenis-prevent
          >
            <section className="rounded-[1.8rem] border p-4" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs tracking-[0.28em] mb-2" style={{ color: draftTheme.textSecondary }}>CURRENTLY EDITING</p>
              <h4 className="text-lg font-semibold" style={{ color: draftTheme.textPrimary }}>{editingLabel}</h4>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: draftTheme.textSecondary }}>
                Changes stay in this draft until you save them. Closing the panel discards them.
              </p>
            </section>

            <section className="space-y-4">
              <h4 className="text-sm tracking-[0.25em]" style={{ color: draftTheme.textSecondary }}>
                THEME FORM
              </h4>
              <Field label="Brand name" hint="Main logo text">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={draftTheme.brand}
                  onChange={(e) => updateTheme({ brand: e.target.value })}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Tagline" hint="Short line under brand">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={draftTheme.tagline}
                  onChange={(e) => updateTheme({ tagline: e.target.value })}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Font family" hint="Example: Copperplate, serif">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={draftTheme.fontFamily}
                  onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Accent color">
                  <input type="color" value={draftTheme.accent} onChange={(e) => updateTheme({ accent: e.target.value })} className="h-12 w-full rounded-2xl border-0 p-1" />
                </Field>
                <Field label="Teal glow">
                  <input type="color" value={draftTheme.teal} onChange={(e) => updateTheme({ teal: e.target.value })} className="h-12 w-full rounded-2xl border-0 p-1" />
                </Field>
                <Field label="Background">
                  <input type="color" value={draftTheme.dominant} onChange={(e) => updateTheme({ dominant: e.target.value })} className="h-12 w-full rounded-2xl border-0 p-1" />
                </Field>
                <Field label="Primary text">
                  <input type="color" value={draftTheme.textPrimary} onChange={(e) => updateTheme({ textPrimary: e.target.value })} className="h-12 w-full rounded-2xl border-0 p-1" />
                </Field>
              </div>
              <Field label="Secondary text" hint="Supporting captions">
                <input
                  type="color"
                  value={draftTheme.textSecondary}
                  onChange={(e) => updateTheme({ textSecondary: e.target.value })}
                  className="h-12 w-full rounded-2xl border-0 p-1"
                />
              </Field>
            </section>

            <section className="space-y-4">
              <h4 className="text-sm tracking-[0.25em]" style={{ color: draftTheme.textSecondary }}>
                CATEGORY FORM
              </h4>
              <Field label="Select category" hint="Pick what you want to edit">
                <select
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={selectedCategory?.id ?? ''}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
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
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={categoryDraft.id}
                  onChange={(e) => {
                    setCategoryDraft((prev) => ({ ...prev, id: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Category title">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={categoryDraft.title}
                  onChange={(e) => {
                    setCategoryDraft((prev) => ({ ...prev, title: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Category description">
                <textarea
                  className="w-full min-h-24 rounded-2xl p-4 outline-none"
                  value={categoryDraft.description}
                  onChange={(e) => {
                    setCategoryDraft((prev) => ({ ...prev, description: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <div className="flex gap-2">
                <button className="flex-1 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(0,212,255,0.12)', color: draftTheme.textPrimary }} onClick={saveCategory}>Save category</button>
                <button className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(255,26,60,0.12)', color: draftTheme.textPrimary }} onClick={addCategory}>New</button>
                <button className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(255,26,60,0.18)', color: draftTheme.textPrimary }} onClick={deleteCategory}><Trash2 size={14} /></button>
              </div>
            </section>
          </div>

          <div className="p-5 space-y-5" data-lenis-prevent>
            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.8rem] border p-5" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs tracking-[0.28em] mb-3" style={{ color: draftTheme.textSecondary }}>LIVE PREVIEW</p>
                <div className="rounded-[1.4rem] p-5" style={{ background: `linear-gradient(135deg, ${draftTheme.accent}22, ${draftTheme.teal}14)`, border: `1px solid ${draftTheme.accent}33` }}>
                  <h2 className="text-4xl font-black" style={{ color: draftTheme.textPrimary, fontFamily: draftTheme.fontFamily }}>{draftTheme.brand}</h2>
                  <p className="mt-2 text-sm" style={{ color: draftTheme.textSecondary }}>{draftTheme.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full px-3 py-1 text-xs" style={{ background: draftTheme.accent, color: 'white' }}>Accent</span>
                    <span className="rounded-full px-3 py-1 text-xs" style={{ background: draftTheme.teal, color: '#061019' }}>Teal</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.8rem] border p-5" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs tracking-[0.28em] mb-3" style={{ color: draftTheme.textSecondary }}>WHAT YOU ARE EDITING</p>
                <div className="space-y-3 text-sm">
                  <div className="rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    Brand text, tagline, fonts, colors, and background
                  </div>
                  <div className="rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    Categories and product cards
                  </div>
                  <div className="rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    No changes are applied until save
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm tracking-[0.25em]" style={{ color: draftTheme.textSecondary }}>ITEM FORM</h4>
                <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: draftTheme.textPrimary }} onClick={addProduct}>
                  <Plus size={14} />
                  Add item
                </button>
              </div>
              <Field label="Select item" hint="Choose an item to edit">
                <select
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
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
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={productDraft.name}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, name: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Product type">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={productDraft.type ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, type: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Variant">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={productDraft.variant ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, variant: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Size / quantity">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={productDraft.size ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, size: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Price">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  type="number"
                  value={productDraft.price}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, price: Number(e.target.value) }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Cost price">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  type="number"
                  value={productDraft.costPrice ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, costPrice: e.target.value ? Number(e.target.value) : undefined }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="MRP">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  type="number"
                  value={productDraft.mrp}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, mrp: Number(e.target.value) }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Discount">
                <input
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  value={productDraft.discount}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, discount: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
            </section>

            <section className="space-y-4">
              <Field label="Description">
                <textarea
                  className="w-full min-h-28 rounded-2xl p-4 outline-none"
                  value={productDraft.description ?? ''}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, description: e.target.value }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Image URL(s)" hint="Comma separated if multiple">
                <textarea
                  className="w-full min-h-24 rounded-2xl p-4 outline-none"
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
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
              <Field label="Tags" hint="Comma separated">
                <textarea
                  className="w-full min-h-24 rounded-2xl p-4 outline-none"
                  value={(productDraft.tags ?? []).join(', ')}
                  onChange={(e) => {
                    setProductDraft((prev) => ({ ...prev, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) }));
                    markDirty();
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', color: draftTheme.textPrimary }}
                />
              </Field>
            </section>

            <section className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'linear-gradient(135deg, #ff1a3c, #ff0044)', color: 'white' }} onClick={saveProduct}>
                <Save size={14} />
                Save item
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: draftTheme.textPrimary }} onClick={saveTheme}>
                <Save size={14} />
                Save theme
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: draftTheme.textPrimary }} onClick={applyAll}>
                <Save size={14} />
                Save all
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'rgba(255,26,60,0.12)', color: draftTheme.textPrimary }} onClick={deleteProduct}>
                <Trash2 size={14} />
                Remove item
              </button>
            </section>

            <p className="text-xs leading-relaxed" style={{ color: draftTheme.textSecondary }}>
              {dirty ? 'Unsaved draft changes are active.' : 'Nothing saved yet in this draft.'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
