import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeSwitcher } from "@/Providers/ThemeSwitcher";

interface ChatHeaderProps {
  onNewChat: () => void;
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
}

export const ChatHeader = ({
  onNewChat,
  selectedLanguage,
  onLanguageChange,
}: ChatHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 py-4 px-6 sm:px-8 border-b">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Chat With{" "}
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Document
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Button onClick={onNewChat} size="icon" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
          <div className="w-full sm:w-40">
            <Select value={selectedLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
