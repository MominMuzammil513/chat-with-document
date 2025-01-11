import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from "lucide-react";
import { useRef } from "react";

interface ChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  uploading: boolean;
  selectedFile: File | null;
  isLoading: boolean;
}

export const ChatInput = ({
  input,
  onInputChange,
  onFileUpload,
  onSubmit,
  isEditing,
  uploading,
  selectedFile,
  isLoading,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col space-y-4">
      <Input
        id="file-upload"
        type="file"
        accept=".pdf"
        onChange={onFileUpload}
        disabled={uploading}
        className="hidden"
        ref={inputRef}
      />
      <div className="flex flex-col space-y-4">
        <Textarea
          id="chat-input"
          placeholder="Enter your message..."
          value={input}
          onChange={onInputChange}
          disabled={!selectedFile || isLoading}
          className="resize-none min-h-[80px]"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            disabled={!selectedFile || !input || isLoading}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6"
          >
            <Send className="h-4 w-4 mr-2" />
            {isEditing ? "Update" : "Send"}
          </Button>
        </div>
      </div>
    </form>
  );
};
