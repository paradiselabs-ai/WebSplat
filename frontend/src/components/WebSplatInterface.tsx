"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PanelLeftOpen, PanelRightOpen, Settings, Plus, Laptop, Smartphone, Layout, DollarSign, Search, BarChart2, Cloud, FilePlus, PieChart } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

type PreviewMode = 'desktop' | 'mobile';

const WebSplatInterface: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I\'m your AI assistant. How can I help you build your website today?' },
    { role: 'user', content: 'I want to create a landing page for my new product.' },
    { role: 'ai', content: 'Great! Let\'s start by defining the main sections of your landing page. What\'s your product about?' },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [autonomyLevel, setAutonomyLevel] = useState<number>(50);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const togglePreview = () => setPreviewOpen(!previewOpen);

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { role: 'user', content: inputMessage }]);
      setInputMessage('');
      // TODO: Send message to backend and handle AI response
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-[#1C1C1C] text-[#888888]">
      {/* Top Bar */}
      <header className="h-14 border-b border-[#333333] flex items-center justify-between px-4 z-10">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">WebSplat - AI-Powered Web Development</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePreview}>
            <PanelRightOpen className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-64 border-r border-[#333333] p-4 flex flex-col bg-[#2A2A2A] text-[#888888] fixed h-full transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Button className="mb-4 bg-[#3A3A3A] text-[#999999] hover:bg-[#4A4A4A]">
            <Plus className="mr-2 h-4 w-4" /> New Website
          </Button>
          <ScrollArea className="flex-1">
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start hover:bg-[#3A3A3A]">
                <Layout className="mr-2 h-4 w-4 text-[#888888]" />
                UI Design
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-[#3A3A3A]">
                <DollarSign className="mr-2 h-4 w-4 text-[#888888]" />
                Monetization
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-[#3A3A3A]">
                <Search className="mr-2 h-4 w-4 text-[#888888]" />
                SEO
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-[#3A3A3A]">
                <BarChart2 className="mr-2 h-4 w-4 text-[#888888]" />
                Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-[#3A3A3A]">
                <Cloud className="mr-2 h-4 w-4 text-[#888888]" />
                Deployment
              </Button>
            </nav>
          </ScrollArea>
          <div className="mt-4">
            <label htmlFor="autonomy-slider" className="block text-sm font-medium">
              AI Autonomy Level: {autonomyLevel}%
            </label>
            <div className="flex items-center mt-2">
              <input
                type="range"
                id="autonomy-slider"
                min="0"
                max="100"
                value={autonomyLevel}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAutonomyLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col overflow-hidden bg-[#3A3A3A] text-[#999999] border-2 border-[#333333] transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <ScrollArea className="flex-1 p-4">
            {messages.map((message: Message, index: number) => (
              <div key={index} className={`mb-4 ${message.role === 'ai' ? 'bg-[#4A4A4A] text-[#BBBBBB] p-2 rounded' : 'bg-[#2A2A2A] text-[#999999] p-2 rounded'}`}>
                <strong>{message.role === 'ai' ? 'AI:' : 'You:'}</strong> {message.content}
              </div>
            ))}
          </ScrollArea>
          <div className="p-4 border-t border-[#333333]">
            <form className="flex space-x-2" onSubmit={handleSendMessage}>
              <Input
                placeholder="Describe your website idea or ask for assistance"
                className="flex-1 bg-[#2A2A2A] text-[#999999]"
                value={inputMessage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              />
              <Button type="submit" className="bg-[#3A3A3A] text-[#999999] hover:bg-[#4A4A4A]">Send</Button>
            </form>
            <div className="flex mt-2 space-x-2">
              <Button className="bg-[#3A3A3A] text-[#999999] hover:bg-[#4A4A4A]">
                <FilePlus className="mr-2 h-4 w-4" />
                New Page
              </Button>
              <Button className="bg-[#3A3A3A] text-[#999999] hover:bg-[#4A4A4A]">
                <Search className="mr-2 h-4 w-4" />
                Add SEO
              </Button>
              <Button className="bg-[#3A3A3A] text-[#999999] hover:bg-[#4A4A4A]">
                <PieChart className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </main>

        {/* Real-time Preview Panel */}
        {previewOpen && (
          <aside className="w-96 border-l border-[#333333] flex flex-col bg-[#2A2A2A] text-[#888888]">
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
            <div className="p-2 text-sm text-[#777777] text-center">
              Note: In a real implementation, this preview would update live as changes are made to the website design.
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default WebSplatInterface;