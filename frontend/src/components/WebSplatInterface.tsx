"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Settings, Plus, Laptop, Smartphone, Layout, DollarSign, Search, BarChart2, Cloud, Edit2, ArrowUp } from 'lucide-react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

type PreviewMode = 'desktop' | 'mobile';

interface ConsultationResponse {
  message: string;
  tsx_preview: string;
  shared_knowledge: Record<string, unknown>;
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

const LiveTsxPreview: React.FC<{ tsx: string; mode: PreviewMode }> = ({ tsx, mode }) => {
  return (
    <div className={`w-full h-full overflow-auto ${mode === 'mobile' ? 'max-w-[375px] mx-auto' : ''}`}>
      <div className={`border-2 border-[#444444] rounded-lg overflow-hidden ${mode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}>
        <LiveProvider code={tsx}>
          <LivePreview />
          <LiveError />
        </LiveProvider>
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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm Eden, your AI consultation agent. How can I help you create your website today?" }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [autonomyLevel, setAutonomyLevel] = useState<number>(50);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [projectName, setProjectName] = useState<string>('Untitled Project');
  const [isEditingProjectName, setIsEditingProjectName] = useState<boolean>(false);
  const [isHoveringProjectName, setIsHoveringProjectName] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [generatedTsx, setGeneratedTsx] = useState<string>('() => <div>Your website preview will appear here</div>');
  const [isFirstInteraction, setIsFirstInteraction] = useState<boolean>(true);
  const [sharedKnowledge, setSharedKnowledge] = useState<Record<string, unknown>>({});
  const [activeTab, setActiveTab] = useState<string>('chat');

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setIsSending(true);
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: inputMessage }]);
      
      try {
        const response = await axios.post<ConsultationResponse>('http://localhost:8000/consult', {
          message: inputMessage,
          autonomy_level: autonomyLevel
        });
        
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'ai', content: response.data.message }
        ]);
        
        if (response.data.tsx_preview) {
          setGeneratedTsx(response.data.tsx_preview);
        }

        setSharedKnowledge(response.data.shared_knowledge);
      } catch (error: unknown) {
        console.error('Error communicating with Consultation Agent:', error);
        toast.error('An error occurred while processing your request. Please try again.');
        setMessages(prevMessages => [...prevMessages, { role: 'ai', content: 'I apologize, but I encountered an error while processing your request. Could you please try again?' }]);
      } finally {
        setInputMessage('');
        setIsSending(false);
        if (isFirstInteraction) {
          setIsFirstInteraction(false);
        }
      }
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

  const handleAutonomyChange = async (newLevel: number) => {
    setAutonomyLevel(newLevel);
    try {
      await axios.post('http://localhost:8000/set_autonomy', { autonomy_level: newLevel });
      toast.success('Autonomy level updated successfully');
    } catch (error: unknown) {
      console.error('Error setting autonomy level:', error);
      toast.error('Failed to update autonomy level');
    }
  };

  const sidebarItems = [
    { name: 'UI Design', icon: Layout },
    { name: 'Monetization', icon: DollarSign },
    { name: 'SEO', icon: Search },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Deployment', icon: Cloud },
  ];
  
  return (
    <div className="h-screen flex flex-col bg-[#2C2B28] text-[#888888]">
      <Toaster position="top-right" />
      {/* Top Bar */}
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
        <div
          className="fixed top-14 left-0 w-64 h-[calc(100%-5rem)] mt-4 ml-4 pointer-events-none z-20 transition-opacity duration-300 rounded-2xl"
          style={gradientStyle}
        ></div>

        {/* Sidebar */}
        <aside className={`w-64 p-4 flex flex-col bg-[#2A2A2A] text-[#888888] fixed h-[calc(100%-5rem)] mt-4 ml-4 mb-6 rounded-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30`}>
          <Button className="mb-6 bg-transparent text-[#999999] hover:bg-[#3A3A3A] transition-all duration-300 transform hover:scale-105">
            <Plus className="mr-2 h-4 w-4" /> New Website
          </Button>
          <ScrollArea className="flex-1">
            <nav className="space-y-3">
              {sidebarItems.map((item, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  className="w-full justify-start hover:bg-[#3A3A3A] transition-all duration-300 group"
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
              onChange={handleAutonomyChange}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col overflow-hidden bg-[#2C2B28] text-[#999999] transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="justify-start px-4 py-2 border-b border-[#333333]">
              <TabsTrigger value="chat">Chat</TabsTrigger>
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
                    <form className="flex items-center space-x-2" onSubmit={handleSendMessage} role="form">
                      <div className="relative flex-1">
                        <Input
                          placeholder={isFirstInteraction ? "Message Eden" : "Reply to Eden..."}
                          className="w-full bg-[#31312E] text-[#E5E5E2] rounded-full pl-4 pr-12 py-2 focus:ring-2 focus:ring-[#444444] focus:border-transparent placeholder-[#A6A39A]"
                          value={inputMessage}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                          disabled={isSending}
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
            <TabsContent value="preview" className="flex-1 flex flex-col">
              <div className="flex-1 p-4 overflow-auto">
                <LiveTsxPreview tsx={generatedTsx} mode={previewMode} />
              </div>
              <div className="p-2 flex justify-center space-x-4">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Laptop className="h-4 w-4 mr-2" /> Desktop
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-2" /> Mobile
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Shared Knowledge Panel */}
        <aside className="fixed bottom-0 left-0 w-full bg-[#2A2A2A] text-[#888888] p-4 border-t border-[#333333]">
          <h3 className="font-semibold mb-2">Shared Knowledge</h3>
          <ScrollArea className="h-32">
            {Object.entries(sharedKnowledge).map(([key, value]) => (
              <div key={key} className="mb-2">
                <strong>{key}:</strong> {JSON.stringify(value)}
              </div>
            ))}
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
};

export default WebSplatInterface;