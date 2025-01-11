import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./Message";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";

const localUrl = "http://localhost:5000";

export interface Message {
  id: string;
  role: "system" | "user";
  content: string;
  timestamp?: string;
}

export default function Chat() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "Hello! How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { toast } = useToast();
  const chatContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${localUrl}/api/upload-and-chat`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
      setSelectedFile(file);
      toast({ title: "Success", description: "PDF uploaded successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: (messages.length + 1).toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${localUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile?.name,
          message: input,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI response: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      let result = "";
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const parsedChunk = JSON.parse(chunk);

        if (parsedChunk.error) {
          throw new Error(parsedChunk.error);
        }

        result += parsedChunk.chunk;

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "system") {
            return [
              ...prev.slice(0, -1),
              {
                id: lastMessage.id,
                role: "system",
                content: result,
                timestamp: new Date().toLocaleTimeString(),
              },
            ];
          }
          return [
            ...prev,
            {
              id: (prev.length + 1).toString(),
              role: "system",
              content: result,
              timestamp: new Date().toLocaleTimeString(),
            },
          ];
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to get AI response: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Text copied to clipboard" });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to copy text: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleSaveMessage = (content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai_response.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Saved", description: "AI response saved successfully" });
  };

  const handleEditMessage = (id: string, content: string) => {
    setIsEditing(id);
    setInput(content);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    toast({ title: "Deleted", description: "Message deleted successfully" });
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: "1",
        role: "system",
        content: "Hello! How can I assist you today?",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setSelectedFile(null);
    setInput("");
    setIsEditing(null);
    toast({ title: "New Chat", description: "Started a new conversation" });
  };

  return (
    <Card className="relative shadow-lg sm:rounded-3xl overflow-hidden h-full flex flex-col dark:bg-gray-900 text-white bg-white">
      <ChatHeader
        onNewChat={handleNewChat}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />
      <CardContent
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        ref={chatContentRef}
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onCopy={copyToClipboard}
            onSave={handleSaveMessage}
          />
        ))}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
      </CardContent>
      <CardFooter className="sticky bottom-0 z-10 p-4 sm:p-6 border-t">
        <ChatInput
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onFileUpload={handleFileUpload}
          onSubmit={handleSubmit}
          isEditing={!!isEditing}
          uploading={uploading}
          selectedFile={selectedFile}
          isLoading={isLoading}
        />
      </CardFooter>
    </Card>
  );
}
