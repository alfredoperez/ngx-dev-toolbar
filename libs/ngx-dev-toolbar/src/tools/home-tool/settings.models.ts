import { ToolbarPosition } from '../../models/toolbar-position.model';

export interface Settings {
  isDarkMode: boolean;
  position: ToolbarPosition;
  isCompletelyHidden: boolean;
}
