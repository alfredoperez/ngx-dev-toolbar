import { IconName } from '../icons/icon.models';
import { WindowConfig } from '../window/window.models';

export interface DevToolbarToolConfig {
  icon: IconName;
  name: string;
  windowConfig: WindowConfig;
  isBeta?: boolean;
}
