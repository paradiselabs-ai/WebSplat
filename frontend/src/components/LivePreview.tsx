import React from 'react';

type PreviewMode = 'desktop' | 'mobile';

interface LivePreviewProps {
  workspaceId: string | null;
  mode: PreviewMode;
}

const LivePreview: React.FC<LivePreviewProps> = ({ workspaceId, mode }) => {
  if (!workspaceId) {
    return <div>No preview available</div>;
  }

  const previewUrl = `http://localhost:8000/serve/${workspaceId}/index.html`;

  return (
    <div className={`w-full h-full overflow-auto ${mode === 'mobile' ? 'max-w-[375px] mx-auto' : ''}`}>
      <div className={`border-2 border-[#444444] rounded-lg overflow-hidden ${mode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}>
        <iframe
          src={previewUrl}
          title="Live Preview"
          className="w-full h-full border-0"
          style={{ transform: mode === 'mobile' ? 'scale(0.75)' : 'none', transformOrigin: 'top left' }}
        />
      </div>
    </div>
  );
};

export default LivePreview;
