import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PanelLeftOpen, PanelRightOpen, Settings, Plus, Laptop, Smartphone, Monitor } from 'lucide-react'

export default function Component() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your AI assistant. How can I help you build your website today?' },
    { role: 'user', content: 'I want to create a landing page for my new product.' },
    { role: 'ai', content: 'Let\'s start by defining the main sections of your landing page. Typically, a product landing page includes:' },
  ])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const togglePreview = () => setPreviewOpen(!previewOpen)

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold”>WebSplat - An Intelligent, No-Code, No Template, Automated Web Development Platform</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
             <Button variant="ghost" size="icon" onClick={togglePreview}>
            <PanelRightOpen className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
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
                <Button variant="ghost" className="w-full justify-start">Domain</Button>
                <Button variant="ghost" className="w-full justify-start">Design</Button>
                <Button variant="ghost" className="w-full justify-start">Demographics</Button>
                <Button variant="ghost" className="w-full justify-start">Database</Button>
                <Button variant="ghost" className="w-full justify-start">Data</Button>
                <Button variant="ghost" className="w-full justify-start">Deployment</Button>
              </nav>
            </ScrollArea>
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
            <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="Type your message here..." className="flex-1" />
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
  )
}