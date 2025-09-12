
"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { askDashboardAssistant, type DashboardAssistantInput } from '@/ai/flows/dashboard-assistant';
import { useToast } from '@/hooks/use-toast';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I help you understand this dashboard?", sender: "bot" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = newMessages.slice(0, -1).reduce((acc, msg, i) => {
        if (msg.sender === 'user' && newMessages[i + 1]?.sender === 'bot') {
          acc.push({ user: msg.text, assistant: newMessages[i + 1].text });
        }
        return acc;
      }, [] as { user: string; assistant: string }[]);
      
      const payload: DashboardAssistantInput = { query: input };
      if (history.length > 0) {
        payload.history = history;
      }

      const botResponse = await askDashboardAssistant(payload);
      const botMessage: Message = { text: botResponse.text, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI assistant failed:', error);
      toast({
        variant: "destructive",
        title: "Assistant Error",
        description: "The AI assistant is currently unavailable. Please try again later.",
      });
       const errorMessage: Message = { text: "Sorry, I'm having trouble connecting. Please try again later.", sender: "bot" };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dashboard Assistant</DialogTitle>
            <DialogDescription>Ask me anything about this dashboard.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-[60vh]">
            <ScrollArea className="flex-1 p-4" viewportRef={scrollViewportRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-2 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                    {message.sender === 'bot' && <Bot className="h-5 w-5 text-primary flex-shrink-0" />}
                    <div className={`rounded-lg p-3 text-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {message.text}
                    </div>
                    {message.sender === 'user' && <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                  </div>
                ))}
                {isLoading && (
                   <div className="flex items-start gap-2">
                        <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="rounded-lg p-3 text-sm bg-muted">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  autoComplete="off"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <CornerDownLeft className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
