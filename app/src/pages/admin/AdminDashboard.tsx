import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, ShoppingCart, Users, Boxes, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { adminApi, type AdminProduct, type AdminOrder, type AdminCustomer, type AdminInventoryItem } from '@/lib/adminApi';
import { PageHeader, StatCard, Card, Loading, ErrorState, EmptyState, Badge } from '@/components/admin/AdminUI';

interface Stats {
  products: { count: number; products: AdminProduct[] };
  orders: { count: number; orders: AdminOrder[] };
  customers: { count: number; customers: AdminCustomer[] };
  inventory: { inventory_items: AdminInventoryItem[] };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [products, orders, customers, inventory] = await Promise.all([
          adminApi.listProducts({ limit: 5 }),
          adminApi.listOrders({ limit: 5 }),
          adminApi.listCustomers({ limit: 5 }),
          adminApi.listInventory(),
        ]);
        if (cancelled) return;
        setStats({ products, orders, customers, inventory });
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loading label="Loading dashboard…" />;
  if (error) return (
    <div className="space-y-4">
      <ErrorState message={error} />
      <div className="text-center">
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            (async () => {
              try {
                const [products, orders, customers, inventory] = await Promise.all([
                  adminApi.listProducts({ limit: 5 }),
                  adminApi.listOrders({ limit: 5 }),
                  adminApi.listCustomers({ limit: 5 }),
                  adminApi.listInventory(),
                ]);
                setStats({ products, orders, customers, inventory });
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setLoading(false);
              }
            })();
          }}
          className="px-6 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'var(--color-accent)', color: 'white' }}
        >
          Retry Connection
        </button>
      </div>
      {adminApi.localMode && (
        <div className="rounded-xl px-4 py-3 text-sm text-center" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)', border: '1px solid var(--color-border-subtle)' }}>
          ⚠ Backend is offline. Running in local mode — some features may be limited.
        </div>
      )}
    </div>
  );
  if (!stats) return null;

  const invItems = stats.inventory?.inventory_items ?? [];
  const orderItems = stats.orders?.orders ?? [];
  const lowStock = invItems.filter((i) => i.stocked_quantity <= 5);
  const revenue = orderItems.reduce((sum, o) => sum + (o.summary?.total ?? 0), 0);

  const quickLinks = [
    { to: '/admin/products', label: 'Manage Products', icon: Package },
    { to: '/admin/orders', label: 'View Orders', icon: ShoppingCart },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/settings', label: 'Store Settings', icon: Boxes },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your QUORIN store" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Products" value={stats.products?.count ?? 0} icon={Package} accent />
        <StatCard label="Orders" value={stats.orders?.count ?? 0} icon={ShoppingCart} />
        <StatCard label="Customers" value={stats.customers?.count ?? 0} icon={Users} />
        <StatCard label="Revenue" value={`₹${revenue.toFixed(0)}`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm tracking-[0.15em] font-semibold" style={{ color: 'var(--color-text-muted)' }}>RECENT ORDERS</h2>
            <Link to="/admin/orders" className="text-xs flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {orderItems.length === 0 ? (
            <EmptyState title="No orders yet" description="Orders will appear here once customers start checking out." />
          ) : (
            <div className="space-y-2">
              {orderItems.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--color-ivory)' }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{o.email ?? 'Guest'}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>₹{(o.summary?.total ?? 0).toFixed(0)}</span>
                    <Badge tone="neutral">{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Low stock */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm tracking-[0.15em] font-semibold" style={{ color: 'var(--color-text-muted)' }}>LOW STOCK</h2>
            <AlertTriangle size={16} style={{ color: lowStock.length > 0 ? '#facc15' : 'var(--color-text-muted)' }} />
          </div>
          {lowStock.length === 0 ? (
            <EmptyState title="All stocked up" description="No items below the low-stock threshold." />
          ) : (
            <div className="space-y-2">
              {lowStock.slice(0, 6).map((i) => (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--color-ivory)' }}>
                  <div className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{i.sku ?? i.title ?? i.id}</div>
                  <Badge tone={i.stocked_quantity === 0 ? 'danger' : 'warning'}>{i.stocked_quantity} left</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {quickLinks.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="rounded-2xl p-5 flex items-center gap-3 transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
              <q.icon size={18} color="white" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
