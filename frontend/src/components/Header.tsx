import React, { ChangeEvent } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Settings, Sliders, Edit2 } from 'lucide-react';

interface HeaderProps {
  isFirstInteraction: boolean;
  projectName: string;
  isEditingProjectName: boolean;
  isHoveringProjectName: boolean;
  toggleAutonomySlider: () => void;
  setIsEditingProjectName: (isEditing: boolean) => void;
  setIsHoveringProjectName: (isHovering: boolean) => void;
  handleProjectNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleProjectNameBlur: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isFirstInteraction,
  projectName,
  isEditingProjectName,
  isHoveringProjectName,
  toggleAutonomySlider,
  setIsEditingProjectName,
  setIsHoveringProjectName,
  handleProjectNameChange,
  handleProjectNameBlur,
}) => {
  return (
    <header className="h-14 flex items-center justify-between px-4 z-10 bg-gradient-to-b from-[#2A2A2A] to-[#2C2B28]">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-semibold text-[#888888]">WebSplat</span>
      </div>
      <div className="flex-1 flex justify-center items-center">
        {!isFirstInteraction && (
          isEditingProjectName ? (
            <Input
              value={projectName}
              onChange={handleProjectNameChange}
              onBlur={handleProjectNameBlur}
              className="max-w-xs text-center bg-transparent border-none text-[#888888] focus:ring-0"
              autoFocus
            />
          ) : (
            <div
              data-testid="project-name-container"
              className="relative"
              onMouseEnter={() => setIsHoveringProjectName(true)}
              onMouseLeave={() => setIsHoveringProjectName(false)}
            >
              <h1
                className={`text-xl font-bold text-[#888888] cursor-pointer hover:text-[#AAAAAA] transition-colors duration-300 ${projectName === 'Untitled Project' ? 'animate-pulse' : ''}`}
                onClick={() => setIsEditingProjectName(true)}
              >
                {projectName}
              </h1>
              {isHoveringProjectName && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingProjectName(true)}
                  className="absolute -right-8 top-1/2 transform -translate-y-1/2"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        )}
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="group" onClick={toggleAutonomySlider}>
          <Sliders className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="group">
          <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
        </Button>
        <Avatar className="h-8 w-8 rounded-full overflow-hidden">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" className="rounded-full" />
          <AvatarFallback className="rounded-full">CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
