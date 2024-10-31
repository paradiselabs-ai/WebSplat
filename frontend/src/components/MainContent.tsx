import React from 'react';
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Message } from '../utils/Message';
import TypewriterText from './TypewriterText';
import LivePreview from './LivePreview';
import { ArrowUp } from 'lucide-react'; // Import the ArrowUp icon

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
  isSending: boolean; // Define the isSending prop
}

const MainContent: React.FC<MainContentProps> = ({
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
}) => {
  return (
    <main className={`flex-1 flex flex-col overflow-hidden bg-[#2C2B28] text-[#999999] transition-all duration-300 ease-in-out`}>
      <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
        <TabsList className="justify-start px-4 py-2 border-b border-[#333333]">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          {agentViews.map((view, index) => (
            <TabsTrigger key={index} value={view.name}>{view.name}</TabsTrigger>
          ))}
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="flex-1 flex justify-center items-center">
            <div className="w-3/5 max-w-3xl">
              <ScrollArea className={`h-[calc(100vh-10rem)] mt-4 ${isFirstInteraction ? 'hidden' : ''}`}>
                {messages.map((message: Message, index: number) => (
                  <div key={index} className={`mb-4 ${message.role === 'ai' ? 'bg-[#31312E] text-[#F5F4EF] p-3 rounded-2xl' : 'bg-[#21201C] text-[#E5E5E2] p-3 rounded-2xl'}`}>
                    <p className={message.role === 'ai' ? 'font-tiempos text-base' : 'font-styrene text-[15px]'}>
                      {message.content}
                    </p>
                  </div>
                ))}
                {isTyping && (
                  <div className="mb-4 bg-[#31312E] text-[#F5F4EF] p-3 rounded-2xl">
                    <p className="font-tiempos text-base">{currentAiMessage}</p>
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
                  <div className="text-center mb-4">
                    <TypewriterText text="Got a website concept? I'm here to assist." />
                  </div>
                )}
                <form className="flex items-center space-x-2" onSubmit={handleSendMessage}>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={isFirstInteraction ? "Message Eden" : "Reply to Eden..."}
                      className="w-full bg-[#31312E] text-[#E5E5E2] rounded-full pl-4 pr-12 py-2 focus:ring-2 focus:ring-[#444444] focus:border-transparent placeholder-[#A6A39A]"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <Button
                      type="submit"
                      className={`absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#A3512B] text-white hover:bg-[#B5613B] transition-all duration-300 ${isSending ? 'animate-pulse' : ''} rounded-full w-8 h-8 flex items-center justify-center opacity-0 ${inputMessage.trim() !== '' ? 'opacity-100' : ''}`}
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
          <TabsContent key={index} value={view.name} className="flex-1 p-4 overflow-auto">
            <h2 className="text-xl font-bold mb-4">{view.name}</h2>
            <ul className="space-y-2">
            {view.content.map((item: string, i: string) => (
              <li key={i} className="bg-[#31312E] p-2 rounded">{item}</li>
            ))}
            </ul>
            <Button onClick={() => requestStrategyExplanation(view.name)} className="mt-4">
              Explain {view.name} Strategy
            </Button>
            {strategyExplanation && (
              <div className="mt-4 bg-[#31312E] p-3 rounded">
                <h3 className="font-bold mb-2">{view.name} Strategy Explanation:</h3>
                <p>{strategyExplanation}</p>
              </div>
            )}
          </TabsContent>
        ))}
        <TabsContent value="progress" className="flex-1 p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Progress Report</h2>
          <Button onClick={requestProgressReport} className="mb-4">
            Get Progress Report
          </Button>
          {progressReport && (
            <div className="bg-[#31312E] p-3 rounded">
              <pre className="whitespace-pre-wrap">{progressReport}</pre>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default MainContent;