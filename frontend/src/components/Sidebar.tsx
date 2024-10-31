import React from 'react';
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Plus } from 'lucide-react';
import MinimalAutonomyControl from './MinimalAutonomyControl';
import { AgentView } from '../utils/AgentView';

interface SidebarProps {
  sidebarOpen: boolean;
  agentViews: AgentView[];
  activeView: string;
  autonomyLevel: number;
  setActiveView: (view: string) => void;
  setAutonomyLevel: (level: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  agentViews,
  activeView,
  autonomyLevel,
  setActiveView,
  setAutonomyLevel,
}) => {
  return (
    <aside className={`w-64 p-4 flex flex-col bg-[#2A2A2A] text-[#888888] fixed h-[calc(100%-5rem)] mt-4 ml-4 mb-6 rounded-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30`}>
      <Button className="mb-6 bg-transparent text-[#999999] hover:bg-[#3A3A3A] transition-all duration-300 transform hover:scale-105">
        <Plus className="mr-2 h-4 w-4" /> New Website
      </Button>
      <ScrollArea className="flex-1">
        <nav className="space-y-3">
          {agentViews.map((item, index) => (
            <Button 
              key={index}
              variant="ghost" 
              className={`w-full justify-start hover:bg-[#3A3A3A] transition-all duration-300 group ${activeView === item.name ? 'bg-[#3A3A3A]' : ''}`}
              onClick={() => setActiveView(item.name)}
            >
              <div className="flex items-center w-full">
                <div className="p-2 rounded-lg mr-3 group-hover:bg-[#4A4A4A] transition-colors duration-300">
                  <item.icon className="h-5 w-5 text-[#888888] group-hover:text-[#AAAAAA] transition-colors duration-300" />
                </div>
                <span className="text-[#888888] group-hover:text-[#AAAAAA] transition-colors duration-300 text-sm">{item.name}</span>
              </div>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-6">
        <label htmlFor="autonomy-slider" className="block text-xs font-medium mb-2">
          AI Autonomy Level: {autonomyLevel}%
        </label>
        <MinimalAutonomyControl
          value={autonomyLevel}
          onChange={setAutonomyLevel}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
