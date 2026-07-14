import { useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw, Search, ShoppingCart } from 'lucide-react';
import { adminApi, type AdminOrder } from '@/lib/adminApi';
import { Badge, Card, EmptyState, ErrorState, GhostButton, Loading, Modal, PageHeader, StatCard } from '@/components/admin/AdminUI';

const money = (amount: number, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(amount);
const statusTone = (status?: string | null): 'neutral' | 'success' | 'warning' | 'danger' => {
  const value = status?.toLowerCase() ?? '';
  if (['paid', 'captured', 'fulfilled', 'completed'].some((item) => value.includes(item))) return 'success';
  if (['cancel', 'fail', 'refund'].some((item) => value.includes(item))) return 'danger';
  if (['pending', 'not_fulfilled', 'requires_action'].some((item) => value.includes(item))) return 'warning';
  return 'neutral';
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState('all');
  const [fulfillment, setFulfillment] = useState('all');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try { const result = await adminApi.listOrders({ limit: 100 }); setOrders(result.orders ?? []); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const openOrder = async (order: AdminOrder) => {
    setSelected(order); setDetailLoading(true);
    try { const result = await adminApi.getOrder(order.id); setSelected(result.order); }
    catch { /* Keep the list payload visible when detail enrichment fails. */ }
    finally { setDetailLoading(false); }
  };

  const paymentOptions = useMemo(() => Array.from(new Set(orders.map((order) => order.payment_status).filter(Boolean) as string[])), [orders]);
  const fulfillmentOptions = useMemo(() => Array.from(new Set(orders.map((order) => order.fulfillment_status).filter(Boolean) as string[])), [orders]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const searchable = `${order.display_id ?? ''} ${order.id} ${order.email ?? ''}`.toLowerCase();
      return (!needle || searchable.includes(needle)) && (payment === 'all' || order.payment_status === payment) && (fulfillment === 'all' || order.fulfillment_status === fulfillment);
    });
  }, [orders, query, payment, fulfillment]);
  const revenue = filtered.reduce((sum, order) => sum + (order.summary?.total ?? 0), 0);

  if (loading) return <Loading label="Loading orders…" />;
  if (error) return <ErrorState message={error} retry={load} />;

  return <div>
    <PageHeader title="Orders" subtitle="Search, inspect and track customer orders." action={<GhostButton onClick={load}><RefreshCw size={15} /> Refresh</GhostButton>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Visible orders" value={filtered.length} icon={ShoppingCart} />
      <StatCard label="Visible revenue" value={money(revenue, filtered[0]?.currency_code ?? 'INR')} icon={ShoppingCart} accent />
    </div>
    <Card className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
        <label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} /><input className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="Search order number, ID or customer email…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <select aria-label="Filter by payment status" className="rounded-xl px-3 py-2.5 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={payment} onChange={(e) => setPayment(e.target.value)}><option value="all">All payments</option>{paymentOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select aria-label="Filter by fulfillment status" className="rounded-xl px-3 py-2.5 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={fulfillment} onChange={(e) => setFulfillment(e.target.value)}><option value="all">All fulfillment</option>{fulfillmentOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      </div>
    </Card>
    {filtered.length === 0 ? <Card><EmptyState title="No matching orders" description="Try clearing the search or status filters." action={<GhostButton onClick={() => { setQuery(''); setPayment('all'); setFulfillment('all'); }}>Clear filters</GhostButton>} /></Card> : <Card className="p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Order</th><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Customer</th><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Date</th><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Payment</th><th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Fulfillment</th><th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>Total</th><th className="w-12" /></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}><td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>#{order.display_id ?? order.id.slice(0, 8)}</td><td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{order.email ?? 'Guest'}</td><td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>{new Date(order.created_at).toLocaleString()}</td><td className="px-4 py-3"><Badge tone={statusTone(order.payment_status)}>{order.payment_status ?? 'Unknown'}</Badge></td><td className="px-4 py-3"><Badge tone={statusTone(order.fulfillment_status)}>{order.fulfillment_status ?? 'Unknown'}</Badge></td><td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-accent)' }}>{money(order.summary?.total ?? 0, order.currency_code)}</td><td className="px-3"><button type="button" aria-label={`View order ${order.display_id ?? order.id}`} className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }} onClick={() => void openOrder(order)}><Eye size={16} /></button></td></tr>)}</tbody></table></div></Card>}
    <Modal open={Boolean(selected)} title={selected ? `Order #${selected.display_id ?? selected.id.slice(0, 8)}` : 'Order'} description={selected?.email ?? 'Guest checkout'} onClose={() => setSelected(null)} maxWidth="max-w-3xl"><>{detailLoading && <div className="mb-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>Loading full order details…</div>}{selected && <div className="space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Payment</div><div className="mt-1"><Badge tone={statusTone(selected.payment_status)}>{selected.payment_status ?? 'Unknown'}</Badge></div></div><div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Fulfillment</div><div className="mt-1"><Badge tone={statusTone(selected.fulfillment_status)}>{selected.fulfillment_status ?? 'Unknown'}</Badge></div></div><div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Created</div><div className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>{new Date(selected.created_at).toLocaleString()}</div></div><div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total</div><div className="font-bold mt-1" style={{ color: 'var(--color-accent)' }}>{money(selected.summary?.total ?? 0, selected.currency_code)}</div></div></div><div><h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Items</h3>{selected.items?.length ? <div className="space-y-2">{selected.items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}>{item.thumbnail ? <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg" style={{ background: 'var(--color-surface-hover)' }} />}<div className="min-w-0 flex-1"><div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{item.title}</div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Quantity {item.quantity}</div></div><div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{money(item.unit_price * item.quantity, selected.currency_code)}</div></div>)}</div> : <EmptyState title="No line items returned" description="The current order payload did not include item details." />}</div>{selected.summary && <div className="ml-auto max-w-sm space-y-2 text-sm"><div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span><span>{money(selected.summary.subtotal ?? 0, selected.currency_code)}</span></div><div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>Shipping</span><span>{money(selected.summary.shipping_total ?? 0, selected.currency_code)}</span></div><div className="flex justify-between"><span style={{ color: 'var(--color-text-muted)' }}>Tax</span><span>{money(selected.summary.tax_total ?? 0, selected.currency_code)}</span></div><div className="flex justify-between font-bold pt-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}><span>Total</span><span>{money(selected.summary.total ?? 0, selected.currency_code)}</span></div></div>}</div>}</></Modal>
  </div>;
}
