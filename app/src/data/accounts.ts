import { quorinData, type Product } from '@/data/products';

export type AccountRole = 'customer' | 'admin';

export interface AccountProfile {
  id: string;
  role: AccountRole;
  displayName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  bio: string;
  birthday?: string;
}

export interface AccountOrder {
  id: string;
  product: Product;
  orderDate: string;
  status: 'delivered' | 'return_requested' | 'returned';
  comment?: string;
}

export interface AccountRecord {
  password: string;
  profile: AccountProfile;
  orders: AccountOrder[];
  giftUsage: {
    level10GiftRedeemed: boolean;
    birthdayGiftYears: number[];
    birthdayChangeYears: number[];
  };
}

const mergeUniqueYears = (...groups: Array<number[] | undefined>) =>
  Array.from(new Set(groups.flatMap((group) => group ?? []))).sort((a, b) => a - b);

const mergeOrders = (demoOrders: AccountOrder[], storedOrders?: AccountOrder[]) => {
  const merged = new Map<string, AccountOrder>();

  demoOrders.forEach((order) => {
    merged.set(order.id, order);
  });

  storedOrders?.forEach((order) => {
    const existing = merged.get(order.id);
    merged.set(order.id, existing ? { ...existing, ...order } : order);
  });

  return Array.from(merged.values());
};

const hydrateAccountRecord = (
  demoAccount: AccountRecord,
  storedAccount?: Partial<AccountRecord>
): AccountRecord => ({
  password: storedAccount?.password ?? demoAccount.password,
  profile: {
    ...demoAccount.profile,
    ...storedAccount?.profile,
    id: demoAccount.profile.id,
    role: demoAccount.profile.role,
  },
  orders: mergeOrders(demoAccount.orders, storedAccount?.orders),
  giftUsage: {
    level10GiftRedeemed: storedAccount?.giftUsage?.level10GiftRedeemed ?? demoAccount.giftUsage.level10GiftRedeemed,
    birthdayGiftYears: mergeUniqueYears(
      demoAccount.giftUsage.birthdayGiftYears,
      storedAccount?.giftUsage?.birthdayGiftYears
    ),
    birthdayChangeYears: mergeUniqueYears(
      demoAccount.giftUsage.birthdayChangeYears,
      storedAccount?.giftUsage?.birthdayChangeYears
    ),
  },
});

const lookupProduct = (name: string): Product => {
  for (const category of quorinData.categories) {
    const match = category.products.find((product) => product.name === name);
    if (match) return match;
  }
  throw new Error(`Missing seeded product: ${name}`);
};

const baseNow = new Date('2026-05-31T10:03:43.000Z');
const daysAgo = (days: number) => new Date(baseNow.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

const createOrder = (id: string, productName: string, orderDate: string): AccountOrder => ({
  id,
  product: lookupProduct(productName),
  orderDate,
  status: 'delivered',
});

export const demoAccounts: Record<string, AccountRecord> = {
  customer909: {
    password: 'Asdfg909',
    profile: {
      id: 'customer909',
      role: 'customer',
      displayName: 'Customer 909',
      email: 'customer909@quorin.demo',
      phone: '9090000909',
      address: '909 Maker Lane',
      city: 'Quorin City',
      bio: 'Loves resin, candles, and soap kits.',
      birthday: '1995-05-31',
    },
    orders: [
      createOrder('customer909-order-1', 'QUORIN Crystal Clear Epoxy Resin and Hardener Kit', daysAgo(0)),
      createOrder('customer909-order-2', 'Liquid Resin Pigment Combo Set', daysAgo(2)),
      createOrder('customer909-order-3', 'QUORIN Candle Colour Set', daysAgo(5)),
      createOrder('customer909-order-4', 'QUORIN Candle Colour Set', daysAgo(9)),
      createOrder('customer909-order-5', 'Quorin DIY Soap Colouring Kit', daysAgo(13)),
      createOrder('customer909-order-6', 'QUORIN Liquid Soap Colour Kit with Silicone Mold', daysAgo(18)),
    ],
    giftUsage: {
      level10GiftRedeemed: false,
      birthdayGiftYears: [],
      birthdayChangeYears: [],
    },
  },
  customer809: {
    password: 'Asdfg909',
    profile: {
      id: 'customer809',
      role: 'customer',
      displayName: 'Customer 809',
      email: 'customer809@quorin.demo',
      phone: '8090000809',
      address: '809 Creative Street',
      city: 'Quorin City',
      bio: 'New customer, no orders yet.',
      birthday: '1995-11-12',
    },
    orders: [],
    giftUsage: {
      level10GiftRedeemed: false,
      birthdayGiftYears: [],
      birthdayChangeYears: [],
    },
  },
  admin909: {
    password: 'Asdfg909',
    profile: {
      id: 'admin909',
      role: 'admin',
      displayName: 'Admin 909',
      email: 'admin909@quorin.demo',
      phone: '9090000999',
      address: '909 Control Tower',
      city: 'Quorin City',
      bio: 'Manages inventory, products, and customer support.',
      birthday: '1990-01-01',
    },
    orders: [],
    giftUsage: {
      level10GiftRedeemed: false,
      birthdayGiftYears: [],
      birthdayChangeYears: [],
    },
  },
};

export const hydrateAccounts = (
  storedAccounts?: Record<string, Partial<AccountRecord>>
): Record<string, AccountRecord> => {
  const hydrated: Record<string, AccountRecord> = {};

  for (const [id, demoAccount] of Object.entries(demoAccounts)) {
    hydrated[id] = hydrateAccountRecord(demoAccount, storedAccounts?.[id]);
  }

  for (const [id, storedAccount] of Object.entries(storedAccounts ?? {})) {
    if (hydrated[id] || !storedAccount.profile) continue;

    hydrated[id] = {
      password: storedAccount.password ?? '',
      profile: {
        ...storedAccount.profile,
        id: storedAccount.profile.id ?? id,
        role: storedAccount.profile.role ?? 'customer',
      },
      orders: storedAccount.orders ?? [],
      giftUsage: {
        level10GiftRedeemed: storedAccount.giftUsage?.level10GiftRedeemed ?? false,
        birthdayGiftYears: storedAccount.giftUsage?.birthdayGiftYears ?? [],
        birthdayChangeYears: storedAccount.giftUsage?.birthdayChangeYears ?? [],
      },
    };
  }

  return hydrated;
};

export const findAccountByIdentifierInAccounts = (
  accounts: Record<string, AccountRecord>,
  identifier: string
) => {
  const normalized = identifier.trim().toLowerCase();
  return Object.values(accounts).find((account) => {
    const profile = account.profile;
    return (
      profile.id.toLowerCase() === normalized ||
      profile.email.toLowerCase() === normalized ||
      profile.phone.toLowerCase() === normalized
    );
  });
};

export const findAccountByIdentifier = (identifier: string) =>
  findAccountByIdentifierInAccounts(demoAccounts, identifier);
