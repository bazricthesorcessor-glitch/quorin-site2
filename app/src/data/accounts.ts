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

export interface OrderSnapshot {
  name: string;
  thumbnail: string;
  price: number;
}

export interface AccountOrder {
  id: string;
  productId: string;
  snapshot: OrderSnapshot;
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

const buildProductsById = (): Map<string, Product> => {
  const map = new Map<string, Product>();
  for (const category of quorinData.categories) {
    for (const product of category.products) {
      map.set(product.name, product);
    }
  }
  return map;
};

const convertLegacyOrder = (order: unknown): AccountOrder | null => {
  if (!order || typeof order !== 'object') return null;
  const o = order as Record<string, unknown>;
  if (!o.product || typeof o.product !== 'object') return null;
  const product = o.product as Record<string, unknown>;
  const name = product.name as string;
  if (!name) return null;

  const productsById = buildProductsById();
  const matched = productsById.get(name);
  if (!matched) return null;

  return {
    id: String(o.id ?? 'unknown'),
    productId: matched.id,
    snapshot: {
      name,
      thumbnail: (product.images?.[0] as string) || '',
      price: Number(product.price) || 0,
    },
    orderDate: String(o.orderDate ?? ''),
    status: (o.status === 'delivered' || o.status === 'return_requested' || o.status === 'returned')
      ? o.status
      : 'delivered',
    comment: (o.comment as string) || undefined,
  };
};

const mergeOrders = (demoOrders: AccountOrder[], storedOrders?: Record<string, unknown>[]): AccountOrder[] => {
  const merged = new Map<string, AccountOrder>();

  demoOrders.forEach((order) => {
    merged.set(order.id, order);
  });

  storedOrders?.forEach((rawOrder) => {
    const legacy = convertLegacyOrder(rawOrder);
    if (legacy) {
      const existing = merged.get(legacy.id);
      merged.set(legacy.id, existing ? { ...existing, ...legacy } : legacy);
      return;
    }
    if (rawOrder && rawOrder.id) {
      const existing = merged.get(String(rawOrder.id));
      merged.set(String(rawOrder.id), existing ? { ...existing, ...rawOrder } as AccountOrder : rawOrder as AccountOrder);
    }
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

const baseNow = new Date('2026-05-31T10:03:43.000Z');
const daysAgo = (days: number) => new Date(baseNow.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

const resinKitSnapshot: OrderSnapshot = {
  name: 'QUORIN Epoxy Resin & Hardener',
  thumbnail: 'https://images.unsplash.com/photo-1622547748229-467c81779034?w=600',
  price: 677,
};

const resinPigmentSnapshot: OrderSnapshot = {
  name: 'QUORIN Resin Pigment',
  thumbnail: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600',
  price: 112,
};

const candlePigmentSnapshot: OrderSnapshot = {
  name: 'QUORIN Candle Pigment Set',
  thumbnail: 'https://images.unsplash.com/photo-1602523961358-f9f08dd97264?w=600',
  price: 156,
};

const soapPigmentSnapshot: OrderSnapshot = {
  name: 'QUORIN Soap Pigment Set',
  thumbnail: 'https://images.unsplash.com/photo-1600435917896-349d089b4270?w=600',
  price: 315,
};

const soapKitSnapshot: OrderSnapshot = {
  name: 'QUORIN Soap Making Kit with Mould',
  thumbnail: 'https://images.unsplash.com/photo-1607003390927-95c1f5f65c44?w=600',
  price: 899,
};

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
      { id: 'customer909-order-1', productId: 'resin', snapshot: resinKitSnapshot, orderDate: daysAgo(0), status: 'delivered' },
      { id: 'customer909-order-2', productId: 'resin-pigment', snapshot: resinPigmentSnapshot, orderDate: daysAgo(2), status: 'delivered' },
      { id: 'customer909-order-3', productId: 'candle-pigment', snapshot: candlePigmentSnapshot, orderDate: daysAgo(5), status: 'delivered' },
      { id: 'customer909-order-4', productId: 'candle-pigment', snapshot: candlePigmentSnapshot, orderDate: daysAgo(9), status: 'delivered' },
      { id: 'customer909-order-5', productId: 'soap-dye', snapshot: soapPigmentSnapshot, orderDate: daysAgo(13), status: 'delivered' },
      { id: 'customer909-order-6', productId: 'soap-dye-mould', snapshot: soapKitSnapshot, orderDate: daysAgo(18), status: 'delivered' },
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
