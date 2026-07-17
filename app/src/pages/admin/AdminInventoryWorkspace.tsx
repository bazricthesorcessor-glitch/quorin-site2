import { useMemo, useState } from 'react';
import { Boxes, Pencil, RefreshCw, Save, Search, TriangleAlert, X } from 'lucide-react';
import { adminApi, type AdminInventoryItem } from '@/lib/adminApi';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { Badge, Card, ErrorState, GhostButton, Loading, PageHeader, StatCard } from '@/components/admin/AdminUI';
import { useAdminResource } from '@/hooks/useAdminResource';

const stockTone = (quantity: number): 'success' | 'warning' | 'danger' => quantity <= 0 ? 'danger' : quantity <= 5 ? 'warning' : 'success';

export default function AdminInventoryWorkspace() {
  const resource = useAdminResource(() => adminApi.listInventory({ limit: 100 }), []);
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('0');
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const items = resource.data?.inventory_items ?? [];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !needle || `${item.title ?? ''} ${item.sku ?? ''} ${item.id}`.toLowerCase().includes(needle);
      const matchesStock = stockFilter === 'all' || (stockFilter === 'out' ? item.stocked_quantity <= 0 : item.stocked_quantity > 0 && item.stocked_quantity <= 5);
      return matchesSearch && matchesStock;
    });
  }, [items, query, stockFilter]);

  const lowStock = items.filter((item) => item.stocked_quantity > 0 && item.stocked_quantity <= 5).length;
  const outOfStock = items.filter((item) => item.stocked_quantity <= 0).length;

  const startEdit = (item: AdminInventoryItem) => { setMutationError(null); setEditingId(item.id); setQuantity(String(item.stocked_quantity)); };
  const save = async (item: AdminInventoryItem) => {
    const next = Number(quantity);
    if (!Number.isFinite(next) || next < 0 || !Number.isInteger(next)) { setMutationError('Stock quantity must be a non-negative whole number.'); return; }
    setSaving(true); setMutationError(null);
    try { await adminApi.updateInventoryItem(item.id, { stocked_quantity: next }); setEditingId(null); await resource.reload(); }
    catch (cause) { setMutationError(cause instanceof Error ? cause.message : 'Inventory update failed.'); }
    finally { setSaving(false); }
  };

  const columns: AdminColumn<AdminInventoryItem>[] = [
    { key: 'item', label: 'Inventory item', render: (item) => <div><div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.title ?? 'Untitled inventory item'}</div><div className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{item.sku ?? item.id.slice(0, 14)}</div></div> },
    { key: 'stock', label: 'Stocked', render: (item) => editingId === item.id ? <input autoFocus type="number" min={0} step={1} aria-label={`Stock quantity for ${item.title ?? item.sku ?? item.id}`} className="w-28 rounded-lg px-2 py-1.5 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={quantity} onChange={(event) => setQuantity(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void save(item); if (event.key === 'Escape') setEditingId(null); }} /> : <Badge tone={stockTone(item.stocked_quantity)}>{item.stocked_quantity}</Badge> },
    { key: 'reserved', label: 'Reserved', render: (item) => <span style={{ color: 'var(--color-text-secondary)' }}>{item.reserved_quantity}</span> },
    { key: 'available', label: 'Available', render: (item) => <strong style={{ color: 'var(--color-text-primary)' }}>{Math.max(0, item.stocked_quantity - item.reserved_quantity)}</strong> },
    { key: 'action', label: 'Action', align: 'right', render: (item) => editingId === item.id ? <div className="flex justify-end gap-1"><button type="button" aria-label="Save stock quantity" disabled={saving} className="p-2 rounded-lg" style={{ color: 'var(--color-success)' }} onClick={() => void save(item)}><Save size={16} /></button><button type="button" aria-label="Cancel stock edit" className="p-2 rounded-lg" style={{ color: 'var(--color-text-muted)' }} onClick={() => setEditingId(null)}><X size={16} /></button></div> : <button type="button" aria-label={`Edit stock for ${item.title ?? item.sku ?? item.id}`} className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }} onClick={() => startEdit(item)}><Pencil size={16} /></button> },
  ];

  if (resource.loading) return <Loading label="Loading inventory…" />;
  if (resource.error && !resource.data) return <ErrorState message={resource.error} retry={resource.reload} />;

  return <div><PageHeader title="Inventory" subtitle="Track available, reserved and low-stock inventory." action={<GhostButton onClick={() => void resource.reload()}><RefreshCw size={15} className={resource.refreshing ? 'animate-spin' : ''} /> Refresh</GhostButton>} />{(resource.error || mutationError) && <div className="mb-4"><ErrorState message={mutationError ?? resource.error ?? ''} retry={resource.error ? resource.reload : undefined} /></div>}<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><StatCard label="Inventory items" value={items.length} icon={Boxes} /><StatCard label="Low stock" value={lowStock} icon={TriangleAlert} /><StatCard label="Out of stock" value={outOfStock} icon={TriangleAlert} accent={outOfStock > 0} /></div><Card className="mb-4"><div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3"><label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} /><input className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="Search title, SKU or inventory ID…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filter inventory by stock state" className="rounded-xl px-3 py-2.5 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={stockFilter} onChange={(event) => setStockFilter(event.target.value as 'all' | 'low' | 'out')}><option value="all">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></div></Card><AdminTable rows={filtered} columns={columns} rowKey={(item) => item.id} emptyTitle="No matching inventory" emptyDescription="Try clearing the search or stock filter." /></div>;
}
