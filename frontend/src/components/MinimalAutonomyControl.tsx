import { Input } from "./ui/input";

interface MinimalAutonomyControlProps {
  value: number;
  onChange: (value: number) => void;
}

const MinimalAutonomyControl = ({ value, onChange }: MinimalAutonomyControlProps) => {
  return (
    <div className="menu-animation fixed top-14 right-4 bg-[var(--panel-bg)] border border-[var(--panel-border)] p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-lg font-semibold mb-2 text-[var(--header-text)]">AI Autonomy Level</h3>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          className="w-full h-2 bg-[var(--accent-primary)] rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--button-active-bg) 0%, var(--button-active-bg) ${value}%, var(--accent-primary) ${value}%, var(--accent-primary) 100%)`,
          }}
          onChange={(e) => onChange(parseInt(e.target.value))}
        />
        <Input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-12 text-center bg-[var(--button-bg)] text-[var(--text-hover)] border border-[var(--panel-border)] rounded hover:border-[var(--button-hover)] focus:border-[var(--button-active-bg)] focus:ring-1 focus:ring-[var(--button-active-bg)]"
        />
      </div>
    </div>
  );
};

export default MinimalAutonomyControl;
