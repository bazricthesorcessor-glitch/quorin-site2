import { useMemo, useState } from 'react';
import { FolderTree, Layers3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { adminApi, type AdminCategory, type AdminCollection } from '@/lib/adminApi';
import { Card, ConfirmDialog, ErrorState, GhostButton, Loading, Modal, PageHeader, PrimaryButton, StatCard } from '@/components/admin/AdminUI';
import { useAdminResource } from '@/hooks/useAdminResource';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

type Mode = 'categories' | 'collections';
type Group = AdminCategory | AdminCollection;

export default function AdminCatalogGroupsPage({ mode }: { mode: Mode }) {
  const isCategory = mode === 'categories';
  const resource = useAdminResource(() => isCategory ? adminApi.listCategories() : adminApi.listCollections(), [isCategory]);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const groups: Group[] = isCategory ? (resource.data as Awaited<ReturnType<typeof adminApi.listCategories>> | null)?.product_categories ?? [] : (resource.data as Awaited<ReturnType<typeof adminApi.listCollections>> | null)?.collections ?? [];
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return groups.filter((group) => !needle || `${isCategory ? (group as AdminCategory).name : (group as AdminCollection).title} ${group.handle} ${group.description ?? ''}`.toLowerCase().includes(needle)); }, [groups, query, isCategory]);
  const titleOf = (group: Group) => isCategory ? (group as AdminCategory).name : (group as AdminCollection).title;
  const resetForm = () => { setName(''); setHandle(''); setDescription(''); setMutationError(null); };
  const create = async () => {
    if (!name.trim()) return;
    setSaving(true); setMutationError(null);
    try {
      if (isCategory) await adminApi.createCategory({ name: name.trim(), handle: handle.trim() || slugify(name), description: description.trim() || undefined, is_active: true });
      else await adminApi.createCollection({ title: name.trim(), handle: handle.trim() || slugify(name), description: description.trim() || undefined });
      setFormOpen(false); resetForm(); await resource.reload();
    } catch (cause) { setMutationError(cause instanceof Error ? cause.message : `Could not create ${isCategory ? 'category' : 'collection'}.`); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true); setMutationError(null);
    try { if (isCategory) await adminApi.deleteCategory(deleteTarget.id); else await adminApi.deleteCollection(deleteTarget.id); setDeleteTarget(null); await resource.reload(); }
    catch (cause) { setMutationError(cause instanceof Error ? cause.message : `Could not delete ${isCategory ? 'category' : 'collection'}.`); }
    finally { setSaving(false); }
  };

  if (resource.loading) return <Loading label={`Loading ${mode}…`} />;
  if (resource.error && !resource.data) return <ErrorState message={resource.error} retry={resource.reload} />;

  const singular = isCategory ? 'category' : 'collection';
  return <div><PageHeader title={isCategory ? 'Categories' : 'Collections'} subtitle={`Organize the catalog with ${mode}.`} action={<div className="flex gap-2"><GhostButton onClick={() => void resource.reload()}><RefreshCw size={15} className={resource.refreshing ? 'animate-spin' : ''} /> Refresh</GhostButton><PrimaryButton onClick={() => { resetForm(); setFormOpen(true); }}><Plus size={15} /> New {singular}</PrimaryButton></div>} />{(resource.error || mutationError) && <div className="mb-4"><ErrorState message={mutationError ?? resource.error ?? ''} retry={resource.error ? resource.reload : undefined} /></div>}<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><StatCard label={`Total ${mode}`} value={groups.length} icon={isCategory ? FolderTree : Layers3} /><StatCard label="Visible results" value={filtered.length} icon={Search} /></div><Card className="mb-4"><label className="relative block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} /><input className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder={`Search ${mode}…`} value={query} onChange={(event) => setQuery(event.target.value)} /></label></Card><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map((group) => <Card key={group.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{titleOf(group)}</div><div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>/{group.handle}</div></div><button type="button" aria-label={`Delete ${titleOf(group)}`} className="p-2 rounded-lg shrink-0" style={{ color: 'var(--color-destructive)' }} onClick={() => setDeleteTarget(group)}><Trash2 size={15} /></button></div><p className="text-sm mt-3 line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>{group.description || 'No description.'}</p></Card>)}</div>{filtered.length === 0 && <Card><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No matching {mode}. Try a broader search or create a new {singular}.</p></Card>}<Modal open={formOpen} title={`New ${singular}`} description={`Create a storefront ${singular} backed by the commerce API.`} onClose={() => setFormOpen(false)} footer={<><GhostButton onClick={() => setFormOpen(false)}>Cancel</GhostButton><PrimaryButton disabled={saving || !name.trim()} onClick={() => void create()}>{saving ? 'Saving…' : `Create ${singular}`}</PrimaryButton></>}><div className="space-y-3"><label className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Name<input autoFocus className="w-full rounded-lg px-3 py-2.5 mt-1" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Handle<input className="w-full rounded-lg px-3 py-2.5 mt-1" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder={slugify(name)} value={handle} onChange={(event) => setHandle(event.target.value)} /></label><label className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Description<textarea rows={4} className="w-full rounded-lg px-3 py-2.5 mt-1" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} value={description} onChange={(event) => setDescription(event.target.value)} /></label></div></Modal><ConfirmDialog open={Boolean(deleteTarget)} title={`Delete ${singular}?`} description={deleteTarget ? `Delete “${titleOf(deleteTarget)}”? This removes the ${singular} grouping, not the underlying product records.` : ''} confirmLabel={`Delete ${singular}`} destructive busy={saving} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} /></div>;
}
