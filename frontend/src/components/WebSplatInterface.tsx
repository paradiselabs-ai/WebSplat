"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PanelRightOpen, Settings, Plus, Laptop, Smartphone, Layout, DollarSign, Search, BarChart2, Cloud, Edit2, ArrowUp, Menu } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

type PreviewMode = 'desktop' | 'mobile';

interface AgentView {
  name: string;
  icon: React.ElementType;
  content: string[];
}

const MinimalAutonomyControl: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-background-secondary rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent-orange) 0%, var(--accent-orange) ${value}%, var(--background-secondary) ${value}%, var(--background-secondary) 100%)`,
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-12 text-center bg-transparent border border-background-secondary rounded text-foreground"
      />
    </div>
  );
};

const LivePreview: React.FC<{ html: string; mode: PreviewMode }> = ({ html, mode }) => {
  return (
    <div className={`w-full h-full overflow-auto ${mode === 'mobile' ? 'max-w-[375px] mx-auto' : ''}`}>
      <div className={`border-2 border-background-secondary rounded-lg overflow-hidden ${mode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}>
        <iframe
          srcDoc={html}
          title="Live Preview"
          className="w-full h-full border-0"
          style={{ transform: mode === 'mobile' ? 'scale(0.75)' : 'none', transformOrigin: 'top left' }}
        />
      </div>
    </div>
  );
};

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayText('');
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text]);

  return <p className="text-foreground-secondary text-lg font-primary leading-golden">{displayText}</p>;
};

