import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pencil, Trash2, Copy, Archive, Send, EyeOff, X, Save,
  ExternalLink, Image as ImageIcon, Loader2, AlertCircle,
} from 'lucide-react';
import {
  adminApi, type AdminProduct, type AdminCategory, type AdminCollection,
} from '@/lib/adminApi';
import {
  PageHeader, Card, Loading, ErrorState, EmptyState, PrimaryButton, GhostButton, Badge,
} from '@/components/admin/AdminUI';

const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const emptyDraft = (): ProductDraft => ({
  id: '',
  title: '',
  subtitle: '',
  description: '',
  handle: '',
  status: 'draft',
  thumbnail: '',
  material: '',
  origin_country: 'in',
  weight: '',
  tags: '',
  categories: [],
  collection_id: '',
  variants: [{ id: '', title: 'Default', sku: '', price: '', inventory: '' }],
  images: [],
  seo_title: '',
  seo_description: '',
  metadata: {},
});

interface VariantDraft {
  id: string;
  title: string;
  sku: string;
  price: string;
  inventory: string;
}

interface ProductDraft {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  handle: string;
  status: 'draft' | 'published';
  thumbnail: string;
  material: string;
  origin_country: string;
  weight: string;
  tags: string;
  categories: string[];
  collection_id: string;
  variants: VariantDraft[];
  images: { id: string; url: string }[];
  seo_title: string;
  seo_description: string;
  metadata: Record<string, unknown>;
}

const toDraft = (p: AdminProduct): ProductDraft => ({
  id: p.id,
  title: p.title ?? '',
  subtitle: p.subtitle ?? '',
  description: p.description ?? '',
  handle: p.handle ?? '',
  status: p.status === 'published' ? 'published' : 'draft',
  thumbnail: p.thumbnail ?? '',
  material: p.material ?? '',
  origin_country: p.origin_country ?? 'in',
  weight: p.weight != null ? String(p.weight) : '',
  tags: (p.tags ?? []).map((t) => t.value).join(', '),
  categories: (p.categories ?? []).map((c) => c.id),
  collection_id: p.collection_id ?? '',
  variants: (p.variants ?? []).length
    ? p.variants!.map((v) => ({
        id: v.id,
        title: v.title ?? 'Default',
        sku: v.sku ?? '',
        price: v.prices?.[0] ? String(v.prices[0].amount / 100) : '',
        inventory: v.inventory_quantity != null ? String(v.inventory_quantity) : '',
      }))
    : [{ id: '', title: 'Default', sku: '', price: '', inventory: '' }],
  images: (p.images ?? []).map((img) => ({ id: img.id, url: img.url })),
  seo_title: (p.metadata?.seo_title as string) ?? '',
  seo_description: (p.metadata?.seo_description as string) ?? '',
  metadata: p.metadata ?? {},
});

interface Props {
  onClose: () => void;
  onSaved: () => void;
  editProduct?: AdminProduct | null;
  categories: AdminCategory[];
  collections: AdminCollection[];
}

