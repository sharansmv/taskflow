import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Task, Goal } from "@shared/schema";
import { Clock, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";

interface TaskCardProps {
  task: Task;
  associatedGoal?: Goal;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export function TaskCard({ task, associatedGoal, onDragStart }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks();
  const [isChecked, setIsChecked] = useState(task.completed);
  
  const handleCheckChange = async (checked: boolean) => {
    setIsChecked(checked);
    await updateTask(task.id, { 
      completed: checked,
      status: checked ? "done" : task.status
    });
  };
  
  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  // Get category color class
  const getCategoryColorClass = (category: string) => {
    const categories = {
      work: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      personal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      health: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      learning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    };
    
    return categories[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };
  
  // Format duration to human-readable
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    
    return `${minutes}m`;
  };

  return (
    <div 
      className="task-card bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 mb-2 cursor-move shadow-sm"
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <div className="mt-0.5">
            <Checkbox 
              checked={isChecked} 
              onCheckedChange={handleCheckChange} 
              className="h-4 w-4 text-primary-500"
            />
          </div>
          <div>
            <h4 className={cn(
              "text-sm font-medium",
              task.completed ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-800 dark:text-white"
            )}>
              {task.title}
            </h4>
            <div className="flex items-center mt-1 space-x-2">
              {task.estimatedDuration && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDuration(task.estimatedDuration)}
                </span>
              )}
              
              {task.category && (
                <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5 rounded font-normal", getCategoryColorClass(task.category))}>
                  {task.category}
                </Badge>
              )}
              
              {task.priority === "high" && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-normal">
                  Priority
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => updateTask(task.id, { priority: task.priority === "high" ? "medium" : "high" })}>
              {task.priority === "high" ? "Remove priority" : "Mark as priority"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
