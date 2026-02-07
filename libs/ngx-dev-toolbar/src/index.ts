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