export default function AdminProductEditor({ onClose, onSaved, editProduct, categories, collections }: Props) {
  const [draft, setDraft] = useState<ProductDraft>(() => (editProduct ? toDraft(editProduct) : emptyDraft()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!editProduct;

  const update = (patch: Partial<ProductDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const updateVariant = (idx: number, patch: Partial<VariantDraft>) =>
    setDraft((d) => ({ ...d, variants: d.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)) }));

  const addVariant = () =>
    setDraft((d) => ({ ...d, variants: [...d.variants, { id: '', title: `Variant ${d.variants.length + 1}`, sku: '', price: '', inventory: '' }] }));

  const removeVariant = (idx: number) =>
    setDraft((d) => ({ ...d, variants: d.variants.filter((_, i) => i !== idx) }));

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await adminApi.uploadFiles(Array.from(files));
      update({ images: [...draft.images, ...uploaded], thumbnail: draft.thumbnail || uploaded[0]?.url || '' });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    const next = draft.images.filter((_, i) => i !== idx);
    update({ images: next, thumbnail: next[0]?.url ?? '' });
  };

  const makeThumbnail = (url: string) => update({ thumbnail: url });

  const save = async () => {
    setError(null);
    if (!draft.title.trim()) {
      setError('Product title is required.');
      return;
    }
    setSaving(true);
    try {
      const handle = draft.handle.trim() || slugify(draft.title);
      const tagValues = draft.tags.split(',').map((t) => t.trim()).filter(Boolean).map((value) => ({ value }));
      const payload: Record<string, unknown> = {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim() || null,
        description: draft.description.trim() || null,
        handle,
        status: draft.status,
        material: draft.material.trim() || null,
        origin_country: draft.origin_country.trim() || null,
        weight: draft.weight ? Number(draft.weight) : null,
        tags: tagValues,
        categories: draft.categories.map((id) => ({ id })),
        collection_id: draft.collection_id || null,
        images: draft.images.map((img) => ({ id: img.id })),
        thumbnail: draft.thumbnail || null,
        metadata: { ...draft.metadata, seo_title: draft.seo_title, seo_description: draft.seo_description },
        variants: draft.variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          title: v.title || 'Default',
          sku: v.sku || null,
          prices: v.price ? [{ currency_code: 'inr', amount: Math.round(Number(v.price) * 100) }] : [],
          ...(v.id ? {} : { inventory_quantity: v.inventory ? Number(v.inventory) : 0, manage_inventory: true }),
        })),
        options: [{ title: 'Default', values: ['Default'] }],
      };

      if (isEdit) {
        await adminApi.updateProduct(draft.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full rounded-lg px-3 py-2.5 outline-none text-sm';
  const inputStyle = { background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' };
  const labelCls = 'text-xs tracking-[0.12em] mb-1.5 block';
  const labelStyle = { color: 'var(--color-text-muted)' };

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-stretch justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(20,15,10,0.5)' }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-3xl h-full overflow-y-auto"
        style={{ background: 'var(--color-surface)' }}
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        data-lenis-prevent
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {isEdit ? 'Edit Product' : 'New Product'}
          </h2>
          <div className="flex items-center gap-2">
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton onClick={save} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </PrimaryButton>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-destructive)' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* Basics */}
          <Card>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls} style={labelStyle}>Title *</label>
                <input className={inputCls} style={inputStyle} value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="Product name" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Subtitle</label>
                <input className={inputCls} style={inputStyle} value={draft.subtitle} onChange={(e) => update({ subtitle: e.target.value })} placeholder="Optional subtitle" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Handle (URL slug)</label>
                <input className={inputCls} style={inputStyle} value={draft.handle} onChange={(e) => update({ handle: e.target.value })} placeholder={slugify(draft.title) || 'auto-generated'} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls} style={labelStyle}>Description</label>
                <textarea className={inputCls} style={inputStyle} rows={4} value={draft.description} onChange={(e) => update({ description: e.target.value })} placeholder="Full product description" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Status</label>
                <select className={inputCls} style={inputStyle} value={draft.status} onChange={(e) => update({ status: e.target.value as 'draft' | 'published' })}>
                  <option value="draft">Draft (unpublished)</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Material</label>
                <input className={inputCls} style={inputStyle} value={draft.material} onChange={(e) => update({ material: e.target.value })} placeholder="e.g. Epoxy resin" />
              </div>
            </div>
          </Card>

          {/* Variants & pricing */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Variants & Pricing</h3>
              <button className="text-xs flex items-center gap-1" style={{ color: 'var(--color-accent)' }} onClick={addVariant}>
                <Plus size={12} /> Add variant
              </button>
            </div>
            <div className="space-y-3">
              {draft.variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-3 rounded-xl" style={{ background: 'var(--color-ivory)' }}>
                  <div className="md:col-span-3">
                    <label className={labelCls} style={labelStyle}>Title</label>
                    <input className={inputCls} style={inputStyle} value={v.title} onChange={(e) => updateVariant(idx, { title: e.target.value })} />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelCls} style={labelStyle}>SKU</label>
                    <input className={inputCls} style={inputStyle} value={v.sku} onChange={(e) => updateVariant(idx, { sku: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls} style={labelStyle}>Price (₹)</label>
                    <input type="number" className={inputCls} style={inputStyle} value={v.price} onChange={(e) => updateVariant(idx, { price: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls} style={labelStyle}>Inventory</label>
                    <input type="number" className={inputCls} style={inputStyle} value={v.inventory} onChange={(e) => updateVariant(idx, { inventory: e.target.value })} disabled={!!v.id} />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    {draft.variants.length > 1 && (
                      <button className="p-2.5 rounded-lg" style={{ color: 'var(--color-destructive)' }} onClick={() => removeVariant(idx)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Prices are in INR. Inventory is set when a variant is first created; edit stock levels on the Inventory page.
            </p>
          </Card>

          {/* Images */}
          <Card>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Images</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              {draft.images.map((img, idx) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden" style={{ height: 90, border: `2px solid ${draft.thumbnail === img.url ? 'var(--color-accent)' : 'var(--color-border-subtle)'}` }}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <button className="text-white text-xs px-2 py-1 rounded" onClick={() => makeThumbnail(img.url)}>Set thumbnail</button>
                    <button className="text-white p-1" onClick={() => removeImage(idx)}><X size={14} /></button>
                  </div>
                  {draft.thumbnail === img.url && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: 'var(--color-accent)', color: 'white' }}>THUMB</div>
                  )}
                </div>
              ))}
              <label className="rounded-xl flex flex-col items-center justify-center cursor-pointer" style={{ height: 90, background: 'var(--color-ivory)', border: '1px dashed var(--color-border)' }}>
                {uploading ? <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} /> : <ImageIcon size={18} style={{ color: 'var(--color-text-muted)' }} />}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
              </label>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Upload product images. Click an image to set it as the thumbnail.</p>
          </Card>

          {/* Organization */}
          <Card>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Organization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={labelStyle}>Categories</label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 rounded-lg" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}>
                  {categories.length === 0 && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No categories.</span>}
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      <input type="checkbox" checked={draft.categories.includes(c.id)} onChange={(e) => update({ categories: e.target.checked ? [...draft.categories, c.id] : draft.categories.filter((x) => x !== c.id) })} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Collection</label>
                <select className={inputCls} style={inputStyle} value={draft.collection_id} onChange={(e) => update({ collection_id: e.target.value })}>
                  <option value="">— None —</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelCls} style={labelStyle}>Tags (comma separated)</label>
                <input className={inputCls} style={inputStyle} value={draft.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="resin, eco, beginner" />
              </div>
            </div>
          </Card>

          {/* SEO */}
          <Card>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>SEO</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls} style={labelStyle}>SEO Title</label>
                <input className={inputCls} style={inputStyle} value={draft.seo_title} onChange={(e) => update({ seo_title: e.target.value })} placeholder="Search engine title" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>SEO Description</label>
                <textarea className={inputCls} style={inputStyle} rows={2} value={draft.seo_description} onChange={(e) => update({ seo_description: e.target.value })} placeholder="Meta description" />
              </div>
            </div>
          </Card>

          {/* Shipping */}
          <Card>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Shipping & Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={labelStyle}>Weight (g)</label>
                <input type="number" className={inputCls} style={inputStyle} value={draft.weight} onChange={(e) => update({ weight: e.target.value })} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Origin Country</label>
                <input className={inputCls} style={inputStyle} value={draft.origin_country} onChange={(e) => update({ origin_country: e.target.value })} placeholder="in" />
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- List page ---------------- */

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c, col] = await Promise.all([
        adminApi.listProducts({ limit: 200 }),
        adminApi.listCategories(),
        adminApi.listCollections(),
      ]);
      setProducts(p?.products ?? []);
      setCategories(c?.product_categories ?? []);
      setCollections(col?.collections ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [products, query, statusFilter]);

  const openNew = () => {
    setEditing(null);
    setShowEditor(true);
  };
  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setShowEditor(true);
  };

  const setStatus = async (p: AdminProduct, status: 'published' | 'draft') => {
    setBusyId(p.id);
    try {
      await adminApi.setProductStatus(p.id, status);
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, status } : x)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const duplicate = async (p: AdminProduct) => {
    setBusyId(p.id);
    try {
      await adminApi.createProduct({
        title: `${p.title} (Copy)`,
        description: p.description,
        status: 'draft',
        handle: `${p.handle}-copy-${Date.now()}`,
        tags: p.tags,
        categories: p.categories?.map((c) => ({ id: c.id })),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: AdminProduct) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      await adminApi.deleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} total · ${products.filter((p) => p.status === 'published').length} published`}
        action={<PrimaryButton onClick={openNew}><Plus size={14} /> New Product</PrimaryButton>}
      />

      {error && <div className="mb-4"><ErrorState message={error} /></div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl px-4 py-2.5 outline-none text-sm"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {loading ? (
        <Loading label="Loading products…" />
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No products found" description="Create your first product or adjust your filters." action={<PrimaryButton onClick={openNew}><Plus size={14} /> New Product</PrimaryButton>} /></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Product</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Status</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Variants</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Updated</th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-ivory)' }}><ImageIcon size={16} style={{ color: 'var(--color-text-muted)' }} /></div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{p.title}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>/{p.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'published' ? <Badge tone="success">Published</Badge> : <Badge tone="neutral">Draft</Badge>}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{p.variants?.length ?? 0}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(p.updated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }} onClick={() => openEdit(p)} title="Edit"><Pencil size={15} /></button>
                        <button className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }} onClick={() => window.open(`/${p.handle}`, '_blank')} title="View on store"><ExternalLink size={15} /></button>
                        {p.status === 'published' ? (
                          <button className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setStatus(p, 'draft')} title="Unpublish" disabled={busyId === p.id}><EyeOff size={15} /></button>
                        ) : (
                          <button className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setStatus(p, 'published')} title="Publish" disabled={busyId === p.id}><Send size={15} /></button>
                        )}
                        <button className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }} onClick={() => duplicate(p)} title="Duplicate" disabled={busyId === p.id}><Copy size={15} /></button>
                        <button className="p-2 rounded-lg" style={{ color: 'var(--color-destructive)' }} onClick={() => remove(p)} title="Delete" disabled={busyId === p.id}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {showEditor && (
          <AdminProductEditor
            editProduct={editing}
            categories={categories}
            collections={collections}
            onClose={() => setShowEditor(false)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
