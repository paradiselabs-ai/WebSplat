import React from 'react';
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Message } from '../utils/Message';
import TypewriterText from './TypewriterText';
import Loader from './ui/Loader';
import { ArrowUp, PanelRightOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const inputBgColor = themeType === 'dark' ? 'bg-[#212121]' : 'bg-[#F5F5F5]';
  const inputTextColor = themeType === 'dark' ? 'text-white' : 'text-[#1E293B]';
  const inputPlaceholderColor = themeType === 'dark' ? 'placeholder-[#808080]' : 'placeholder-[#94A3B8]';
  const messageBgColor = themeType === 'dark' ? 'bg-[#4A4A4A]' : 'bg-[#F8FAFC]';
  const userMessageBgColor = themeType === 'dark' ? 'bg-[#808080]' : 'bg-[#E2E8F0]';

  const lastMessage = messages[messages.length - 1];
  const showLoaderAfterUserMessage = lastMessage?.role === 'user' && isTyping;

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[var(--chat-area)] text-[var(--text)] transition-all duration-300 ease-in-out">
      <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
        <TabsContent value="chat" className="flex-1 flex flex-col content-transition">
          <div className="flex-1 flex justify-center items-center">
            <div className="w-3/5 max-w-3xl">
              <ScrollArea className={`h-[calc(100vh-10rem)] mt-4 ${isFirstInteraction ? 'hidden' : ''}`}>
                {messages.map((message: Message, index: number) => (
                  <div 
                    key={index} 
                    className={`mb-4 relative ${
                      message.role === 'ai' 
                        ? `${messageBgColor} text-[var(--text)] p-3 rounded-2xl` 
                        : `${userMessageBgColor} text-[var(--text)] p-3 rounded-2xl`
                    }`}
                  >
                    <p className={message.role === 'ai' ? 'font-tiempos text-base' : 'font-styrene text-[15px]'}>
                      {message.content}
                    </p>
                    {index === messages.length - 1 && message.role === 'ai' && !isTyping && (
                      <Loader isThinking={false} />
                    )}
                    {index === messages.length - 1 && message.role === 'user' && isTyping && (
                      <Loader isThinking={true} />
                    )}
                  </div>
                ))}
                {messages.length === 0 && !isTyping && (
                  <div className="relative">
                    <Loader isThinking={false} />
                  </div>
                )}
              </ScrollArea>
              <div 
                className={`relative transition-all duration-1000 ease-in-out ${
                  isFirstInteraction 
                    ? 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
                    : 'transform translate-y-0'
                }`}
              >
                {isFirstInteraction && (
                  <div className="text-center mb-4 text-[var(--text-secondary)]">
                    <TypewriterText text="Got a website concept? I'm here to assist." />
                  </div>
                )}
                <form className="flex items-center space-x-2" onSubmit={handleSendMessage}>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={isFirstInteraction ? "Message Eden" : "Reply to Eden..."}
                      className={`w-full ${inputBgColor} ${inputTextColor} ${inputPlaceholderColor} rounded-full pl-4 pr-12 py-2 border-2 border-[var(--accent-highlight)] focus:outline-none focus:ring-0 focus:border-[var(--accent-highlight)]`}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <Button
                      type="submit"
                      className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${inputBgColor} ${inputTextColor} hover:bg-[var(--button-hover)] transition-all duration-300 ${
                        isSending ? 'animate-pulse' : ''
                      } rounded-full w-8 h-8 flex items-center justify-center opacity-0 ${
                        inputMessage.trim() !== '' ? 'opacity-100' : ''
                      }`}
                      disabled={isSending || inputMessage.trim() === ''}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </TabsContent>

        {agentViews.map((view, index) => (
          <TabsContent key={index} value={view.name} className="flex-1 p-6 overflow-auto content-transition">
            <div className="content-transition">
              <h2 className="text-xl font-bold mb-6 text-[var(--text-secondary)]">{view.name}</h2>
              <ul className="space-y-4">
                {view.content.map((item: string, i: number) => (
                  <li key={i} className={`${messageBgColor} p-4 rounded-lg text-[var(--text)] shadow-sm`}>{item}</li>
                ))}
              </ul>
              <Button 
                onClick={() => requestStrategyExplanation(view.name)} 
                className={`mt-6 ${inputBgColor} hover:bg-[var(--button-hover)] text-[var(--text)]`}
              >
                Explain {view.name} Strategy
              </Button>
              {strategyExplanation && (
                <div className={`mt-6 ${messageBgColor} p-4 rounded-lg text-[var(--text)] shadow-sm`}>
                  <h3 className="font-bold mb-3">{view.name} Strategy Explanation:</h3>
                  <p>{strategyExplanation}</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="progress" className="flex-1 p-6 overflow-auto content-transition">
          <div className="content-transition">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-secondary)]">Progress Report</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-[var(--text-secondary)]">Overall Progress</h3>
              <div className={`w-full ${messageBgColor} rounded-full h-4`}>
                <div
                  className="bg-[var(--accent)] h-4 rounded-full transition-all duration-300"
                  style={{ width: `${autonomyLevel}%` }}
                ></div>
              </div>
              <p className="mt-2 text-right text-[var(--text-secondary)]">{autonomyLevel}%</p>
            </div>
            <Button 
              onClick={requestProgressReport} 
              className={`mb-6 ${inputBgColor} hover:bg-[var(--button-hover)] text-[var(--text)]`}
            >
              Get Progress Report
            </Button>
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
