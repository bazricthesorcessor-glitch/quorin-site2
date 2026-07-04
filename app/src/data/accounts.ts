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
  wishlist: string[];
}

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
