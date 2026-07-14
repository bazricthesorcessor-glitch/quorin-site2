import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Pencil, Save, X, Search, Package, Boxes, Layers, Ticket,
  ShoppingCart, Users, BarChart3, Image as ImageIcon, Settings as SettingsIcon,
  UserCog, ScrollText, Loader2, AlertCircle,
} from 'lucide-react';
import {
  adminApi,
  type AdminCategory, type AdminCollection, type AdminOrder, type AdminCustomer,
  type AdminInventoryItem, type AdminPromotion,
} from '@/lib/adminApi';
import {
  PageHeader, Card, Loading, ErrorState, EmptyState, PrimaryButton, GhostButton, Badge, StatCard, Modal, ConfirmDialog,
} from '@/components/admin/AdminUI';

const useAsync = <T,>(fn: () => Promise<T>, deps: unknown[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = () => {
    setLoading(true);
    setError(null);
    fn().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(reload, deps);
  return { data, loading, error, reload, setData };
};

const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fmtMoney = (amount: number) => `₹${amount.toFixed(0)}`;

/* =================== Categories =================== */

export function AdminCategoriesPage() {
  const { data, loading, error, reload } = useAsync(() => adminApi.listCategories());
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [draft, setDraft] = useState({ name: '', description: '', handle: '', is_active: true });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const startNew = () => { setMutationError(null); setEditing(null); setDraft({ name: '', description: '', handle: '', is_active: true }); setShowForm(true); };
  const startEdit = (c: AdminCategory) => { setMutationError(null); setEditing(c); setDraft({ name: c.name, description: c.description ?? '', handle: c.handle, is_active: c.is_active }); setShowForm(true); };

  const save = async () => {
    setSaving(true); setMutationError(null);
    try {
      const payload = { name: draft.name, description: draft.description || undefined, handle: draft.handle || slugify(draft.name), is_active: draft.is_active };
      if (editing) await adminApi.updateCategory(editing.id, payload);
      else await adminApi.createCategory(payload);
      setShowForm(false); reload();
    } catch (e) { setMutationError((e as Error).message); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true); setMutationError(null);
    try { await adminApi.deleteCategory(deleteTarget.id); setDeleteTarget(null); reload(); }
    catch (e) { setMutationError((e as Error).message); }
    finally { setDeleting(false); }
  };

  if (loading) return <Loading label="Loading categories…" />;
  if (error) return <ErrorState message={error} retry={reload} />;

  return (
    <div>
      <PageHeader title="Categories" subtitle={`${data?.product_categories?.length ?? 0} categories`} action={<PrimaryButton onClick={startNew}><Plus size={14} /> New Category</PrimaryButton>} />
      {mutationError && <div className="mb-4"><ErrorState message={mutationError} /></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.product_categories?.map((c) => (
          <Card key={c.id}><div className="flex items-start justify-between"><div><div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{c.name}</div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/{c.handle}</div></div>{c.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}</div><p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>{c.description || 'No description.'}</p><div className="flex gap-2 mt-4"><GhostButton onClick={() => startEdit(c)}><Pencil size={14} /> Edit</GhostButton><button className="p-2.5 rounded-xl" aria-label={`Delete ${c.name}`} style={{ color: 'var(--color-destructive)' }} onClick={() => setDeleteTarget(c)}><Trash2 size={15} /></button></div></Card>
        ))}
        {(data?.product_categories?.length ?? 0) === 0 && <Card><EmptyState title="No categories" description="Create your first category." action={<PrimaryButton onClick={startNew}><Plus size={14} /> New Category</PrimaryButton>} /></Card>}
      </div>
      <Modal open={showForm} title={editing ? 'Edit Category' : 'New Category'} description="Categories organize storefront discovery and merchandising." onClose={() => setShowForm(false)} footer={<><GhostButton onClick={() => setShowForm(false)}>Cancel</GhostButton><PrimaryButton onClick={save} disabled={saving || !draft.name.trim()}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</PrimaryButton></>}><div className="space-y-3"><div><label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Name</label><input className="w-full rounded-lg px-3 py-2.5 mt-1" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div><div><label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Handle</label><input className="w-full rounded-lg px-3 py-2.5 mt-1" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={draft.handle} placeholder={slugify(draft.name)} onChange={(e) => setDraft({ ...draft, handle: e.target.value })} /></div><div><label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Description</label><textarea className="w-full rounded-lg px-3 py-2.5 mt-1" rows={3} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div><label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label></div></Modal>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete category?" description={deleteTarget ? `Delete “${deleteTarget.name}”? Products using this category may lose that storefront grouping.` : ''} confirmLabel="Delete category" destructive busy={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    </div>
  );
}

/* =================== Collections =================== */

export function AdminCollectionsPage() {
  const { data, loading, error, reload } = useAsync(() => adminApi.listCollections());
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: '', handle: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCollection | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const save = async () => { setSaving(true); setMutationError(null); try { await adminApi.createCollection({ title: draft.title, handle: draft.handle || slugify(draft.title), description: draft.description || undefined }); setDraft({ title: '', handle: '', description: '' }); setShowForm(false); reload(); } catch (e) { setMutationError((e as Error).message); } finally { setSaving(false); } };
  const remove = async () => { if (!deleteTarget) return; setDeleting(true); setMutationError(null); try { await adminApi.deleteCollection(deleteTarget.id); setDeleteTarget(null); reload(); } catch (e) { setMutationError((e as Error).message); } finally { setDeleting(false); } };

  if (loading) return <Loading label="Loading collections…" />;
  if (error) return <ErrorState message={error} retry={reload} />;

  return <div><PageHeader title="Collections" subtitle={`${data?.collections?.length ?? 0} collections`} action={<PrimaryButton onClick={() => { setMutationError(null); setShowForm(true); }}><Plus size={14} /> New Collection</PrimaryButton>} />{mutationError && <div className="mb-4"><ErrorState message={mutationError} /></div>}{(data?.collections?.length ?? 0) === 0 ? <Card><EmptyState title="No collections" description="Group products into collections for themed merchandising." action={<PrimaryButton onClick={() => setShowForm(true)}><Plus size={14} /> New Collection</PrimaryButton>} /></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{data?.collections?.map((c) => <Card key={c.id}><div className="flex items-start justify-between"><div><div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{c.title}</div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/{c.handle}</div></div><button className="p-2 rounded-lg" aria-label={`Delete ${c.title}`} style={{ color: 'var(--color-destructive)' }} onClick={() => setDeleteTarget(c)}><Trash2 size={15} /></button></div><p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>{c.description || 'No description.'}</p></Card>)}</div>}<Modal open={showForm} title="New Collection" description="Create a curated product group for campaigns and storefront merchandising." onClose={() => setShowForm(false)} footer={<><GhostButton onClick={() => setShowForm(false)}>Cancel</GhostButton><PrimaryButton onClick={save} disabled={saving || !draft.title.trim()}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</PrimaryButton></>}><div className="space-y-3"><div><label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Title</label><input className="w-full rounded-lg px-3 py-2.5 mt-1" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div><div><label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Handle</label><input className="w-full rounded-lg px-3 py-2.5 mt-1" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={draft.handle} placeholder={slugify(draft.title)} onChange={(e) => setDraft({ ...draft, handle: e.target.value })} /></div><div><label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Description</label><textarea className="w-full rounded-lg px-3 py-2.5 mt-1" rows={3} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div></div></Modal><ConfirmDialog open={Boolean(deleteTarget)} title="Delete collection?" description={deleteTarget ? `Delete “${deleteTarget.title}”? This removes the collection grouping, not the underlying products.` : ''} confirmLabel="Delete collection" destructive busy={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={remove} /></div>;
}

/* =================== Orders =================== */

export function AdminOrdersPage() {
  const { data, loading, error } = useAsync(() => adminApi.listOrders({ limit: 100 }));
  if (loading) return <Loading label="Loading orders…" />;
  if (error) return <ErrorState message={error} />;

  const orders = data?.orders ?? [];
  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} orders`} />
      {orders.length === 0 ? (
        <Card><EmptyState title="No orders yet" description="Orders will appear here once customers complete checkout." /></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Order</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Customer</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Date</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Payment</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Fulfillment</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Total</th>
              </tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>{o.id.slice(0, 12)}…</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{o.email ?? 'Guest'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge tone="neutral">{o.payment_status ?? '—'}</Badge></td>
                    <td className="px-4 py-3"><Badge tone="neutral">{o.fulfillment_status ?? '—'}</Badge></td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-accent)' }}>{fmtMoney(o.summary?.total ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* =================== Customers =================== */

export function AdminCustomersPage() {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useAsync(() => adminApi.listCustomers({ limit: 100 }));
  if (loading) return <Loading label="Loading customers…" />;
  if (error) return <ErrorState message={error} />;

  const customers = (data?.customers ?? []).filter((c) => !query || c.email.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <PageHeader title="Customers" subtitle={`${data?.count ?? 0} customers`} />
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <input className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm" style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="Search customers…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {customers.length === 0 ? (
        <Card><EmptyState title="No customers found" description="Customers appear here after they register or place an order." /></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Name</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Email</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Phone</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Joined</th>
              </tr></thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{c.email}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* =================== Inventory =================== */

export function AdminInventoryPage() {
  const { data, loading, error, reload } = useAsync(() => adminApi.listInventory());
  const [editId, setEditId] = useState<string | null>(null);
  const [stockVal, setStockVal] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading) return <Loading label="Loading inventory…" />;
  if (error) return <ErrorState message={error} />;

  const items = data?.inventory_items ?? [];
  const save = async (item: AdminInventoryItem) => {
    setSaving(true);
    try { await adminApi.updateInventoryItem(item.id, { stocked_quantity: Number(stockVal) }); setEditId(null); reload(); }
    catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${items.length} inventory items`} />
      {items.length === 0 ? (
        <Card><EmptyState title="No inventory items" description="Inventory is created automatically with product variants." /></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>SKU</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Title</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>In Stock</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Reserved</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Action</th>
              </tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>{i.sku ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{i.title ?? i.id.slice(0, 10)}</td>
                    <td className="px-4 py-3">{editId === i.id ? <input type="number" className="w-24 rounded-lg px-2 py-1.5 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={stockVal} onChange={(e) => setStockVal(e.target.value)} /> : <Badge tone={i.stocked_quantity === 0 ? 'danger' : i.stocked_quantity <= 5 ? 'warning' : 'success'}>{i.stocked_quantity}</Badge>}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>{i.reserved_quantity}</td>
                    <td className="px-4 py-3 text-right">{editId === i.id ? <div className="flex justify-end gap-1"><button className="p-2 rounded-lg" style={{ color: 'var(--color-success)' }} onClick={() => save(i)} disabled={saving}><Save size={15} /></button><button className="p-2 rounded-lg" style={{ color: 'var(--color-text-muted)' }} onClick={() => setEditId(null)}><X size={15} /></button></div> : <button className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }} onClick={() => { setEditId(i.id); setStockVal(String(i.stocked_quantity)); }}><Pencil size={15} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* =================== Coupons =================== */

export function AdminCouponsPage() {
  const { data, loading, error } = useAsync(() => adminApi.listPromotions());
  if (loading) return <Loading label="Loading promotions…" />;
  if (error) return <ErrorState message={error} />;
  const promos = data?.promotions ?? [];
  return <div><PageHeader title="Coupons & Promotions" subtitle={`${promos.length} promotions`} action={<PrimaryButton disabled><Plus size={14} /> New Promotion</PrimaryButton>} />{promos.length === 0 ? <Card><EmptyState title="No promotions yet" description="Promotions are managed via Medusa's promotion engine. Create discount codes, automatic promotions, and buy-X-get-Y rules from this page in a future update." /></Card> : <Card className="p-0 overflow-hidden"><table className="w-full text-sm"><thead><tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Code</th><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Status</th><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Type</th><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Created</th></tr></thead><tbody>{promos.map((p: AdminPromotion) => <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}><td className="px-4 py-3 font-mono" style={{ color: 'var(--color-text-primary)' }}>{p.code}</td><td className="px-4 py-3"><Badge tone="neutral">{p.status}</Badge></td><td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{p.is_automatic ? 'Automatic' : 'Code'}</td><td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></Card>}</div>;
}

/* =================== Analytics =================== */

export function AdminAnalyticsPage() {
  const { data: orders } = useAsync(() => adminApi.listOrders({ limit: 100 }));
  const { data: products } = useAsync(() => adminApi.listProducts({ limit: 200 }));
  const { data: customers } = useAsync(() => adminApi.listCustomers({ limit: 100 }));
  if (!orders || !products || !customers) return <Loading label="Computing analytics…" />;
  const orderList = orders.orders ?? [];
  const productList = products.products ?? [];
  const totalRevenue = orderList.reduce((s, o) => s + (o.summary?.total ?? 0), 0);
  const aov = (orders?.count ?? 0) > 0 ? totalRevenue / (orders?.count ?? 1) : 0;
  const published = productList.filter((p) => p.status === 'published').length;
  return <div><PageHeader title="Analytics" subtitle="Store performance at a glance" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"><StatCard label="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon={BarChart3} accent /><StatCard label="Orders" value={orders.count} icon={ShoppingCart} /><StatCard label="Avg Order Value" value={`₹${aov.toFixed(0)}`} icon={Ticket} /><StatCard label="Customers" value={customers.count} icon={Users} /></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card><h2 className="text-sm tracking-[0.15em] mb-4" style={{ color: 'var(--color-text-muted)' }}>CATALOG HEALTH</h2><div className="space-y-3"><div className="flex justify-between"><span style={{ color: 'var(--color-text-secondary)' }}>Published products</span><strong style={{ color: 'var(--color-text-primary)' }}>{published}</strong></div><div className="flex justify-between"><span style={{ color: 'var(--color-text-secondary)' }}>Total products</span><strong style={{ color: 'var(--color-text-primary)' }}>{productList.length}</strong></div></div></Card><Card><h2 className="text-sm tracking-[0.15em] mb-4" style={{ color: 'var(--color-text-muted)' }}>DATA WINDOW</h2><p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Analytics currently summarize the records returned by the admin API. Date-range controls and server-side aggregates are still required before this should be treated as a complete reporting system.</p></Card></div></div>;
}

export function AdminPlaceholderPage({ title, description, icon: Icon = SettingsIcon }: { title: string; description: string; icon?: typeof SettingsIcon }) {
  return <div><PageHeader title={title} /><Card><EmptyState title={title} description={description} action={<div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}><Icon size={22} /></div>} /></Card></div>;
}
