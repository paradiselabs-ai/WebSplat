import React from 'react';

interface MinimalAutonomyControlProps {
  value: number;
  onChange: (value: number) => void;
}

const MinimalAutonomyControl: React.FC<MinimalAutonomyControlProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-orange-200 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #FFA500 0%, #FFA500 ${value}%, #E5E5E5 ${value}%, #E5E5E5 100%)`,
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-12 text-center bg-transparent border border-gray-300 rounded"
      />
    </div>
  );
};

export default MinimalAutonomyControl;
