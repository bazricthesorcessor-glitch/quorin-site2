import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FolderTree, Layers,
  Boxes, Ticket, BarChart3, Settings, Image as ImageIcon, UserCog,
  ScrollText, LogOut, Menu, X, Store, ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: FolderTree },
      { to: '/admin/collections', label: 'Collections', icon: Layers },
      { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
      { to: '/admin/media', label: 'Media Library', icon: ImageIcon },
    ],
  },
  {
    title: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/customers', label: 'Customers', icon: Users },
      { to: '/admin/coupons', label: 'Coupons & Promotions', icon: Ticket },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: Settings },
      { to: '/admin/admins', label: 'Admins & Roles', icon: UserCog },
      { to: '/admin/activity', label: 'Activity Logs', icon: ScrollText },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
          <Store size={18} color="white" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wider" style={{ color: 'var(--color-text-primary)' }}>QUORIN</div>
          <div className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>ADMIN CONSOLE</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" data-lenis-prevent>
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[10px] tracking-[0.2em] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {section.title.toUpperCase()}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      isActive ? 'font-semibold' : ''
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--color-accent)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                  })}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + actions */}
      <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ExternalLink size={18} />
          View Storefront
        </a>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--color-surface)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-accent)', color: 'white' }}>
            {(user?.first_name?.[0] ?? user?.email?.[0] ?? 'A').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.email ?? 'Admin'}
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} aria-label="Sign out" className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-background)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30"
        style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
      >
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(20,15,10,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
              style={{ background: 'var(--color-surface)' }}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 py-3"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <button className="lg:hidden p-2 rounded-lg" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <div className="hidden lg:block text-xs tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
            QUORIN MANAGEMENT CONSOLE
          </div>
          <div className="lg:hidden" />
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile close button when open */}
      {mobileOpen && (
        <button
          className="fixed top-3 right-3 z-[60] lg:hidden p-2 rounded-lg"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
