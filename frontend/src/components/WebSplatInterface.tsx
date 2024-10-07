import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PanelLeftOpen, PanelRightOpen, Settings, Plus, Laptop, Smartphone, Monitor, Sliders } from 'lucide-react';

const WebSplatInterface: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your AI assistant. How can I help you build your website today?' },
    { role: 'user', content: 'I want to create a landing page for my new product.' },
    { role: 'ai', content: 'Great! Let\'s start by defining the main sections of your landing page. What\'s your product about?' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [autonomyLevel, setAutonomyLevel] = useState(50);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const togglePreview = () => setPreviewOpen(!previewOpen);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { role: 'user', content: inputMessage }]);
      setInputMessage('');
      // TODO: Send message to backend and handle AI response
  };
  
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="h-14 border-b flex items-center justify-between px-4">
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
        {sidebarOpen && (
          <aside className="w-64 border-r p-4 flex flex-col">
            <Button className="mb-4">
              <Plus className="mr-2 h-4 w-4" /> New Website
            </Button>
            <ScrollArea className="flex-1">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">UI Design</Button>
                <Button variant="ghost" className="w-full justify-start">Monetization</Button>
                <Button variant="ghost" className="w-full justify-start">SEO</Button>
                <Button variant="ghost" className="w-full justify-start">Analytics</Button>
                <Button variant="ghost" className="w-full justify-start">Deployment</Button>
              </nav>
            </ScrollArea>
            <div className="mt-4">
              <label htmlFor="autonomy-slider" className="block text-sm font-medium text-gray-700">
                AI Autonomy Level
              </label>
              <div className="flex items-center mt-2">
                <Sliders className="h-4 w-4 mr-2" />
                <input
                  type="range"
                  id="autonomy-slider"
                  min="0"
                  max="100"
                  value={autonomyLevel}
                  onChange={(e) => setAutonomyLevel(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="ml-2 text-sm text-gray-500">{autonomyLevel}%</span>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'ai' ? 'text-blue-600' : 'text-green-600'}`}>
                <strong>{message.role === 'ai' ? 'AI:' : 'You:'}</strong> {message.content}
              </div>
            ))}
          </ScrollArea>
          <div className="p-4 border-t">
            <form className="flex space-x-2" onSubmit={handleSendMessage}>
              <Input
                placeholder="Type your message here..."
                className="flex-1"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </main>

        {/* Preview Panel */}
        {previewOpen && (
          <aside className="w-96 border-l flex flex-col">
            <div className="h-14 border-b flex items-center justify-between px-4">
              <h2 className="font-semibold">Preview</h2>
              <Button variant="ghost" size="icon" onClick={togglePreview}>
                <PanelRightOpen className="h-5 w-5" />
              </Button>
            </div>
            <Tabs defaultValue="desktop" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start px-4 py-2 border-b">
                <TabsTrigger value="desktop"><Laptop className="mr-2 h-4 w-4" /> Desktop</TabsTrigger>
                <TabsTrigger value="tablet"><Smartphone className="mr-2 h-4 w-4" /> Tablet</TabsTrigger>
                <TabsTrigger value="mobile"><Monitor className="mr-2 h-4 w-4" /> Mobile</TabsTrigger>
              </TabsList>
              <TabsContent value="desktop" className="flex-1 p-4">
                <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                  Desktop Preview
                </div>
              </TabsContent>
              <TabsContent value="tablet" className="flex-1 p-4">
                <div className="w-3/4 h-full mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                  Tablet Preview
                </div>
              </TabsContent>
              <TabsContent value="mobile" className="flex-1 p-4">
                <div className="w-1/2 h-full mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                  Mobile Preview
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        )}
      </div>
    </div>
  );
};

export default WebSplatInterface;