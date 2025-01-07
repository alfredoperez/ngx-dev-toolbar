import { IconName } from '../icons/icon.models';

export interface DevToolbarWindowPosition {
  x: number;
  y: number;
}
export interface DevToolbarWindowOptions {
  id: string;
  /**
   * The title of the window, this can be different from the name of the tool
   */
  title: string;
  description?: string;
  isClosable?: boolean;
  isMaximizable?: boolean;
  isMinimizable?: boolean;
  placement?:
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'top-left'
    | 'top-center'
    | 'top-right';
  size?: 'small' | 'medium' | 'tall' | 'large';
  isBeta?: boolean;
}

export interface DevToolbarToolOptions {
  icon: IconName;
  name: string;
  windowOptions: DevToolbarWindowOptions;
  isBeta?: boolean;
}
