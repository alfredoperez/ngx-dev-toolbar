export type ToolbarPosition = 'top' | 'right' | 'bottom' | 'left';

export const TOOLBAR_POSITIONS: readonly ToolbarPosition[] = [
  'top',
  'right',
  'bottom',
  'left',
] as const;

export function isHorizontalPosition(position: ToolbarPosition): boolean {
  return position === 'top' || position === 'bottom';
}
