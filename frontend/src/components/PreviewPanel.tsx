import { Monitor, Smartphone, X } from "lucide-react";
import { Button } from "./ui/button";
import LivePreview from "./LivePreview";

interface PreviewPanelProps {
  previewOpen: boolean;
  previewMode: 'desktop' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  togglePreview: () => void;
  generatedHtml?: string;
  workspaceId: string | null;
}

const PreviewPanel = ({ 
  previewOpen, 
  previewMode,
  setPreviewMode,
  togglePreview, 
  generatedHtml,
  workspaceId 
}: PreviewPanelProps) => {
  return (
    <aside className={`fixed inset-0 bg-[var(--panel-bg)] text-[var(--header-text)] transition-transform duration-300 ease-in-out ${previewOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
      <div className="h-14 border-b border-[var(--panel-border)] flex items-center justify-between px-4">
        <h2 className="font-semibold">Real-time Preview</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPreviewMode('desktop')}
            className={previewMode === 'desktop' ? 'bg-[var(--button-active-bg)] text-[var(--button-active)]' : 'text-[var(--header-text)] hover:text-[var(--header-hover)] hover:bg-[var(--button-hover)]'}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPreviewMode('mobile')}
            className={previewMode === 'mobile' ? 'bg-[var(--button-active-bg)] text-[var(--button-active)]' : 'text-[var(--header-text)] hover:text-[var(--header-hover)] hover:bg-[var(--button-hover)]'}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePreview}
            className="ml-4 text-[var(--header-text)] hover:text-[var(--header-hover)] hover:bg-[var(--button-hover)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-[calc(100%-3.5rem)] p-4">
        <LivePreview generatedHtml={generatedHtml || ''} mode={previewMode} workspaceId={workspaceId} />
      </div>
    </aside>
  );
};

export default PreviewPanel;
