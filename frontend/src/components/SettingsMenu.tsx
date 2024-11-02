import { Button } from "./ui/button";
import { X, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu = ({ isOpen, onClose }: SettingsMenuProps) => {
  const { themeType, toggleTheme } = useTheme();
  const isDark = themeType === 'dark';

  if (!isOpen) return null;

  return (
    <div className="menu-animation absolute right-0 top-14 w-64 bg-[var(--panel-bg)] rounded-lg shadow-lg p-4 border border-[var(--panel-border)] z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--header-text)]">Settings</h3>
        <Button
          onClick={onClose}
          variant="ghost"
          className="text-[var(--header-text)] hover:text-[var(--header-hover)] hover:bg-[var(--button-hover)]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--header-text)]">Theme</span>
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              onClick={toggleTheme}
              className="theme-icon text-[var(--header-text)] hover:text-[var(--header-hover)] hover:bg-[var(--button-hover)]"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
