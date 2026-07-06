import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { medusaApi } from '@/lib/medusa';
import { saveAccounts, saveCurrentAccountId, loadAccounts } from '@/lib/quorinStore';
import type { AccountRecord } from '@/data/accounts';

export default function AuthGoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Missing authentication parameters.');
      return;
    }

    (async () => {
      try {
        const { token, user } = await medusaApi.googleAuthCallback(code, state);

        const { customer } = await medusaApi.getOrCreateCustomerFromGoogleAuth(
          token,
          user
        );

        const existingAccounts = loadAccounts();
        const accountRecord: AccountRecord = {
          password: '',
          profile: {
            id: customer.id,
            role: 'customer' as const,
            displayName: user.name || customer.email,
            email: customer.email,
            phone: customer.phone ?? '',
            address: '',
            city: '',
            bio: '',
          },
          orders: [],
          giftUsage: {
            level10GiftRedeemed: false,
            birthdayGiftYears: [],
            birthdayChangeYears: [],
          },
          wishlist: [],
        };

        saveAccounts({
          ...existingAccounts,
          [customer.id]: accountRecord,
        });
        saveCurrentAccountId(customer.id);

        window.location.href = '/';
      } catch (err) {
        console.error('Google auth callback error:', err);
        setError(
          err instanceof Error ? err.message : 'Authentication failed.'
        );
      }
    })();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="text-center space-y-4">
          <p style={{ color: 'var(--color-text-primary)' }}>{error}</p>
          <button
            className="rounded-xl px-6 py-2 text-sm tracking-wider"
            style={{
              background: 'var(--color-accent)',
              color: 'white',
            }}
            onClick={() => navigate('/')}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--color-bg)' }}
    >
      <p style={{ color: 'var(--color-text-muted)' }}>
        Signing in with Google...
      </p>
    </div>
  );
}
