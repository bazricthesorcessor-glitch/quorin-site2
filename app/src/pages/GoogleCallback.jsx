import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { medusaApi } from '@/lib/medusa';
import {
  saveAccounts,
  saveCurrentAccountId,
  loadAccounts,
} from '@/lib/quorinStore';

const MEDUSA_BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY =
  import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '';

/**
 * GoogleCallback Component
 *
 * Extracts the 'code' query parameter from the URL using useLocation,
 * sends a POST request with credentials: 'include' to the backend OAuth endpoint,
 * and navigates to '/' on success or '/login' on failure.
 */
export default function GoogleCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (!code) {
          throw new Error("Missing 'code' query parameter in Google callback URL.");
        }

        if (!hasFetched.current) {
          hasFetched.current = true;

          if (medusaApi && typeof medusaApi.googleAuthCallback === 'function') {
            const authResult = await medusaApi.googleAuthCallback(location.search);
            if (authResult?.customer) {
              const existingAccounts = loadAccounts();
              const existing = existingAccounts[authResult.customer.id];
              const accountRecord = {
                password: existing?.password ?? '',
                profile: {
                  id: authResult.customer.id,
                  role: 'customer',
                  displayName:
                    authResult.user?.name ||
                    [authResult.customer.first_name, authResult.customer.last_name]
                      .filter(Boolean)
                      .join(' ') ||
                    authResult.customer.email,
                  email: authResult.customer.email,
                  phone: authResult.customer.phone ?? existing?.profile?.phone ?? '',
                  address: existing?.profile?.address ?? '',
                  city: existing?.profile?.city ?? '',
                  bio: existing?.profile?.bio ?? '',
                },
                orders: existing?.orders ?? [],
                giftUsage: existing?.giftUsage ?? {
                  level10GiftRedeemed: false,
                  birthdayGiftYears: [],
                  birthdayChangeYears: [],
                },
                wishlist: existing?.wishlist ?? [],
              };

              saveAccounts({
                ...existingAccounts,
                [authResult.customer.id]: accountRecord,
              });
              saveCurrentAccountId(authResult.customer.id);
            }
          } else {
            throw new Error('medusaApi is not defined or missing googleAuthCallback');
          }

          // Force a full page reload so App.tsx re-initializes its currentAccountId state
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        setErrorMessage(error.message || 'Authentication failed');
        // Navigate to /login on error
        navigate('/login');
      }
    };

    handleGoogleAuth();
  }, [location.search, navigate]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: 'var(--color-background, #F8F5EF)',
        color: 'var(--color-text-primary, #1A1410)',
      }}
    >
      <div className="flex flex-col items-center max-w-sm w-full p-8 text-center rounded-2xl border shadow-sm backdrop-blur-sm bg-white/70 border-amber-900/10">
        {/* Animated Loading Spinner */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-amber-200 border-t-amber-700 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-amber-800"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-serif font-medium tracking-tight mb-2">
          Authenticating with Google
        </h2>

        <p className="text-sm text-stone-600 mb-3">
          {errorMessage ? errorMessage : 'Completing sign in with backend and redirecting...'}
        </p>
      </div>
    </div>
  );
}

export { GoogleCallback };
