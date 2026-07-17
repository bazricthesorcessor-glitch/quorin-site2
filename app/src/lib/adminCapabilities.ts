export type AdminCapabilityArea = 'orders' | 'customers' | 'inventory' | 'media' | 'settings' | 'roles' | 'activity';

export interface AdminCapability {
  area: AdminCapabilityArea;
  read: boolean;
  write: boolean;
  evidence: string;
  nextContract?: string;
}

/**
 * Explicit capability registry for the admin product.
 * UI should only expose destructive/operational controls when a canonical API
 * contract exists. This prevents attractive but fake controls from creeping in.
 */
export const adminCapabilities: Record<AdminCapabilityArea, AdminCapability> = {
  orders: {
    area: 'orders',
    read: true,
    write: false,
    evidence: 'Canonical order list/detail reads are wired. Generic status mutation is intentionally not treated as a safe workflow contract.',
    nextContract: 'Version-specific cancel, fulfillment, payment and refund workflows.',
  },
  customers: {
    area: 'customers',
    read: true,
    write: false,
    evidence: 'Canonical customer list records are wired.',
    nextContract: 'Customer detail, addresses, order aggregates and server-authoritative notes/tags.',
  },
  inventory: {
    area: 'inventory',
    read: true,
    write: true,
    evidence: 'Inventory list and quantity update paths are wired.',
    nextContract: 'Location-level stock, reservation and adjustment history contracts.',
  },
  media: {
    area: 'media',
    read: false,
    write: true,
    evidence: 'Authenticated file upload exists, but a canonical browsable asset index does not.',
    nextContract: 'Asset listing, metadata, usage references and safe deletion.',
  },
  settings: {
    area: 'settings',
    read: false,
    write: false,
    evidence: 'No durable store-settings contract is currently wired.',
    nextContract: 'Server-persisted store identity, policy and commerce configuration.',
  },
  roles: {
    area: 'roles',
    read: false,
    write: false,
    evidence: 'Current authentication identifies an admin user but does not expose a role/permission management contract.',
    nextContract: 'Server-authoritative roles, permissions, invitations and revocation.',
  },
  activity: {
    area: 'activity',
    read: false,
    write: false,
    evidence: 'No canonical audit-event stream is currently wired.',
    nextContract: 'Immutable actor/action/resource audit events with timestamps and change metadata.',
  },
};

export const canAdminWrite = (area: AdminCapabilityArea) => adminCapabilities[area].write;
