// Tree-shakeable tokens for dependency injection
export {
  TOOLBAR_FEATURE_FLAGS,
  TOOLBAR_PERMISSIONS,
  TOOLBAR_LANGUAGE,
  TOOLBAR_APP_FEATURES,
} from './tokens';

// Provider function for tree-shakeable setup
export { provideToolbar } from './provide-toolbar';

// Dynamic initialization (no template changes needed)
export {
  initToolbar,
  type InitToolbarOptions,
  type InitToolbarResult,
} from './init-toolbar';

// Components
export * from './components/icons/icon.component';
export * from './components/icons/icon.models';
export * from './components/list/list.component';
export * from './components/list-item/list-item.component';
export * from './components/toolbar-tool/toolbar-tool.component';
export * from './components/toolbar-tool/toolbar-tool.models';

// UI Components (for building custom tools)
export * from './components/button/button.component';
export * from './components/input/input.component';
export * from './components/select/select.component';
export * from './components/card/card.component';
export * from './components/clickable-card/clickable-card.component';
export * from './components/link-button/link-button.component';
export * from './components/step-view/step-view.component';
export * from './components/step-view/step-view.directive';

export * from './toolbar.component';
export * from './models/toolbar.interface';
export * from './models/toolbar-config.interface';
export * from './models/tool-view-state.models';
export * from './tools/feature-flags-tool/feature-flags.models';
export * from './tools/feature-flags-tool/feature-flags.service';
export * from './tools/language-tool/language.models';
export * from './tools/language-tool/language.service';
export * from './tools/app-features-tool/app-features.models';
export * from './tools/app-features-tool/app-features.service';
export * from './tools/app-features-tool/app-features-tool.component';

// Permissions Tool
export * from './tools/permissions-tool/permissions.models';
export * from './tools/permissions-tool/permissions.service';
export * from './tools/permissions-tool/permissions-tool.component';

// Presets Tool
export * from './tools/presets-tool/presets.models';
export * from './tools/presets-tool/presets.service';
export * from './tools/presets-tool/presets-tool.component';

// =============================================================================
// BACKWARDS COMPATIBILITY EXPORTS (DEPRECATED)
// These aliases are provided for migration convenience. Remove in next major version.
// =============================================================================

// Deprecated token names
import {
  TOOLBAR_FEATURE_FLAGS,
  TOOLBAR_PERMISSIONS,
  TOOLBAR_LANGUAGE,
  TOOLBAR_APP_FEATURES,
} from './tokens';

/** @deprecated Use TOOLBAR_FEATURE_FLAGS instead. Will be removed in v4.0 */
export const DEV_TOOLBAR_FEATURE_FLAGS = TOOLBAR_FEATURE_FLAGS;
/** @deprecated Use TOOLBAR_PERMISSIONS instead. Will be removed in v4.0 */
export const DEV_TOOLBAR_PERMISSIONS = TOOLBAR_PERMISSIONS;
/** @deprecated Use TOOLBAR_LANGUAGE instead. Will be removed in v4.0 */
export const DEV_TOOLBAR_LANGUAGE = TOOLBAR_LANGUAGE;
/** @deprecated Use TOOLBAR_APP_FEATURES instead. Will be removed in v4.0 */
export const DEV_TOOLBAR_APP_FEATURES = TOOLBAR_APP_FEATURES;

// Deprecated function names
import { provideToolbar } from './provide-toolbar';
import { initToolbar, InitToolbarOptions, InitToolbarResult } from './init-toolbar';

/** @deprecated Use provideToolbar instead. Will be removed in v4.0 */
export const provideDevToolbar = provideToolbar;
/** @deprecated Use initToolbar instead. Will be removed in v4.0 */
export const initDevToolbar = initToolbar;
/** @deprecated Use InitToolbarOptions instead. Will be removed in v4.0 */
export type InitDevToolbarOptions = InitToolbarOptions;
/** @deprecated Use InitToolbarResult instead. Will be removed in v4.0 */
export type InitDevToolbarResult = InitToolbarResult;

// Deprecated component names
import { ToolbarComponent } from './toolbar.component';
import { ToolbarToolComponent } from './components/toolbar-tool/toolbar-tool.component';

/** @deprecated Use ToolbarComponent instead. Will be removed in v4.0 */
export const DevToolbarComponent = ToolbarComponent;
/** @deprecated Use ToolbarToolComponent instead. Will be removed in v4.0 */
export const DevToolbarToolComponent = ToolbarToolComponent;

// Deprecated service names
import { ToolbarFeatureFlagService } from './tools/feature-flags-tool/feature-flags.service';
import { ToolbarLanguageService } from './tools/language-tool/language.service';
import { ToolbarAppFeaturesService } from './tools/app-features-tool/app-features.service';
import { ToolbarPermissionsService } from './tools/permissions-tool/permissions.service';
import { ToolbarPresetsService } from './tools/presets-tool/presets.service';

/** @deprecated Use ToolbarFeatureFlagService instead. Will be removed in v4.0 */
export const DevToolbarFeatureFlagService = ToolbarFeatureFlagService;
/** @deprecated Use ToolbarLanguageService instead. Will be removed in v4.0 */
export const DevToolbarLanguageService = ToolbarLanguageService;
/** @deprecated Use ToolbarAppFeaturesService instead. Will be removed in v4.0 */
export const DevToolbarAppFeaturesService = ToolbarAppFeaturesService;
/** @deprecated Use ToolbarPermissionsService instead. Will be removed in v4.0 */
export const DevToolbarPermissionsService = ToolbarPermissionsService;
/** @deprecated Use ToolbarPresetsService instead. Will be removed in v4.0 */
export const DevToolbarPresetsService = ToolbarPresetsService;

// Deprecated interface/type names
import { ToolbarConfig } from './models/toolbar-config.interface';
import { ToolbarService } from './models/toolbar.interface';
import { ToolbarFlag } from './tools/feature-flags-tool/feature-flags.models';
import { ToolbarPermission } from './tools/permissions-tool/permissions.models';
import { ToolbarAppFeature } from './tools/app-features-tool/app-features.models';
import { ToolbarWindowOptions } from './components/toolbar-tool/toolbar-tool.models';
import { ToolbarPreset, ToolbarPresetConfig } from './tools/presets-tool/presets.models';

/** @deprecated Use ToolbarConfig instead. Will be removed in v4.0 */
export type DevToolbarConfig = ToolbarConfig;
/** @deprecated Use ToolbarService instead. Will be removed in v4.0 */
export type DevToolsService<T> = ToolbarService<T>;
/** @deprecated Use ToolbarFlag instead. Will be removed in v4.0 */
export type DevToolbarFlag = ToolbarFlag;
/** @deprecated Use ToolbarPermission instead. Will be removed in v4.0 */
export type DevToolbarPermission = ToolbarPermission;
/** @deprecated Use ToolbarAppFeature instead. Will be removed in v4.0 */
export type DevToolbarAppFeature = ToolbarAppFeature;
/** @deprecated Use ToolbarWindowOptions instead. Will be removed in v4.0 */
export type DevToolbarWindowOptions = ToolbarWindowOptions;
/** @deprecated Use ToolbarPreset instead. Will be removed in v4.0 */
export type DevToolbarPreset = ToolbarPreset;
/** @deprecated Use ToolbarPresetConfig instead. Will be removed in v4.0 */
export type DevToolbarPresetConfig = ToolbarPresetConfig;
