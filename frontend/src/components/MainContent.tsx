import React, { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Message } from '../utils/Message';
import TypewriterText from './TypewriterText';
import AITypewriterText from './AITypewriterText';
import Loader from './ui/Loader';
import { ArrowUp, PanelRightOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import StyledButton from './ui/StyledButton';
import Progress from './ui/Progress';

interface MainContentProps {
  messages: Message[];
  inputMessage: string;
  autonomyLevel: number;
  previewMode: 'desktop' | 'mobile';
  activeView: string;
  generatedHtml: string;
  isFirstInteraction: boolean;
  isTyping: boolean;
  currentAiMessage: string;
  agentViews: any[];
  progressReport: string;
  strategyExplanation: string;
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  setInputMessage: (message: string) => void;
  togglePreview: () => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  setActiveView: (view: string) => void;
  requestProgressReport: () => void;
  requestStrategyExplanation: (strategyType: string) => void;
  isSending: boolean;
  workspaceId: string | null;
}

const MainContent: React.FC<MainContentProps> = ({
  messages,
  inputMessage,
  autonomyLevel,
  activeView,
  isFirstInteraction,
  isTyping,
  currentAiMessage,
  agentViews,
  progressReport,
  strategyExplanation,
  handleSendMessage,
  setInputMessage,
  togglePreview,
  setActiveView,
  requestProgressReport,
  requestStrategyExplanation,
  isSending,
}) => {
  const { themeType } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputBgColor = themeType === 'dark' ? 'bg-[#1E2128]' : 'bg-[#F5F9FC]';
  const inputTextColor = themeType === 'dark' ? 'text-white' : 'text-[#1E293B]';
  const inputPlaceholderColor = themeType === 'dark' ? 'placeholder-[#E8ECF3]' : 'placeholder-[#94A3B8]';
  const messageBgColor = themeType === 'dark' ? 'bg-[#4A4A4A]' : 'bg-[#F8FAFC]';
  const userMessageBgColor = themeType === 'dark' ? 'bg-[#243242]' : 'bg-[#E2E8F0]';

  useEffect(() => {
    if (messages.length === 1 && isFirstInteraction) {
      setIsTransitioning(true);
    }
  }, [messages.length, isFirstInteraction]);

  const getInputPosition = () => {
    if (isFirstInteraction) {
      return 'top-1/2 -translate-y-1/2 w-[90%] md:w-[600px]';
    }
    return 'bottom-4 w-full max-w-3xl px-4';
  };

  const inputContainerClasses = `
    fixed
    left-1/2
    -translate-x-1/2
    transition-all
    duration-1000
    ease-in-out
    ${getInputPosition()}
  `;

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[var(--chat-area)] text-[var(--text)] transition-all duration-300 ease-in-out">
      <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
        <TabsContent value="chat" className="flex-1 flex flex-col content-transition">
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-3/5">
            <ScrollArea className={`flex-1 ${isFirstInteraction ? 'hidden' : ''}`}>
              <div className="space-y-6 px-4 py-4">
                {messages.map((message: Message, index: number) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role !== 'user' && (
                      <div className="relative" style={{ width: '20px', height: '20px' }}>
                        <Loader isThinking={false} />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] ${
                        message.role === 'user'
                          ? `${userMessageBgColor} text-[var(--text)] p-3 rounded-2xl`
                          : 'text-[var(--text)]'
                      }`}
                    >
                      {message.role === 'ai' ? (
                        <AITypewriterText 
                          message={message} 
                          index={index}
                        />
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="relative" style={{ width: '20px', height: '20px' }}>
                      <Loader isThinking={true} />
                    </div>
                    <div className="text-[var(--text)] opacity-50">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className={inputContainerClasses}>
              {isFirstInteraction && (
                <div className="text-center mb-4 text-[var(--text-secondary)]">
                  <TypewriterText text="Got a website concept? I'm here to assist." />
                </div>
              )}
              <form 
                className="flex items-center space-x-2"
                onSubmit={handleSendMessage}
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={isFirstInteraction ? "Message Eden" : "Reply to Eden..."}
                    className={`w-full ${inputBgColor} ${inputTextColor} ${inputPlaceholderColor} 
                      rounded-full pl-4 pr-12 py-2 border-2 border-[var(--accent-highlight)] 
                      focus:outline-none focus:ring-0 focus:border-[var(--accent-highlight)]
                      transition-all duration-1000 ease-in-out
                    `}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className={`absolute right-1 top-1/2 transform -translate-y-1/2 
                      ${inputBgColor} ${inputTextColor} hover:bg-[var(--button-hover)] 
                      transition-all duration-300 
                      ${isSending ? 'animate-pulse' : ''} 
                      rounded-full w-8 h-8 flex items-center justify-center 
                      ${inputMessage.trim() !== '' ? 'opacity-100' : 'opacity-0'}
                    `}
                    disabled={isSending || inputMessage.trim() === ''}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </TabsContent>

        {agentViews.map((view, index) => (
          <TabsContent key={index} value={view.name} className="flex-1 p-6 overflow-auto content-transition">
            <div className="content-transition">
              <ul className="space-y-4">
                {view.content.map((item: string, i: number) => (
                  <li key={i} className={`${messageBgColor} p-4 rounded-lg text-[var(--text)] shadow-sm`}>{item}</li>
                ))}
              </ul>
              <div className="mt-4">
                <StyledButton 
                  onClick={() => requestStrategyExplanation(view.name)}
                >
                  Explain {view.name} Strategy
                </StyledButton>
              </div>
              {strategyExplanation && (
                <div className={`mt-6 ${messageBgColor} p-4 rounded-lg text-[var(--text)] shadow-sm`}>
                  <p>{strategyExplanation}</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="progress" className="flex-1 p-6 overflow-auto content-transition">
          <div className="content-transition">
            <div className="mb-6">
              <Progress value={autonomyLevel} label="Project Progress" />
            </div>
            <div className="mb-6">
              <StyledButton onClick={requestProgressReport}>
                Get Progress Report
              </StyledButton>
            </div>
            {progressReport && (
              <div className={`${messageBgColor} p-4 rounded-lg text-[var(--text)] shadow-sm`}>
                <pre className="whitespace-pre-wrap">{progressReport}</pre>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Button
        variant="ghost"
        size="icon"
        onClick={togglePreview}
        className={`fixed top-1/2 right-0 transform -translate-y-1/2 z-40 ${inputBgColor} hover:bg-[var(--button-hover)] rounded-l-md text-[var(--text)]`}
        title="Toggle Preview"
      >
        <PanelRightOpen className="h-5 w-5" />
      </Button>
    </main>
  );
};

export default MainContent;
