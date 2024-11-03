import { Progress as NextUIProgress } from "@nextui-org/react";
import { useTheme } from "../../context/ThemeContext";

interface ProgressProps {
  value: number;
  label?: string;
}

export const Progress = ({ value, label = "Project Progress" }: ProgressProps) => {
  const { themeType } = useTheme();

  return (
    <div className="w-full max-w-md mx-auto">
      <NextUIProgress
        size="sm"
        radius="sm"
        classNames={{
          base: "w-full",
          track: "drop-shadow-md border border-default",
          indicator: themeType === 'dark' 
            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
            : "bg-gradient-to-r from-[#152861] to-[#00B4B5]",
          label: "tracking-wider font-medium text-default-600",
          value: "text-foreground/60",
        }}
        label={label}
        value={value}
        showValueLabel={true}
      />
    </div>
  );
}

export default Progress;
