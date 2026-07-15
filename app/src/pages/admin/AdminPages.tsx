import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Image as ImageIcon, ScrollText, Settings as SettingsIcon, UserCog } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { Card, EmptyState, ErrorState, Loading, PageHeader, StatCard } from '@/components/admin/AdminUI';
import AdminOrdersWorkspace from './AdminOrdersPage';
import AdminCustomersWorkspace from './AdminCustomersWorkspace';
import AdminInventoryWorkspace from './AdminInventoryWorkspace';
import AdminCatalogGroupsPage from './AdminCatalogGroupsPage';

export { AdminOrdersWorkspace as AdminOrdersPage };
export { AdminCustomersWorkspace as AdminCustomersPage };
export { AdminInventoryWorkspace as AdminInventoryPage };
export const AdminCategoriesPage = () => <AdminCatalogGroupsPage mode="categories" />;
export const AdminCollectionsPage = () => <AdminCatalogGroupsPage mode="collections" />;

function useLoad<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: true });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, error: null, loading: current.data === null }));
    try { setState({ data: await loader(), error: null, loading: false }); }
    catch (cause) { setState((current) => ({ ...current, error: cause instanceof Error ? cause.message : 'Something went wrong.', loading: false })); }
  }, [loader]);
  useEffect(() => { void load(); }, [load]);
  return { ...state, reload: load };
}

export function AdminCouponsPage() {
  const loadPromotions = useCallback(() => adminApi.listPromotions(), []);
  const { data, error, loading, reload } = useLoad(loadPromotions);
  if (loading) return <Loading label="Loading promotions…" />;
  if (error) return <ErrorState message={error} retry={reload} />;
  const promotions = data?.promotions ?? [];
  return <div><PageHeader title="Coupons & Promotions" subtitle={`${promotions.length} promotions`} />{promotions.length === 0 ? <Card><EmptyState title="No promotions yet" description="Promotion creation will be enabled when the Medusa promotion mutation contract is wired. Existing promotions will appear here without fabricated controls." /></Card> : <Card className="space-y-3">{promotions.map((promotion) => <div key={promotion.id} className="flex items-center justify-between gap-4 rounded-xl p-3" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}><div><div className="font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>{promotion.code}</div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{promotion.is_automatic ? 'Automatic promotion' : 'Code promotion'}</div></div><span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{promotion.status}</span></div>)}</Card>}</div>;
}

export function AdminAnalyticsPage() {
  const loadOrders = useCallback(() => adminApi.listOrders({ limit: 100 }), []);
  const loadProducts = useCallback(() => adminApi.listProducts({ limit: 200 }), []);
  const loadCustomers = useCallback(() => adminApi.listCustomers({ limit: 100 }), []);
  const orders = useLoad(loadOrders);
  const products = useLoad(loadProducts);
  const customers = useLoad(loadCustomers);
  if (orders.loading || products.loading || customers.loading) return <Loading label="Computing analytics…" />;
  const error = orders.error || products.error || customers.error;
  if (error) return <ErrorState message={error} retry={async () => { await Promise.all([orders.reload(), products.reload(), customers.reload()]); }} />;
  const orderList = orders.data?.orders ?? [];
  const productList = products.data?.products ?? [];
  const revenue = orderList.reduce((sum, order) => sum + (order.summary?.total ?? 0), 0);
  const count = orders.data?.count ?? orderList.length;
  const average = count > 0 ? revenue / count : 0;
  return <div><PageHeader title="Analytics" subtitle="Operational snapshot from live admin API records." /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard label="Revenue in loaded window" value={`₹${revenue.toFixed(0)}`} icon={BarChart3} accent /><StatCard label="Orders" value={count} icon={ScrollText} /><StatCard label="Average order" value={`₹${average.toFixed(0)}`} icon={BarChart3} /><StatCard label="Customers" value={customers.data?.count ?? 0} icon={UserCog} /></div><Card className="mt-6"><p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>This is intentionally an operational snapshot, not a fake BI dashboard. Date ranges, server-side aggregates and comparison periods remain required before analytics can claim full reporting accuracy.</p><div className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>{productList.filter((product) => product.status === 'published').length} of {productList.length} loaded products are published.</div></Card></div>;
}

function Placeholder({ title, description, icon: Icon }: { title: string; description: string; icon: typeof SettingsIcon }) {
  return <div><PageHeader title={title} /><Card><EmptyState title={title} description={description} action={<div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}><Icon size={22} /></div>} /></Card></div>;
}

export const AdminMediaPage = () => <Placeholder title="Media" description="Central media-library operations are not wired yet. Product media remains managed through product workflows until a canonical asset API is available." icon={ImageIcon} />;
export const AdminSettingsPage = () => <Placeholder title="Settings" description="Store configuration will be surfaced here only when settings have durable backend persistence and validation." icon={SettingsIcon} />;
export const AdminAdminsPage = () => <Placeholder title="Administrators" description="Admin membership and permissions require a server-authoritative identity and role contract before management controls are exposed." icon={UserCog} />;
export const AdminActivityPage = () => <Placeholder title="Activity" description="Audit history requires canonical server-side events. QUORIN will not fabricate an activity feed from local UI actions." icon={ScrollText} />;
