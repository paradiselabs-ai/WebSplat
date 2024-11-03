import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import PreviewPanel from './PreviewPanel';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import MinimalAutonomyControl from './MinimalAutonomyControl';

const App = () => {
    const context = useContext(AppContext);
  
    if (!context) {
      throw new Error('AppContext is not provided');
    }
  
    const {
      messages,
      inputMessage,
      autonomyLevel,
      previewMode,
      activeView,
      generatedHtml,
      isFirstInteraction,
      isTyping,
      currentAiMessage,
      agentViews,
      progressReport,
      strategyExplanation,
      handleSendMessage,
      setInputMessage,
      togglePreview,
      setPreviewMode,
      setActiveView, 
      requestProgressReport,
      requestStrategyExplanation,
      isSending,
      projectName,
      isEditingProjectName,
      isHoveringProjectName,
      setIsEditingProjectName,
      setIsHoveringProjectName,
      isAutonomySliderVisible,
      handleProjectNameChange,
      handleProjectNameBlur,
      sidebarOpen,
      setAutonomyLevel,
      toggleAutonomySlider,
      workspaceId,
      previewOpen,
    } = context;
  
    return (
      <div className="h-screen flex flex-col bg-[#1E2128]">
        <Header
          isFirstInteraction={isFirstInteraction}
          projectName={projectName}
          isEditingProjectName={isEditingProjectName}
          isHoveringProjectName={isHoveringProjectName}
          toggleAutonomySlider={toggleAutonomySlider}
          setIsEditingProjectName={setIsEditingProjectName}
          setIsHoveringProjectName={setIsHoveringProjectName}
          handleProjectNameChange={handleProjectNameChange}
          handleProjectNameBlur={handleProjectNameBlur}
          agentViews={agentViews}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            sidebarOpen={sidebarOpen}
            agentViews={agentViews}
            activeView={activeView}
            autonomyLevel={autonomyLevel}
            setActiveView={setActiveView}
            setAutonomyLevel={setAutonomyLevel}
          />
          <MainContent
            messages={messages}
            inputMessage={inputMessage}
            autonomyLevel={autonomyLevel}
            previewMode={previewMode}
            activeView={activeView}
            generatedHtml={generatedHtml}
            isFirstInteraction={isFirstInteraction}
            isTyping={isTyping}
            currentAiMessage={currentAiMessage}
            agentViews={agentViews}
            progressReport={progressReport}
            strategyExplanation={strategyExplanation}
            handleSendMessage={handleSendMessage}
            setInputMessage={setInputMessage}
            togglePreview={togglePreview}
            setPreviewMode={setPreviewMode}
            setActiveView={setActiveView} 
            requestProgressReport={requestProgressReport}
            requestStrategyExplanation={requestStrategyExplanation}
            isSending={isSending}
            workspaceId={workspaceId}
          />
          <PreviewPanel
            previewOpen={previewOpen}
            previewMode={previewMode}
            generatedHtml={generatedHtml}
            workspaceId={workspaceId}
            togglePreview={togglePreview}
            setPreviewMode={setPreviewMode}
          />
        </div>
        {isAutonomySliderVisible && (
          <div className="fixed top-14 right-4 bg-[#171717] border border-[#4A4A4A] p-4 rounded-lg shadow-lg z-50">
            <h3 className="text-lg font-semibold mb-2 text-[#676767]">AI Autonomy Level</h3>
            <MinimalAutonomyControl
              value={autonomyLevel}
              onChange={setAutonomyLevel}
            />
          </div>
        )}
      </div>
    );
};

export default App;
