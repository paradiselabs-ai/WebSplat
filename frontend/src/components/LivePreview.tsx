import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

type PreviewMode = 'desktop' | 'mobile';

interface LivePreviewProps {
  workspaceId: string | null;
  mode: PreviewMode;
}

const LivePreview: React.FC<LivePreviewProps> = ({ workspaceId, mode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Reset states when workspaceId changes
    if (workspaceId) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    // Handle mode transitions
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [mode]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#999999] space-y-4">
        <div className="text-lg font-medium">No preview available</div>
        <div className="text-sm text-[#777777]">Start a conversation to generate a preview</div>
      </div>
    );
  }

  const previewUrl = `http://localhost:8000/serve/${workspaceId}/index.html`;

  return (
    <div className={`w-full h-full overflow-auto ${mode === 'mobile' ? 'max-w-[375px] mx-auto' : ''}`}>
      <div 
        className={`relative border-2 border-[#444444] rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
          mode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'
        } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#2A2A2A] z-10">
            <Loader2 className="w-8 h-8 text-[#A3512B] animate-spin" />
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2A2A2A] z-10 space-y-4">
            <AlertCircle className="w-8 h-8 text-[#F5A9A9]" />
            <div className="text-[#F5A9A9] text-center">
              <div className="font-medium">Failed to load preview</div>
              <div className="text-sm mt-1">Please try again later</div>
            </div>
          </div>
        )}
        <iframe
          src={previewUrl}
          title="Live Preview"
          className={`w-full h-full border-0 transition-transform duration-300 ease-in-out ${
            hasError ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ 
            transform: mode === 'mobile' ? 'scale(0.75)' : 'none', 
            transformOrigin: 'top left' 
          }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
      {mode === 'mobile' && (
        <div className="mt-4 text-center text-sm text-[#777777]">
          Mobile Preview (375x667)
        </div>
      )}
    </div>
  );
};

export default LivePreview;
