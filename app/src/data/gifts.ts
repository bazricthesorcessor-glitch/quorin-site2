import type { AccountRecord } from '@/data/accounts';
import type { Product } from '@/data/products';

export type GiftSource = 'level10' | 'birthday';

export interface CheckoutGiftOffer {
  source: GiftSource;
  label: string;
}

export type CheckoutLockMap = Record<string, boolean>;

const formatBirthdayKey = (birthday: string) => {
  const parsed = new Date(birthday);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

const todayBirthdayKey = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const canRedeemLevel10Gift = (account: AccountRecord | null, level: number) =>
  !!account && level >= 10 && !account.giftUsage.level10GiftRedeemed;

export const canRedeemBirthdayGift = (account: AccountRecord | null, now = new Date()) => {
  if (!account?.profile.birthday) return false;
  if (account.giftUsage.birthdayGiftYears.includes(now.getFullYear())) return false;
  return formatBirthdayKey(account.profile.birthday) === todayBirthdayKey(now);
};

export const getProductCostPrice = (product: Product) => product.costPrice ?? Math.max(1, Math.round(product.price * 0.7));

export const getGiftDiscountForProduct = (product: Product) => Math.max(0, product.price - getProductCostPrice(product));

export const getGiftLockKey = (source: GiftSource, fingerprint: string, now = new Date()) => {
  if (source === 'birthday') {
    return `birthday:${fingerprint}:${now.getFullYear()}`;
  }

  return `level10:${fingerprint}`;
};

export const getCheckoutGiftOffer = (
  account: AccountRecord | null,
  level: number,
  fingerprint: string,
  locks: CheckoutLockMap,
  now = new Date()
): CheckoutGiftOffer | null => {
  if (!account) return null;

  const level10Eligible = canRedeemLevel10Gift(account, level);
  const birthdayEligible = canRedeemBirthdayGift(account, now);

  if (!level10Eligible && !birthdayEligible) return null;

  const source: GiftSource = level10Eligible ? 'level10' : 'birthday';
  const lockKey = getGiftLockKey(source, fingerprint, now);
  if (locks[lockKey]) return null;

  return {
    source,
    label: source === 'level10' ? 'Level 10 Gift' : 'Birthday Gift',
  };
};

export const redeemCheckoutGift = (account: AccountRecord, offer: CheckoutGiftOffer, now = new Date()) => {
  if (offer.source === 'level10') {
    return {
      ...account,
      giftUsage: {
        ...account.giftUsage,
        level10GiftRedeemed: true,
      },
    };
  }

  const year = now.getFullYear();
  return {
    ...account,
    giftUsage: {
      ...account.giftUsage,
      birthdayGiftYears: account.giftUsage.birthdayGiftYears.includes(year)
        ? account.giftUsage.birthdayGiftYears
        : [...account.giftUsage.birthdayGiftYears, year],
    },
  };
};
