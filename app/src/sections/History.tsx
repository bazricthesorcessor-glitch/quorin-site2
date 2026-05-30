import { useState } from 'react';
import ProductPreview from '@/components/ProductPreview';
import type { Product } from '@/data/products';
import { quorinData } from '@/data/products';

type OrderItem = {
  id: string;
  product: Product;
  orderDate: string; // ISO
  status: 'delivered' | 'return_requested' | 'returned';
  comment?: string;
};

export default function HistorySection() {
  const sample: OrderItem[] = quorinData.categories.flatMap((c) => c.products.slice(0, 2)).map((p, i) => ({
    id: `ord-${i}`,
    product: p,
    orderDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
    status: 'delivered',
  }));

  const [orders, setOrders] = useState<OrderItem[]>(sample);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [commenting, setCommenting] = useState<{ id: string; text: string } | null>(null);
  const [confirmReturn, setConfirmReturn] = useState<{ id: string } | null>(null);

  const canReturn = (orderDate: string) => {
    const d = new Date(orderDate);
    const diff = Date.now() - d.getTime();
    return diff <= 3 * 24 * 60 * 60 * 1000; // 3 days
  };

  const requestReturn = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'return_requested' } : o));
    setConfirmReturn(null);
  };

  const submitComment = (id: string, text: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, comment: text } : o));
    setCommenting(null);
  };

  return (
    <section className="py-24 px-4 md:px-8" style={{ background: 'var(--color-dominant)' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Your Orders</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((o) => (
            <div key={o.id} className="p-4 rounded-xl" style={{ background: 'var(--color-secondary)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-black rounded overflow-hidden">
                  <img src={o.product.images?.[0] || '/product-resin-kit.jpg'} alt={o.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 style={{ color: 'var(--color-text-primary)' }}>{o.product.name}</h3>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{new Date(o.orderDate).toLocaleString()}</span>
                  </div>

                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{o.comment || 'No comment'}</p>

                  <div className="mt-4 flex gap-3">
                    <button className="px-3 py-2 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }} onClick={() => { setPreviewProduct(o.product); setPreviewOpen(true); }}>Preview Again</button>

                    <button className="px-3 py-2 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }} onClick={() => setCommenting({ id: o.id, text: o.comment || '' })}>Leave Comment</button>

                    <button className="px-3 py-2 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.06)', color: o.status === 'return_requested' ? 'var(--color-accent)' : 'var(--color-text-primary)' }} disabled={!canReturn(o.orderDate) || o.status === 'return_requested'} onClick={() => setConfirmReturn({ id: o.id })}>{o.status === 'return_requested' ? 'Return Requested' : 'Return'}</button>

                    <button className="px-3 py-2 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }} onClick={() => alert('Personalized order flow placeholder')}>Personalized Order</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* modals */}
      <ProductPreview product={previewProduct} isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />

      {commenting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(8,8,13,0.8)' }} onClick={() => setCommenting(null)}>
          <div className="bg-[var(--color-secondary)] p-6 rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-2">Leave a comment</h3>
            <textarea className="w-96 h-48 p-3 rounded-md bg-[rgba(255,255,255,0.02)]" value={commenting.text} onChange={(e) => setCommenting({ ...commenting!, text: e.target.value })} />
            <div className="mt-3 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-full border" onClick={() => setCommenting(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-full" style={{ background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }} onClick={() => submitComment(commenting.id, commenting.text)}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {confirmReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(8,8,13,0.8)' }} onClick={() => setConfirmReturn(null)}>
          <div className="bg-[var(--color-secondary)] p-6 rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-2">Confirm Return</h3>
            <p className="text-sm mb-4">Are you sure you want to request a return for this item? Returns allowed within 3 days of order.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-full border" onClick={() => setConfirmReturn(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-full" style={{ background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }} onClick={() => requestReturn(confirmReturn.id)}>Request Return</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
