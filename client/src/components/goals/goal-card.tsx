import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal, Task } from "@shared/schema";
import { GoalModal } from "@/components/goals/goal-modal";
import { TaskModal } from "@/components/tasks/task-modal";
import { useGoals } from "@/hooks/use-goals";
import { MoreHorizontal, Plus, Trash, Edit, CheckCircle2, Clock, BarChart3 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, isAfter, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: Goal;
  tasks: Task[];
  completion: number;
}

export function GoalCard({ goal, tasks, completion }: GoalCardProps) {
  const { updateGoal, deleteGoal, updateGoalProgress } = useGoals();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Get category badge color
  const getCategoryColor = (category: string) => {
    const categories = {
      work: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      personal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      health: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      learning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      finance: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
    };
    
    return categories[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };
  
  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    const priorities = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      low: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    };
    
    return priorities[priority] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };
  
  // Format deadline to human-readable text
  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    if (isAfter(today, deadlineDate)) {
      return "Overdue";
    }
    
    return `Due ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`;
  };
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      await deleteGoal(goal.id);
    }
  };
  
  const handleCompletionUpdate = async () => {
    // Update goal progress with the calculated completion percentage
    await updateGoalProgress(goal.id, completion);
  };
  
  // Calculate task statistics
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const taskStats = totalTasks > 0 
    ? `${completedTasks}/${totalTasks} tasks`
    : "No tasks";

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <Badge variant="outline" className={cn("px-2 py-0.5 text-xs font-normal", getCategoryColor(goal.category))}>
                  {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                </Badge>
                {goal.priority !== "medium" && (
                  <Badge variant="outline" className={cn("ml-1 px-2 py-0.5 text-xs font-normal", getPriorityColor(goal.priority))}>
                    {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsTaskModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCompletionUpdate}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Update Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <h3 className="text-base font-medium mb-1 text-gray-800 dark:text-white">{goal.title}</h3>
            
            {goal.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{goal.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{goal.timeframe}</span>
              </div>
              <span>{taskStats}</span>
            </div>
            
            <Progress value={goal.progress} className="h-1.5 mb-2" />
            
            {goal.deadline && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formatDeadline(goal.deadline)}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => setIsTaskModalOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Task
          </Button>
          
          <Button 
            variant={goal.completed ? "default" : "outline"} 
            size="sm" 
            className="text-xs"
            onClick={() => updateGoal(goal.id, { completed: !goal.completed })}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {goal.completed ? "Completed" : "Mark Complete"}
          </Button>
        </CardFooter>
      </Card>
      
      <GoalModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        existingGoal={goal}
      />
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        goals={[goal]}
      />
    </>
  );
}
