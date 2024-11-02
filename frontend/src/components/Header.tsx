import React, { useState, ChangeEvent, useContext } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Settings, Sliders, Edit2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SettingsMenu from './SettingsMenu';  // Fixed import to use default import
import { AppContext } from '../context/AppContext';
import { AgentView } from '../utils/AgentView';

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
  agentViews: AgentView[];
  activeView: string;
  setActiveView: (view: string) => void;
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
  agentViews,
  activeView,
  setActiveView,
}) => {
  const context = useContext(AppContext);
  if (!context) throw new Error('Header must be used within AppProvider');
  
  const { isSettingsOpen, toggleSettings } = context;

  return (
    <div className="header-container">
      <header className="top-header h-14 flex items-center justify-between px-4 z-10">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-[var(--header-text)]">WebSplat</span>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {!isFirstInteraction && (
            isEditingProjectName ? (
              <Input
                value={projectName}
                onChange={handleProjectNameChange}
                onBlur={handleProjectNameBlur}
                className="max-w-xs text-center bg-transparent border-none text-[var(--header-text)] focus:ring-0 focus:ring-[var(--input-focus)]"
                autoFocus
              />
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setIsHoveringProjectName(true)}
                onMouseLeave={() => setIsHoveringProjectName(false)}
              >
                <h1
                  className={`text-xl font-bold text-[var(--header-text)] cursor-pointer hover:text-[var(--header-hover)] transition-colors duration-300 ${
                    projectName === 'Untitled Project' ? 'animate-pulse' : ''
                  }`}
                  onClick={() => setIsEditingProjectName(true)}
                >
                  {projectName}
                </h1>
                {isHoveringProjectName && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingProjectName(true)}
                    className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-[var(--button-bg)] hover:text-[var(--button-hover)]"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="group text-[var(--button-bg)] hover:text-[var(--button-hover)]" 
            onClick={toggleAutonomySlider}
          >
            <Sliders className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="group text-[var(--button-bg)] hover:text-[var(--button-hover)]"
              onClick={toggleSettings}
            >
              <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
            </Button>
            <SettingsMenu isOpen={isSettingsOpen} onClose={toggleSettings} />
          </div>
          <Avatar className="h-8 w-8 rounded-full overflow-hidden bg-[var(--accent-primary)]">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" className="rounded-full" />
            <AvatarFallback className="rounded-full text-[var(--text-hover)]">CN</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="nav-header h-12">
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="justify-start px-4 py-2 flex gap-4">
            <TabsTrigger 
              value="chat"
              className="px-4 data-[state=active]:bg-[var(--button-active-bg)] data-[state=active]:text-[var(--button-active)] hover:bg-[var(--button-hover)] text-[var(--header-text)]"
            >
              Chat
            </TabsTrigger>
            {agentViews && agentViews.map((view: AgentView, index: number) => (
              <TabsTrigger 
                key={index} 
                value={view.name}
                className="px-4 data-[state=active]:bg-[var(--button-active-bg)] data-[state=active]:text-[var(--button-active)] hover:bg-[var(--button-hover)] text-[var(--header-text)]"
              >
                {view.name}
              </TabsTrigger>
            ))}
            <TabsTrigger 
              value="progress"
              className="px-4 data-[state=active]:bg-[var(--button-active-bg)] data-[state=active]:text-[var(--button-active)] hover:bg-[var(--button-hover)] text-[var(--header-text)]"
            >
              Progress
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default Header;
