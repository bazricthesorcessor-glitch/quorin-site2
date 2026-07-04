import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loading } from './AdminUI';

/**
 * Guards admin routes. If the user is not authenticated, redirect to the
 * admin login page. While the cached session is being validated, show a
 * loading state.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, token, loading } = useAdminAuth();

  if (loading) {
    return <Loading label="Verifying session…" />;
  }

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
