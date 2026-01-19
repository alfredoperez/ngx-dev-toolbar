/**
 * Represents a product-level application feature that can be enabled/disabled
 * based on license tier, deployment configuration, or environment flags.
 *
 * @example
 * ```typescript
 * const feature: ToolbarAppFeature = {
 *   id: 'advanced-analytics',
 *   name: 'Advanced Analytics Dashboard',
 *   description: 'Access advanced reporting and data visualization tools',
 *   isEnabled: false,  // Not available in current tier
 *   isForced: false    // Natural state, not overridden
 * };
 * ```
 */
export interface ToolbarAppFeature {
  /**
   * Unique identifier for the feature
   * @example 'advanced-analytics', 'multi-user-support', 'white-label-branding'
   */
  id: string;

  /**
   * Display name shown in the toolbar UI
   * @example 'Advanced Analytics Dashboard', 'Multi-User Support'
   */
  name: string;

  /**
   * Optional description explaining the feature's purpose and capabilities
   * Displayed below the feature name in the UI
   * @example 'Access advanced reporting and data visualization tools'
   */
  description?: string;

  /**
   * Current enabled state of the feature
   * - true: Feature is available to the user (may be natural state or forced)
   * - false: Feature is not available (may be natural state or forced)
   */
  isEnabled: boolean;

  /**
   * Whether the feature state is forced via the dev toolbar
   * - true: State is overridden by developer, ignoring natural application state
   * - false: State reflects the natural application configuration
   */
  isForced: boolean;

  /**
   * Original value before forcing (only present when isForced is true)
   * Used to display what the feature's state was before being overridden
   */
  originalValue?: boolean;
}

/**
 * Filter options for displaying features in the toolbar UI.
 *
 * - `'all'`: Show all configured features
 * - `'forced'`: Show only features with isForced = true
 * - `'enabled'`: Show only features with isEnabled = true (regardless of forced state)
 * - `'disabled'`: Show only features with isEnabled = false (regardless of forced state)
 *
 * @example
 * ```typescript
 * // Show only forced overrides
 * const filter: AppFeatureFilter = 'forced';
 *
 * // Show all enabled features (natural or forced)
 * const filter: AppFeatureFilter = 'enabled';
 * ```
 */
export type AppFeatureFilter = 'all' | 'forced' | 'enabled' | 'disabled';

/**
 * Internal storage format for persisted forced feature overrides in localStorage.
 *
 * **Storage Rules**:
 * - Feature ID MUST NOT appear in both `enabled` and `disabled` arrays simultaneously
 * - If feature forced to enabled, ID MUST be in `enabled` array and NOT in `disabled` array
 * - If feature forced to disabled, ID MUST be in `disabled` array and NOT in `enabled` array
 * - If feature not forced, ID MUST NOT be in either array
 *
 * **localStorage Key**: `AngularDevTools.app-features`
 *
 * @example
 * ```typescript
 * // Testing Enterprise tier (force premium features enabled)
 * const enterpriseState: ForcedAppFeaturesState = {
 *   enabled: ['analytics', 'multi-user', 'white-label', 'sso-integration'],
 *   disabled: []
 * };
 *
 * // Testing Basic tier (force premium features disabled)
 * const basicState: ForcedAppFeaturesState = {
 *   enabled: [],
 *   disabled: ['analytics', 'multi-user', 'white-label', 'sso-integration']
 * };
 *
 * // Mixed scenario
 * const mixedState: ForcedAppFeaturesState = {
 *   enabled: ['analytics'],          // Test analytics feature
 *   disabled: ['white-label']        // Ensure branding is off
 * };
 * ```
 */
export interface ForcedAppFeaturesState {
  /**
   * Array of feature IDs forced to enabled state
   * Features in this array will have isEnabled = true regardless of natural state
   * @example ['advanced-analytics', 'white-label-branding']
   */
  enabled: string[];

  /**
   * Array of feature IDs forced to disabled state
   * Features in this array will have isEnabled = false regardless of natural state
   * @example ['basic-support', 'community-forums']
   */
  disabled: string[];
}
