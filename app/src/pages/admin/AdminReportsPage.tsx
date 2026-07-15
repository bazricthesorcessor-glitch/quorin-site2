import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, Download, FileText, Package, RefreshCw, ShoppingCart, Users } from 'lucide-react';
import { adminApi, type AdminProduct } from '@/lib/adminApi';
import { Card, ErrorState, Loading, PageHeader, PrimaryButton, StatCard } from '@/components/admin/AdminUI';

type ReportTab = 'overview' | 'sales' | 'products' | 'customers' | 'inventory';
type LoadedReports = {
  orders: Awaited<ReturnType<typeof adminApi.listOrders>>;
  products: Awaited<ReturnType<typeof adminApi.listProducts>>;
  customers: Awaited<ReturnType<typeof adminApi.listCustomers>>;
};

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

function downloadCsv(name: string, rows: unknown[][]) {
  const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [data, setData] = useState<LoadedReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ReportTab>('overview');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [orders, products, customers] = await Promise.all([
        adminApi.listOrders({ limit: 200 }), adminApi.listProducts({ limit: 200 }), adminApi.listCustomers({ limit: 200 }),
      ]);
      setData({ orders, products, customers });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load reports.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const metrics = useMemo(() => {
    const orders = data?.orders.orders ?? [];
    const products = data?.products.products ?? [];
    const customers = data?.customers.customers ?? [];
    const revenue = orders.reduce((sum, order) => sum + (order.summary?.total ?? 0), 0);
    const orderCount = data?.orders.count ?? orders.length;
    const published = products.filter((product) => product.status === 'published').length;
    const draft = products.filter((product) => product.status !== 'published').length;
    const variants = products.reduce((sum, product) => sum + (product.variants?.length ?? 0), 0);
    return { orders, products, customers, revenue, orderCount, average: orderCount ? revenue / orderCount : 0, published, draft, variants };
  }, [data]);

  const exportCurrent = () => {
    if (tab === 'sales' || tab === 'overview') {
      downloadCsv('quorin-sales-report', [['Order', 'Date', 'Status', 'Total'], ...metrics.orders.map((order) => [order.display_id ?? order.id, order.created_at, order.status, order.summary?.total ?? 0])]);
    } else if (tab === 'products' || tab === 'inventory') {
      downloadCsv(`quorin-${tab}-report`, [['Product', 'Handle', 'Status', 'Variants'], ...metrics.products.map((product: AdminProduct) => [product.title, product.handle, product.status, product.variants?.length ?? 0])]);
    } else {
      downloadCsv('quorin-customer-report', [['Customer', 'Email', 'Phone'], ...metrics.customers.map((customer) => [[customer.first_name, customer.last_name].filter(Boolean).join(' '), customer.email, customer.phone])]);
    }
  };

  if (loading) return <Loading label="Building live reports…" />;
  if (error || !data) return <ErrorState message={error ?? 'Reports are unavailable.'} retry={load} />;

  const tabs: { id: ReportTab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, { id: 'sales', label: 'Sales' }, { id: 'products', label: 'Products' },
    { id: 'customers', label: 'Customers' }, { id: 'inventory', label: 'Inventory' },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Exportable operational reports generated from live admin API records." action={<div className="flex gap-2"><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}><RefreshCw size={15} /> Refresh</button><PrimaryButton onClick={exportCurrent}><Download size={15} /> Export CSV</PrimaryButton></div>} />

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Revenue in loaded window" value={money(metrics.revenue)} icon={BarChart3} accent />
        <StatCard label="Orders" value={metrics.orderCount} icon={ShoppingCart} />
        <StatCard label="Average order" value={money(metrics.average)} icon={FileText} />
        <StatCard label="Products" value={metrics.products.length} icon={Package} />
        <StatCard label="Customers" value={data.customers.count ?? metrics.customers.length} icon={Users} />
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Report category">
        {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className="shrink-0 rounded-full px-4 py-2 text-sm font-medium" style={{ background: tab === item.id ? 'var(--color-accent)' : 'var(--color-surface)', color: tab === item.id ? 'white' : 'var(--color-text-secondary)', border: '1px solid var(--color-border-subtle)' }}>{item.label}</button>)}
      </div>

      <Card className="mt-4 p-0 overflow-hidden">
        {tab === 'overview' && <div className="p-6"><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Operational report summary</h2><p className="mt-2 text-sm max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>This workspace reports only records returned by the canonical admin APIs. Profit, tax liability, attribution and historical comparison are intentionally not invented until server-side financial and aggregate contracts exist.</p><div className="grid sm:grid-cols-3 gap-4 mt-6"><Summary label="Published products" value={metrics.published} /><Summary label="Draft products" value={metrics.draft} /><Summary label="Loaded variants" value={metrics.variants} /></div></div>}
        {tab === 'sales' && <ReportTable headers={['Order', 'Created', 'Status', 'Total']} rows={metrics.orders.map((order) => [String(order.display_id ?? order.id), new Date(order.created_at).toLocaleDateString(), order.status, money(order.summary?.total ?? 0)])} empty="No orders in the loaded reporting window." />}
        {tab === 'products' && <ReportTable headers={['Product', 'Handle', 'Status', 'Variants']} rows={metrics.products.map((product) => [product.title, `/${product.handle}`, product.status, String(product.variants?.length ?? 0)])} empty="No products available." />}
        {tab === 'customers' && <ReportTable headers={['Customer', 'Email', 'Phone']} rows={metrics.customers.map((customer) => [[customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Unnamed customer', customer.email, customer.phone || '—'])} empty="No customers available." />}
        {tab === 'inventory' && <div className="p-6"><div className="flex items-center gap-3"><Boxes size={20} style={{ color: 'var(--color-accent)' }} /><div><h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Inventory reporting boundary</h2><p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>The current product response exposes {metrics.variants} loaded variants. Location-level stock valuation and movement reports remain disabled until the canonical inventory-location contract is available.</p></div></div><div className="mt-6"><ReportTable headers={['Product', 'Status', 'Variants']} rows={metrics.products.map((product) => [product.title, product.status, String(product.variants?.length ?? 0)])} empty="No inventory-bearing products available." embedded /></div></div>}
      </Card>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl p-4" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}><div className="text-xs tracking-[0.12em] uppercase" style={{ color: 'var(--color-text-muted)' }}>{label}</div><div className="mt-2 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</div></div>;
}

function ReportTable({ headers, rows, empty, embedded = false }: { headers: string[]; rows: string[][]; empty: string; embedded?: boolean }) {
  const table = <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>{headers.map((header) => <th key={header} className="text-left px-5 py-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>{header}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={headers.length} className="px-5 py-10 text-center" style={{ color: 'var(--color-text-muted)' }}>{empty}</td></tr> : rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>{row.map((cell, index) => <td key={`${index}-${cell}`} className="px-5 py-3" style={{ color: index === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: index === 0 ? 500 : 400 }}>{cell}</td>)}</tr>)}</tbody></table></div>;
  return embedded ? table : table;
}
