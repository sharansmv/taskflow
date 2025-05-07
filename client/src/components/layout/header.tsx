import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Menu, Focus, Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onNewTaskClick: () => void;
  onFocusModeClick?: () => void;
}

export function Header({ title, onMenuClick, onNewTaskClick, onFocusModeClick }: HeaderProps) {
  const [focusMode, setFocusMode] = useState(false);
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");
  
  const handleFocusClick = () => {
    setFocusMode(!focusMode);
    if (onFocusModeClick) {
      onFocusModeClick();
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
        <span className="ml-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">
          {formattedDate}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            "flex items-center text-sm",
            focusMode 
              ? "text-primary font-medium" 
              : "text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
          )}
          onClick={handleFocusClick}
        >
          <Focus className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Focus</span>
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          className="bg-primary-500 hover:bg-primary-600 text-white" 
          onClick={onNewTaskClick}
        >
          <Plus className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">New Task</span>
        </Button>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-2 h-2 p-0 rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
