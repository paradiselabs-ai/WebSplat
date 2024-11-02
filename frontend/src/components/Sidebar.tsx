import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { AgentView } from "../utils/AgentView";

interface SidebarProps {
  sidebarOpen: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  agentViews: AgentView[];
  autonomyLevel: number;
  setAutonomyLevel: (level: number) => void;
}

const Sidebar = ({ sidebarOpen, activeView, setActiveView, agentViews, autonomyLevel, setAutonomyLevel }: SidebarProps) => {
  return (
    <aside className={`w-64 p-4 flex flex-col bg-[var(--sidebar-bg)] text-[var(--text-tertiary)] fixed h-[calc(100%-5rem)] mt-4 ml-4 mb-6 rounded-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30`}>
      <Button className="mb-6 bg-transparent text-[var(--text-tertiary)] hover:bg-[var(--sidebar-hover)] transition-all duration-300 transform hover:scale-105">
        <Plus className="mr-2 h-4 w-4" /> New Website
      </Button>

      <nav className="flex-1 space-y-4">
        {agentViews.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`w-full justify-start hover:bg-[var(--sidebar-hover)] transition-all duration-300 group ${activeView === item.name ? 'bg-[var(--sidebar-hover)]' : ''}`}
            onClick={() => setActiveView(item.name)}
          >
            <div className="flex items-center w-full">
              <div className="p-2 rounded-lg mr-3 group-hover:bg-[var(--accent-primary)] transition-colors duration-300">
                <item.icon className="h-5 w-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-hover)] transition-colors duration-300" />
              </div>
              <span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-hover)] transition-colors duration-300 text-sm">{item.name}</span>
            </div>
          </Button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
