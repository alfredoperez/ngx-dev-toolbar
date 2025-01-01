export type WindowPlacement =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export type WindowSize = 'small' | 'medium' | 'tall' | 'large';
export interface WindowConfig {
  id: string;
  /**
   * The title of the window, this can be different from the name of the tool
   */
  title: string;
  description?: string;
  isClosable?: boolean;
  isMaximizable?: boolean;
  isMinimizable?: boolean;
  placement?: WindowPlacement;
  size?: WindowSize;
  isBeta?: boolean;
}

export interface WindowPosition {
  x: number;
  y: number;
}
