/**
 * Feature IDs for app features.
 * Using an enum keeps feature references type-safe.
 */
export enum Feature {
  Analytics = 'analytics',
  BulkExport = 'bulk-export',
  WhiteLabel = 'white-label',
  Notifications = 'notifications',
  ApiAccess = 'api-access',
}

/**
 * Feature metadata for toolbar display.
 * Your licensing API typically only returns IDs and enabled status,
 * so we define names and descriptions locally.
 */
export const FEATURE_METADATA: Record<string, { name: string; description: string }> = {
  [Feature.Analytics]: {
    name: 'Analytics Dashboard',
    description: 'Advanced reporting and data visualization tools',
  },
  [Feature.BulkExport]: {
    name: 'Bulk Export',
    description: 'Export large datasets to CSV, Excel, or PDF',
  },
  [Feature.WhiteLabel]: {
    name: 'White Label Branding',
    description: 'Customize app branding with your logo and colors',
  },
  [Feature.Notifications]: {
    name: 'Notifications',
    description: 'Real-time push notifications and alerts',
  },
  [Feature.ApiAccess]: {
    name: 'API Access',
    description: 'Full REST API access for custom integrations',
  },
};
