import React from 'react';
import { Button } from "./ui/button";
import { Laptop, Smartphone, PanelRightOpen } from 'lucide-react';
import LivePreview from './LivePreview';

interface PreviewPanelProps {
  previewOpen: boolean;
  previewMode: 'desktop' | 'mobile';
  workspaceId: string | null;
  togglePreview: () => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewOpen,
  previewMode,
  workspaceId,
  togglePreview,
  setPreviewMode,
}) => {
  return (
    <aside className={`fixed inset-0 bg-[#2A2A2A] text-[#888888] transition-transform duration-300 ease-in-out ${previewOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
      <div className="h-14 border-b border-[#333333] flex items-center justify-between px-4">
        <h2 className="font-semibold">Real-time Preview</h2>
        <div className="flex space-x-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setPreviewMode('desktop')}
          >
            <Laptop className="h-4 w-4" />
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePreview}
            className="ml-4"
          >
            <PanelRightOpen className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto h-[calc(100vh-3.5rem)]">
        <LivePreview mode={previewMode} workspaceId={workspaceId} />
      </div>
      <div className="p-2 text-sm text-[#777777] text-center">
        Note: This preview updates live as the AI generates the website code.
      </div>
    </aside>
  );
};

export default PreviewPanel;