const WebSplatInterface: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [autonomyLevel, setAutonomyLevel] = useState<number>(50);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [projectName, setProjectName] = useState<string>('Untitled Project');
  const [isEditingProjectName, setIsEditingProjectName] = useState<boolean>(false);
  const [isHoveringProjectName, setIsHoveringProjectName] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentAiMessage, setCurrentAiMessage] = useState<string>('');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isFirstInteraction, setIsFirstInteraction] = useState<boolean>(true);
  const [agentViews, setAgentViews] = useState<AgentView[]>([
    { name: 'UI Design', icon: Layout, content: [] },
    { name: 'Monetization', icon: DollarSign, content: [] },
    { name: 'SEO', icon: Search, content: [] },
    { name: 'Analytics', icon: BarChart2, content: [] },
    { name: 'Deployment', icon: Cloud, content: [] },
  ]);
  const [activeView, setActiveView] = useState<string>('chat');
  const [progressReport, setProgressReport] = useState<string>('');
  const [strategyExplanation, setStrategyExplanation] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const togglePreview = () => setPreviewOpen(!previewOpen);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setIsSending(true);
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: inputMessage }]);
      setInputMessage('');
      if (isFirstInteraction) {
        setTimeout(() => {
          setIsFirstInteraction(false);
        }, 500);
      }

      try {
        const response = await axios.post('http://localhost:8000/consult', {
          message: inputMessage,
          autonomy_level: autonomyLevel
        });

        const aiResponse = response.data.message;
        setMessages(prevMessages => [...prevMessages, { role: 'ai', content: aiResponse }]);

        if (response.data.tsx_preview) {
          setGeneratedHtml(response.data.tsx_preview);
        }

        // Update agent views
        const updatedViews = agentViews.map(view => {
          if (response.data[view.name.toLowerCase()]) {
            return {
              ...view,
              content: [...view.content, response.data[view.name.toLowerCase()]]
            };
          }
          return view;
        });
        setAgentViews(updatedViews);

        setIsTyping(false);
        setCurrentAiMessage('');
      } catch (error) {
        console.error('Error communicating with backend:', error);
        setMessages(prevMessages => [...prevMessages, { role: 'ai', content: 'I apologize, but I encountered an error while processing your request. Could you please try again?' }]);
      } finally {
        setIsSending(false);
      }
    }
  };

  const requestProgressReport = async () => {
    try {
      const response = await axios.get('http://localhost:8000/progress_report');
      setProgressReport(response.data.report);
    } catch (error) {
      console.error('Error fetching progress report:', error);
      setProgressReport('Error fetching progress report. Please try again.');
    }
  };

  const requestStrategyExplanation = async (strategyType: string) => {
    try {
      const response = await axios.post('http://localhost:8000/explain_strategy', { strategy_type: strategyType });
      setStrategyExplanation(response.data.explanation);
    } catch (error) {
      console.error('Error fetching strategy explanation:', error);
      setStrategyExplanation('Error fetching strategy explanation. Please try again.');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
      const tolerance = 50;

      if ((cursorPosition.x <= tolerance && cursorPosition.y >= windowHeight / 2 - tolerance && cursorPosition.y <= windowHeight / 2 + tolerance) || 
          (cursorPosition.x <= tolerance && cursorPosition.y >= windowHeight - tolerance)) {
        setSidebarOpen(true);
      } else if (cursorPosition.x > 300 && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
  }, [cursorPosition, sidebarOpen, isMobile]);

  const gradientStyle = {
    background: `linear-gradient(to right, rgba(42, 42, 42, ${Math.max(0, 1 - cursorPosition.x / 300)}) 0%, rgba(42, 42, 42, 0) 100%)`,
    opacity: typeof window !== 'undefined' && Math.abs(cursorPosition.y - window.innerHeight / 2) <= 100 ? 1 : 0,
  };

  const handleProjectNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleProjectNameBlur = () => {
    setIsEditingProjectName(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-primary">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 z-10 bg-gradient-to-b from-background-secondary to-background">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <span className="text-sm font-semibold text-foreground">WebSplat</span>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {!isFirstInteraction && (
            isEditingProjectName ? (
              <Input
                value={projectName}
                onChange={handleProjectNameChange}
                onBlur={handleProjectNameBlur}
                className="max-w-xs text-center bg-transparent border-none text-foreground focus:ring-0"
                autoFocus
              />
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setIsHoveringProjectName(true)}
                onMouseLeave={() => setIsHoveringProjectName(false)}
              >
                <h1
                  className={`text-2xl font-bold text-foreground cursor-pointer hover:text-foreground-secondary transition-colors duration-300 ${projectName === 'Untitled Project' ? 'animate-pulse' : ''}`}
                  onClick={() => setIsEditingProjectName(true)}
                >
                  {projectName}
                </h1>
                {isHoveringProjectName && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingProjectName(true)}
                    className="absolute -right-8 top-1/2 transform -translate-y-1/2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="group">
            <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
          </Button>
          <Avatar className="h-8 w-8 rounded-full overflow-hidden">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" className="rounded-full" />
            <AvatarFallback className="rounded-full">CN</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Gradient overlay */}
        {!isMobile && (
          <div
            className="fixed top-14 left-0 w-64 h-[calc(100%-5rem)] mt-4 ml-4 pointer-events-none z-20 transition-opacity duration-300 rounded-2xl"
            style={gradientStyle}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-closed'} ${isMobile ? 'w-full' : 'w-64'}`}>
          <div className="p-4 flex flex-col h-full">
            <Button className="mb-6 bg-transparent text-foreground hover:bg-background-nav transition-all duration-300 transform hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> New Website
            </Button>
            <ScrollArea className="flex-1">
              <nav className="space-y-3">
                {agentViews.map((item, index) => (
                  <Button 
                    key={index}
                    variant="ghost" 
                    className={`w-full justify-start hover:bg-background-nav transition-all duration-300 group ${activeView === item.name ? 'bg-background-nav' : ''}`}
                    onClick={() => {
                      setActiveView(item.name);
                      if (isMobile) setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center w-full">
                      <div className="p-2 rounded-lg mr-3 group-hover:bg-background transition-colors duration-300">
                        <item.icon className="h-5 w-5 text-foreground group-hover:text-foreground-secondary transition-colors duration-300" />
                      </div>
                      <span className="text-foreground group-hover:text-foreground-secondary transition-colors duration-300 text-sm">{item.name}</span>
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
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col overflow-hidden bg-background text-foreground transition-all duration-300 ease-out-expo ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}`}>
          <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
            <TabsList className="justify-start px-4 py-2 border-b border-background-secondary overflow-x-auto">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              {agentViews.map((view, index) => (
                <TabsTrigger key={index} value={view.name}>{view.name}</TabsTrigger>
              ))}
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <div className="flex-1 flex justify-center items-center">
                <div className="w-full max-w-3xl px-4">
                  <ScrollArea className={`h-[calc(100vh-14rem)] mt-4 ${isFirstInteraction ? 'hidden' : ''}`}>
                    {messages.map((message: Message, index: number) => (
                      <div key={index} className={`chat-message ${message.role === 'ai' ? 'ai-message' : 'user-message'}`}>
                        <p className={`${message.role === 'ai' ? 'font-primary' : 'font-secondary'} text-base leading-golden max-w-readable`}>
                          {message.content}
                        </p>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="chat-message ai-message">
                        <p className="font-primary text-base leading-golden max-w-readable">{currentAiMessage}</p>
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
                        <Input
                          placeholder={isFirstInteraction ? "Message Eden" : "Reply to Eden..."}
                          className="w-full bg-background-secondary text-foreground rounded-full pl-4 pr-12 py-2 focus:ring-2 focus:ring-accent-orange focus:border-transparent placeholder-foreground-secondary"
                          value={inputMessage}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                        />
                        <Button
                          type="submit"
                          className={`absolute right-1 top-1/2 transform -translate-y-1/2 bg-accent-orange text-white hover:bg-[color-mix(in_srgb,var(--accent-orange)_85%,white)] transition-all duration-300 ${isSending ? 'animate-pulse' : ''} rounded-full w-8 h-8 flex items-center justify-center opacity-0 ${inputMessage.trim() !== '' ? 'opacity-100' : ''}`}
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
                <h2 className="text-2xl font-bold mb-4">{view.name}</h2>
                <ul className="space-y-2">
                  {view.content.map((item, i) => (
                    <li key={i} className="bg-background-secondary p-4 rounded-lg max-w-readable">{item}</li>
                  ))}
                </ul>
                <Button onClick={() => requestStrategyExplanation(view.name)} className="mt-4 bg-accent-purple hover:bg-[color-mix(in_srgb,var(--accent-purple)_85%,white)]">
                  Explain {view.name} Strategy
                </Button>
                {strategyExplanation && (
                  <div className="mt-4 bg-background-secondary p-4 rounded-lg max-w-readable">
                    <h3 className="text-xl font-bold mb-2">{view.name} Strategy Explanation:</h3>
                    <p className="leading-golden">{strategyExplanation}</p>
                  </div>
                )}
              </TabsContent>
            ))}
            <TabsContent value="progress" className="flex-1 p-4 overflow-auto">
              <h2 className="text-2xl font-bold mb-4">Progress Report</h2>
              <Button onClick={requestProgressReport} className="mb-4 bg-accent-orange hover:bg-[color-mix(in_srgb,var(--accent-orange)_85%,white)]">
                Get Progress Report
              </Button>
              {progressReport && (
                <div className="bg-background-secondary p-4 rounded-lg max-w-readable">
                  <pre className="whitespace-pre-wrap font-secondary text-sm leading-golden">{progressReport}</pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Real-time Preview Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 bg-background-secondary hover:bg-background-nav rounded-l-md"
          title="Toggle Preview"
        >
          <PanelRightOpen className="h-5 w-5" />
        </Button>

        {/* Real-time Preview Panel */}
        <aside className={`fixed inset-0 bg-background-secondary text-foreground transition-transform duration-300 ease-in-out ${previewOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
          <div className="h-14 border-b border-background-nav flex items-center justify-between px-4">
            <h2 className="text-xl font-semibold">Real-time Preview</h2>
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
            <LivePreview html={generatedHtml} mode={previewMode} />
          </div>
          <div className="p-2 text-sm text-foreground-secondary text-center">
            Note: This preview updates live as the AI generates the website code.
          </div>
        </aside>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="mobile-nav">
          <Button variant="ghost" onClick={() => setActiveView('chat')}>
            Chat
          </Button>
          <Button variant="ghost" onClick={toggleSidebar}>
            Menu
          </Button>
          <Button variant="ghost" onClick={togglePreview}>
            Preview
          </Button>
        </nav>
      )}
    </div>
  );
};

export default WebSplatInterface;
