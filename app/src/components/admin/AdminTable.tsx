import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, EmptyState, GhostButton } from './AdminUI';

export interface AdminColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function AdminTable<T>({ rows, columns, rowKey, emptyTitle = 'Nothing here yet', emptyDescription, onRowClick }: { rows: T[]; columns: AdminColumn<T>[]; rowKey: (row: T) => string; emptyTitle?: string; emptyDescription?: string; onRowClick?: (row: T) => void }) {
  if (rows.length === 0) return <Card><EmptyState title={emptyTitle} description={emptyDescription} /></Card>;
  return <Card className="p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>{columns.map((column) => <th key={column.key} className={`px-4 py-3 font-medium whitespace-nowrap ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.className ?? ''}`} style={{ color: 'var(--color-text-muted)' }}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={rowKey(row)} tabIndex={onRowClick ? 0 : undefined} className={onRowClick ? 'cursor-pointer outline-none' : undefined} style={{ borderBottom: '1px solid var(--color-border-subtle)' }} onClick={() => onRowClick?.(row)} onKeyDown={(event) => { if (onRowClick && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onRowClick(row); } }}>{columns.map((column) => <td key={column.key} className={`px-4 py-3 ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.className ?? ''}`}>{column.render(row)}</td>)}</tr>)}</tbody></table></div></Card>;
}

export function AdminPagination({ offset, limit, count, onChange }: { offset: number; limit: number; count: number; onChange: (offset: number) => void }) {
  if (count <= limit) return null;
  const start = Math.min(offset + 1, count);
  const end = Math.min(offset + limit, count);
  return <div className="flex items-center justify-between gap-3 mt-4"><span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Showing {start}–{end} of {count}</span><div className="flex gap-2"><GhostButton onClick={() => onChange(Math.max(0, offset - limit))} className={offset <= 0 ? 'pointer-events-none opacity-50' : ''}><ChevronLeft size={15} /> Previous</GhostButton><GhostButton onClick={() => onChange(offset + limit)} className={offset + limit >= count ? 'pointer-events-none opacity-50' : ''}>Next <ChevronRight size={15} /></GhostButton></div></div>;
}
