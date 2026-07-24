import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { medusaApi } from '@/lib/medusa';
import {
  saveAccounts,
  saveCurrentAccountId,
  loadAccounts,
} from '@/lib/quorinStore';
import type { AccountRecord } from '@/data/accounts';

export default function AuthGoogleCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finishGoogleLogin = async () => {
      try {
        const search = window.location.search;

        if (!search.includes('code=') || !search.includes('state=')) {
          throw new Error('Missing Google authentication parameters.');
        }

        const { customer, user } =
          await medusaApi.googleAuthCallback(search);

        if (cancelled) return;

        const existingAccounts = loadAccounts();
        const existing = existingAccounts[customer.id];

        const accountRecord: AccountRecord = {
          password: existing?.password ?? '',
          profile: {
            id: customer.id,
            role: 'customer',
            displayName:
              user.name ||
              [
                customer.first_name,
                customer.last_name,
              ]
                .filter(Boolean)
                .join(' ') ||
              customer.email,
            email: customer.email,
            phone:
              customer.phone ??
              existing?.profile.phone ??
              '',
            address:
              existing?.profile.address ??
              '',
            city:
              existing?.profile.city ??
              '',
            bio:
              existing?.profile.bio ??
              '',
          },
          orders: existing?.orders ?? [],
          giftUsage:
            existing?.giftUsage ?? {
              level10GiftRedeemed: false,
              birthdayGiftYears: [],
              birthdayChangeYears: [],
            },
          wishlist: existing?.wishlist ?? [],
        };

        saveAccounts({
          ...existingAccounts,
          [customer.id]: accountRecord,
        });

        saveCurrentAccountId(customer.id);
        window.location.replace('/');
      } catch (err) {
        console.error('Google auth callback error:', err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Google authentication failed.'
          );
        }
      }
    };

    finishGoogleLogin();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="space-y-4 text-center">
          <p style={{ color: 'var(--color-text-primary)' }}>
            {error}
          </p>

          <button
            type="button"
            className="rounded-xl px-6 py-3 text-sm tracking-wider"
            style={{
              background: 'var(--color-accent)',
              color: 'white',
            }}
            onClick={() => navigate('/')}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <p style={{ color: 'var(--color-text-muted)' }}>
        Signing in with Google...
      </p>
    </div>
  );
}
