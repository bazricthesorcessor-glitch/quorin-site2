export interface ProductVariantInput {
  title: string;
  sku: string;
  price: string;
  inventory: string;
}

export interface ProductDraftValidationInput {
  title: string;
  handle: string;
  weight: string;
  variants: ProductVariantInput[];
}

export interface ProductDraftValidationResult {
  valid: boolean;
  errors: string[];
}

const isFiniteNonNegative = (value: string) => {
  if (!value.trim()) return true;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
};

/** Shared, side-effect-free validation for product editor data before API mutation. */
export function validateProductDraft(draft: ProductDraftValidationInput): ProductDraftValidationResult {
  const errors: string[] = [];

  if (!draft.title.trim()) errors.push('Product title is required.');
  if (draft.handle.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.handle.trim())) {
    errors.push('Handle may only contain lowercase letters, numbers, and single hyphens.');
  }
  if (!isFiniteNonNegative(draft.weight)) errors.push('Weight must be a non-negative number.');
  if (draft.variants.length === 0) errors.push('At least one product variant is required.');

  const normalizedSkus = draft.variants.map((variant) => variant.sku.trim().toLowerCase()).filter(Boolean);
  if (new Set(normalizedSkus).size !== normalizedSkus.length) errors.push('Variant SKUs must be unique.');

  draft.variants.forEach((variant, index) => {
    const label = variant.title.trim() || `Variant ${index + 1}`;
    if (!isFiniteNonNegative(variant.price)) errors.push(`${label}: price must be a non-negative number.`);
    if (!isFiniteNonNegative(variant.inventory)) errors.push(`${label}: inventory must be a non-negative number.`);
    if (variant.inventory.trim() && !Number.isInteger(Number(variant.inventory))) errors.push(`${label}: inventory must be a whole number.`);
  });

  return { valid: errors.length === 0, errors };
}
