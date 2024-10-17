"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PanelRightOpen, Settings, Plus, Laptop, Smartphone, Layout, DollarSign, Search, BarChart2, Cloud, Edit2, ArrowUp, Sliders } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'ai' | 'user';
  content: string;
  agent?: string;
}

type PreviewMode = 'desktop' | 'mobile';

interface AgentView {
  name: string;
  icon: React.ElementType;
  content: string[];
}

interface WebSocketMessage {
  type: 'preview_update' | 'agent_update' | 'progress_update' | 'chat_message' | 'knowledge_update_UI Design' | 'knowledge_update_Monetization' | 'knowledge_update_SEO' | 'knowledge_update_Analytics' | 'knowledge_update_Deployment';
  content?: string | number | string[];
  agent?: string;
  progress?: number;
  role?: 'ai' | 'user';
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
        className="w-full h-2 bg-orange-200 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #FFA500 0%, #FFA500 ${value}%, #E5E5E5 ${value}%, #E5E5E5 100%)`,
        }}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-12 text-center bg-transparent border border-gray-300 rounded"
      />
    </div>
  );
};

const LivePreview: React.FC<{ workspaceId: string | null; mode: PreviewMode; generatedHtml: string }> = ({ workspaceId, mode, generatedHtml }) => {
  if (!workspaceId) {
    return <div>No preview available</div>;
  }

  const content = generatedHtml || `http://localhost:8000/serve/${workspaceId}/index.html`;

  return (
    <div className={`w-full h-full overflow-auto ${mode === 'mobile' ? 'max-w-[375px] mx-auto' : ''}`}>
      <div className={`border-2 border-[#444444] rounded-lg overflow-hidden ${mode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}>
        {generatedHtml ? (
          <iframe
            srcDoc={content}
            title="Live Preview"
            className="w-full h-full border-0"
            style={{ transform: mode === 'mobile' ? 'scale(0.75)' : 'none', transformOrigin: 'top left' }}
          />
        ) : (
          <iframe
            src={content}
            title="Live Preview"
            className="w-full h-full border-0"
            style={{ transform: mode === 'mobile' ? 'scale(0.75)' : 'none', transformOrigin: 'top left' }}
          />
        )}
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

  return <p className="text-[#AAAAAA] text-lg">{displayText}</p>;
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
  const [isAutonomySliderVisible, setIsAutonomySliderVisible] = useState<boolean>(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [overallProgress, setOverallProgress] = useState<number>(0);

  const togglePreview = () => setPreviewOpen(!previewOpen);
  const toggleAutonomySlider = () => setIsAutonomySliderVisible(!isAutonomySliderVisible);

  useEffect(() => {
    if (workspaceId) {
      const newSocket = new WebSocket(`ws://localhost:8000/ws/${workspaceId}`);
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data) as WebSocketMessage;
        handleWebSocketMessage(data);
      };

      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      setSocket(newSocket);

      return () => {
        if (socket) {
          socket.close();
        }
        newSocket.close();
      };
    }
  }, [workspaceId, socket]);

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'preview_update':
        if (typeof data.content === 'string') {
          setGeneratedHtml(data.content);
        }
        break;
      case 'progress_update':
        if (typeof data.content === 'number') {
          setOverallProgress(data.content);
        }
        break;
      case 'knowledge_update_UI Design':
      case 'knowledge_update_Monetization':
      case 'knowledge_update_SEO':
      case 'knowledge_update_Analytics':
      case 'knowledge_update_Deployment':
        const agentType = data.type.split('_')[2];
        if (Array.isArray(data.content)) {
          updateAgentView(agentType, data.content);
        }
        break;
      case 'chat_message':
        if (data.role && typeof data.content === 'string') {
          addMessage(data.role, data.content, data.agent);
        }
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const updateAgentView = (agentName: string, content: string[]) => {
    setAgentViews(prevViews => 
      prevViews.map(view => 
        view.name === agentName 
          ? { ...view, content: content } 
          : view
      )
    );
  };

  const addMessage = (role: 'ai' | 'user', content: string, agent?: string) => {
    setMessages(prevMessages => [...prevMessages, { role, content, agent }]);
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setIsSending(true);
      addMessage('user', inputMessage);
      setInputMessage('');
      if (isFirstInteraction) {
        setIsFirstInteraction(false);
      }

      try {
        const response = await axios.post('http://localhost:8000/consult', {
          message: inputMessage,
          autonomy_level: autonomyLevel
        });

        const aiResponse = response.data.message;
        addMessage('ai', aiResponse);

        if (response.data.tsx_preview) {
          setGeneratedHtml(response.data.tsx_preview);
        }

        if (response.data.workspace_id) {
          setWorkspaceId(response.data.workspace_id);
        }

        // Update agent views
        Object.entries(response.data.shared_knowledge).forEach(([key, value]) => {
          updateAgentView(key, value as string[]);
        });

        setIsTyping(false);
        setCurrentAiMessage('');
      } catch (error) {
        console.error('Error communicating with backend:', error);
        addMessage('ai', 'I apologize, but I encountered an error while processing your request. Could you please try again?');
      } finally {
        setIsSending(false);
      }
    }
  };

  const fetchPreview = async () => {
    if (workspaceId) {
      try {
        const response = await axios.get(`http://localhost:8000/serve/${workspaceId}/index.html`);
        setGeneratedHtml(response.data);
      } catch (error) {
        console.error('Error fetching preview:', error);
        setGeneratedHtml('Error fetching preview. Please try again.');
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
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const tolerance = 50; // Reduced tolerance for triggering

    if ((cursorPosition.x <= tolerance && cursorPosition.y >= windowHeight / 2 - tolerance && cursorPosition.y <= windowHeight / 2 + tolerance) || 
        (cursorPosition.x <= tolerance && cursorPosition.y >= windowHeight - tolerance)) {
      setSidebarOpen(true);
    } else if (cursorPosition.x > 300 && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [cursorPosition, sidebarOpen]);

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
    <div className="h-screen flex flex-col bg-[#2C2B28] text-[#888888]">
      <header className="h-14 flex items-center justify-between px-4 z-10 bg-gradient-to-b from-[#2A2A2A] to-[#2C2B28]">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-[#888888]">WebSplat</span>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {!isFirstInteraction && (
            isEditingProjectName ? (
              <Input
                value={projectName}
                onChange={handleProjectNameChange}
                onBlur={handleProjectNameBlur}
                className="max-w-xs text-center bg-transparent border-none text-[#888888] focus:ring-0"
                autoFocus
              />
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setIsHoveringProjectName(true)}
                onMouseLeave={() => setIsHoveringProjectName(false)}
              >
                <h1
                  className={`text-xl font-bold text-[#888888] cursor-pointer hover:text-[#AAAAAA] transition-colors duration-300 ${projectName === 'Untitled Project' ? 'animate-pulse' : ''}`}
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
          <Button variant="ghost" size="icon" className="group" onClick={toggleAutonomySlider}>
            <Sliders className="h-5 w-5" />
          </Button>
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
        <div
          className="fixed top-14 left-0 w-64 h-[calc(100%-5rem)] mt-4 ml-4 pointer-events-none z-20 transition-opacity duration-300 rounded-2xl"
          style={gradientStyle}
        ></div>

        <aside className={`w-64 p-4 flex flex-col bg-[#2A2A2A] text-[#888888] fixed h-[calc(100%-5rem)] mt-4 ml-4 mb-6 rounded-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30`}>
          <Button className="mb-6 bg-transparent text-[#999999] hover:bg-[#3A3A3A] transition-all duration-300 transform hover:scale-105">
            <Plus className="mr-2 h-4 w-4" /> New Website
          </Button>
          <ScrollArea className="flex-1">
            <nav className="space-y-3">
              {agentViews.map((item, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-[#3A3A3A] transition-all duration-300 group ${activeView === item.name ? 'bg-[#3A3A3A]' : ''}`}
                  onClick={() => setActiveView(item.name)}
                >
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg mr-3 group-hover:bg-[#4A4A4A] transition-colors duration-300">
                      <item.icon className="h-5 w-5 text-[#888888] group-hover:text-[#AAAAAA] transition-colors duration-300" />
                    </div>
                    <span className="text-[#888888] group-hover:text-[#AAAAAA] transition-colors duration-300 text-sm">{item.name}</span>
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
        </aside>

        <main className={`flex-1 flex flex-col overflow-hidden bg-[#2C2B28] text-[#999999] transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
            <TabsList className="justify-start px-4 py-2 border-b border-[#333333]">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              {agentViews.map((view, index) => (
                <TabsTrigger key={index} value={view.name}>{view.name}</TabsTrigger>
              ))}
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
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
                        <Input
                          placeholder={isFirstInteraction ? "Message Eden" : "Reply to Eden..."}
                          className="w-full bg-[#31312E] text-[#E5E5E2] rounded-full pl-4 pr-12 py-2 focus:ring-2 focus:ring-[#444444] focus:border-transparent placeholder-[#A6A39A]"
                          value={inputMessage}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
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
                  {view.content.map((item, i) => (
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
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
                <div className="w-full bg-[#31312E] rounded-full h-4">
                  <div
                    className="bg-[#A3512B] h-4 rounded-full"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-right">{overallProgress}%</p>
              </div>
              <Button onClick={requestProgressReport} className="mb-4">
                Get Detailed Progress Report
              </Button>
              {progressReport && (
                <div className="bg-[#31312E] p-3 rounded">
                  <pre className="whitespace-pre-wrap">{progressReport}</pre>
                </div>
              )}
            </TabsContent>
            <TabsContent value="preview" className="flex-1 p-4 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Live Preview</h2>
              <Button onClick={fetchPreview} className="mb-4">
                Refresh Preview
              </Button>
              <LivePreview workspaceId={workspaceId} mode={previewMode} generatedHtml={generatedHtml} />
            </TabsContent>
          </Tabs>
        </main>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-l-md"
          title="Toggle Preview"
        >
          <PanelRightOpen className="h-5 w-5" />
        </Button>

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
            <LivePreview workspaceId={workspaceId} mode={previewMode} generatedHtml={generatedHtml} />
          </div>
          <div className="p-2 text-sm text-[#777777] text-center">
            Note: This preview updates live as the AI generates the website code.
          </div>
        </aside>

        {isAutonomySliderVisible && (
          <div className="fixed top-14 right-4 bg-[#2A2A2A] p-4 rounded-lg shadow-lg z-50">
            <h3 className="text-lg font-semibold mb-2">AI Autonomy Level</h3>
            <MinimalAutonomyControl
              value={autonomyLevel}
              onChange={setAutonomyLevel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSplatInterface;
