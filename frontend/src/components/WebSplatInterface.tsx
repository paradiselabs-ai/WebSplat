"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PanelRightOpen, Settings, Plus, Laptop, Smartphone, Layout, DollarSign, Search, BarChart2, Cloud, FilePlus, PieChart, Edit2, ArrowUp } from 'lucide-react';
import mockAiResponse from './mockAiResponse';



interface Message {
  role: 'ai' | 'user';
  content: string;
}

type PreviewMode = 'desktop' | 'mobile';

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

const WebSplatInterface: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I\'m your AI assistant. How can I help you build your website today?' },
    { role: 'user', content: 'I want to create a landing page for my new product.' },
    { role: 'ai', content: 'Great! Let\'s start by defining the main sections of your landing page. What\'s your product about?' },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [autonomyLevel, setAutonomyLevel] = useState<number>(50);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [projectName, setProjectName] = useState<string>('Untitled Project');
  const [isEditingProjectName, setIsEditingProjectName] = useState<boolean>(false);
  const [isHoveringProjectName, setIsHoveringProjectName] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const togglePreview = () => setPreviewOpen(!previewOpen);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentAiMessage, setCurrentAiMessage] = useState<string>('');
  const [responseIndex, setResponseIndex] = useState<number>(0);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setIsSending(true);
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: inputMessage }]);
      setInputMessage('');

      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSending(false);
      setIsTyping(true);

      let fullResponse = '';
      let response = await mockAiResponse(responseIndex);

      while (response !== null) {
        if (response.word) {
          fullResponse += response.word + ' ';
          setCurrentAiMessage(fullResponse.trim());
          
          // Force a re-render to show the updated message
          setMessages(prevMessages => [...prevMessages]);
        }

        // Wait for a short time to simulate typing speed
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (response.isComplete) {
          break;
        }
        
        response = await mockAiResponse(responseIndex);
      }

      if (response && response.isComplete) {
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'ai', content: fullResponse.trim() }
        ]);
        
        if (response.code) {
          console.log('Generated Code:', response.code);
          // TODO: Update your UI or state to display or use the generated code
        }
      }

      setIsTyping(false);
      setCurrentAiMessage('');
      setResponseIndex(prevIndex => prevIndex + 1);
    }
  };

  // Automatically trigger the next response when the AI finishes typing
  useEffect(() => {
    if (!isTyping && responseIndex > 0) {
      handleSendMessage({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    }
  }, [isTyping, responseIndex]);

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
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
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

  const sidebarItems = [
    { name: 'UI Design', icon: Layout },
    { name: 'Monetization', icon: DollarSign },
    { name: 'SEO', icon: Search },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Deployment', icon: Cloud },
  ];
  
  return (
    <div className="h-screen flex flex-col bg-[#2C2B28] text-[#888888]">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 z-10 bg-gradient-to-b from-[#2A2A2A] to-[#2C2B28]">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-[#888888]">WebSplat</span>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {isEditingProjectName ? (
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
              onChange={setAutonomyLevel}
            />
          </div>
        </aside>

        {/* Main Content */}
      <main className={`flex-1 flex flex-col overflow-hidden bg-[#2C2B28] text-[#999999] transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex-1 flex justify-center">
          <div className="w-3/5 max-w-3xl">
            <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
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
            <div className="mt-4 relative">
              <form className="flex items-center space-x-2" onSubmit={handleSendMessage}>
                <div className="relative flex-1">
                  <Input
                    placeholder="Describe your website idea or ask for assistance"
                    className="w-full bg-[#31312E] text-[#E5E5E2] rounded-full pl-4 pr-12 py-2 focus:ring-2 focus:ring-[#A3512B] focus:border-transparent placeholder-[#A6A39A]"
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
      </main>

        {/* Real-time Preview Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-l-md"
          title="Toggle Preview"
        >
          <PanelRightOpen className="h-5 w-5" />
        </Button>

        {/* Real-time Preview Panel */}
        <aside className={`w-96 flex flex-col bg-[#2A2A2A] text-[#888888] fixed right-0 top-14 bottom-4 rounded-l-2xl transition-transform duration-300 ease-in-out ${previewOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-14 border-b border-[#333333] flex items-center justify-between px-4 rounded-tl-2xl">
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
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div
              className={`border-2 border-dashed border-[#333333] rounded-lg flex items-center justify-center ${
                previewMode === 'desktop' ? 'w-full h-full' : 'w-1/2 h-3/4 mx-auto'
              }`}
            >
              Your Design Here
            </div>
          </div>
          <div className="p-2 text-sm text-[#777777] text-center rounded-bl-2xl">
            Note: In a real implementation, this preview would update live as changes are made to the website design.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WebSplatInterface;