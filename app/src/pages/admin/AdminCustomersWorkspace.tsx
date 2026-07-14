import { useMemo, useState } from 'react';
import { RefreshCw, Search, UserRound } from 'lucide-react';
import { adminApi, type AdminCustomer } from '@/lib/adminApi';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { Badge, Card, ErrorState, GhostButton, Loading, Modal, PageHeader, StatCard } from '@/components/admin/AdminUI';
import { useAdminResource } from '@/hooks/useAdminResource';

const nameOf = (customer: AdminCustomer) => [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Unnamed customer';

export default function AdminCustomersWorkspace() {
  const resource = useAdminResource(() => adminApi.listCustomers({ limit: 100 }), []);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const customers = resource.data?.customers ?? [];
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); if (!needle) return customers; return customers.filter((customer) => `${nameOf(customer)} ${customer.email} ${customer.phone ?? ''}`.toLowerCase().includes(needle)); }, [customers, query]);
  const columns: AdminColumn<AdminCustomer>[] = [
    { key: 'name', label: 'Customer', render: (customer) => <div><div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{nameOf(customer)}</div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{customer.id.slice(0, 12)}…</div></div> },
    { key: 'email', label: 'Email', render: (customer) => <span style={{ color: 'var(--color-text-secondary)' }}>{customer.email}</span> },
    { key: 'phone', label: 'Phone', render: (customer) => <span style={{ color: 'var(--color-text-muted)' }}>{customer.phone ?? '—'}</span> },
    { key: 'joined', label: 'Joined', render: (customer) => <span className="whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>{new Date(customer.created_at).toLocaleDateString()}</span> },
  ];

  if (resource.loading) return <Loading label="Loading customers…" />;
  if (resource.error && !resource.data) return <ErrorState message={resource.error} retry={resource.reload} />;

  return <div><PageHeader title="Customers" subtitle="Search and inspect customer records from the commerce backend." action={<GhostButton onClick={() => void resource.reload()}><RefreshCw size={15} className={resource.refreshing ? 'animate-spin' : ''} /> Refresh</GhostButton>} />{resource.error && <div className="mb-4"><ErrorState message={resource.error} retry={resource.reload} /></div>}<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><StatCard label="Customers" value={resource.data?.count ?? customers.length} icon={UserRound} /><StatCard label="Visible results" value={filtered.length} icon={Search} /></div><Card className="mb-4"><label className="relative block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} /><input className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="Search name, email or phone…" value={query} onChange={(event) => setQuery(event.target.value)} /></label></Card><AdminTable rows={filtered} columns={columns} rowKey={(customer) => customer.id} onRowClick={setSelected} emptyTitle={query ? 'No matching customers' : 'No customers yet'} emptyDescription={query ? 'Try a broader search.' : 'Customer records will appear after registration or checkout.'} /><Modal open={Boolean(selected)} title={selected ? nameOf(selected) : 'Customer'} description={selected?.email} onClose={() => setSelected(null)} maxWidth="max-w-xl">{selected && <div className="space-y-5"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Email</div><div className="mt-1 break-all" style={{ color: 'var(--color-text-primary)' }}>{selected.email}</div></div><div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Phone</div><div className="mt-1" style={{ color: 'var(--color-text-primary)' }}>{selected.phone ?? 'Not provided'}</div></div><div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Joined</div><div className="mt-1" style={{ color: 'var(--color-text-primary)' }}>{new Date(selected.created_at).toLocaleString()}</div></div><div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Account state</div><div className="mt-1"><Badge tone="success">Customer record</Badge></div></div></div><div className="rounded-xl p-4 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-subtle)' }}>Order history and lifetime spend are intentionally not fabricated here. They should appear only after a customer-detail API contract provides canonical order aggregates.</div></div>}</Modal></div>;
}
