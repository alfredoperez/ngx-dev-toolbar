/**
 * Persisted view state for a tool's UI (search, filter, sort).
 * Stored in localStorage via ToolbarStorageService.
 */
export interface ToolViewState {
  /** Current search query text */
  searchQuery: string;

  /** Currently selected filter value (e.g., 'all', 'forced', 'enabled', 'disabled') */
  filter: string;

  /** Sort order for list items (currently only 'asc' supported, reserved for future use) */
  sortOrder: 'asc' | 'desc';
}
