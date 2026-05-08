export type ToolbarPosition =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'sidebar-right'
  | 'sidebar-left';

export const TOOLBAR_POSITIONS: readonly ToolbarPosition[] = [
  'top',
  'right',
  'bottom',
  'left',
  'sidebar-right',
  'sidebar-left',
] as const;

export function isHorizontalPosition(position: ToolbarPosition): boolean {
  return position === 'top' || position === 'bottom';
}

export function isSidebarPosition(position: ToolbarPosition): boolean {
  return position === 'sidebar-right' || position === 'sidebar-left';
}
