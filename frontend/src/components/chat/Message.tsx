import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface Message {
  id: string;
  role: "system" | "user";
  content: string;
  timestamp?: string;
}

interface MessageBubbleProps {
  message: Message;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  onSave: (content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onEdit,
  onDelete,
  onCopy,
  onSave,
}) => {
  const formatMarkdownContent = (text: string): React.ReactNode => {
    const formattedText = text
      .replace(/##\s*(.*?)\n/g, "<h2>$1</h2>") // Headings (##)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold (**)
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italics (*)
      .replace(/\*\s+(.*?)\n/g, "<li>$1</li>") // Bullet points (* ...)
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>"); // Code blocks (```...```)

    const wrappedText = formattedText.replace(
      /(<li>.*<\/li>)/g,
      '<ul class="list-disc list-inside pl-4 mt-4">$1</ul>'
    );

    return <div dangerouslySetInnerHTML={{ __html: wrappedText }} />;
  };

  const renderStructuredContent = (content: string): React.ReactElement => {
    try {
      if (!content.trim().startsWith("{") && !content.trim().startsWith("[")) {
        return (
          <div className="text-sm whitespace-pre-wrap">
            {formatMarkdownContent(content)}
          </div>
        );
      }

      const parsedContent = JSON.parse(content);
      const { response, headings, bullet_points, code_blocks } = parsedContent;

      return (
        <div>
          <div className="text-sm whitespace-pre-wrap">
            {formatMarkdownContent(response)}
          </div>
          {headings?.length > 0 && (
            <div className="mt-4">
              {headings.map((heading: string, index: number) => (
                <h2 key={index} className="text-xl font-bold mt-4 mb-2">
                  {formatMarkdownContent(heading)}
                </h2>
              ))}
            </div>
          )}
          {bullet_points?.length > 0 && (
            <ul className="list-disc list-inside pl-4 mt-4">
              {bullet_points.map((point: string, index: number) => (
                <li key={index} className="text-sm whitespace-pre-wrap">
                  {formatMarkdownContent(point)}
                </li>
              ))}
            </ul>
          )}
          {code_blocks?.length > 0 && (
            <div className="mt-4">
              {code_blocks.map((code: string, index: number) => (
                <pre
                  key={index}
                  className="bg-gray-800 text-white p-4 rounded-lg my-3 overflow-x-auto"
                >
                  <code>{code}</code>
                </pre>
              ))}
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <div className="text-sm whitespace-pre-wrap">
          {formatMarkdownContent(content)}
        </div>
      );
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-4",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg p-2 max-w-[85%] sm:max-w-[75%]",
          message.role === "user"
            ? "bg-blue-100 text-right dark:bg-blue-800"
            : "bg-gray-100 text-left dark:bg-gray-800"
        )}
      >
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold">
            {message.role === "user" ? "You" : "AI"}
          </p>
          <p className="text-xs text-gray-500">{message.timestamp}</p>
        </div>
        {message.role === "system" ? (
          renderStructuredContent(message.content)
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        <div className="mt-2 flex justify-end space-x-2">
          {message.role === "user" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(message.id, message.content)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(message.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCopy(message.content)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {message.role === "system" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave(message.content)}
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
