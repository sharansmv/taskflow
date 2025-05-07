import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { TaskCard } from "@/components/tasks/task-card";
import { Task } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskModal } from "@/components/tasks/task-modal";

interface KanbanTasksProps {
  isLoading?: boolean;
}

export function KanbanTasks({ isLoading = false }: KanbanTasksProps) {
  const { todoTasks, inProgressTasks, doneTasks, updateTask } = useTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    // Add a dragging class to the element
    e.currentTarget.classList.add("dragging");
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedTask(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== status) {
      await updateTask(draggedTask.id, { status });
    }
  };
  
  const getColumnCount = (status: string) => {
    switch (status) {
      case "todo":
        return todoTasks?.length || 0;
      case "in-progress":
        return inProgressTasks?.length || 0;
      case "done":
        return doneTasks?.length || 0;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tasks</h2>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
                <div className="h-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tasks</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Sort by Due Date</DropdownMenuItem>
              <DropdownMenuItem>Sort by Priority</DropdownMenuItem>
              <DropdownMenuItem>Archive Completed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-4 overflow-y-auto max-h-[500px]">
          {/* To Do Column */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
              <span>To Do</span>
              <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-0.5 px-1.5 rounded-full">
                {getColumnCount("todo")}
              </span>
            </h3>
            
            <div 
              className="space-y-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "todo")}
            >
              {todoTasks?.map((task) => (
                <div 
                  key={task.id}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                >
                  <TaskCard task={task} />
                </div>
              ))}
              
              {todoTasks?.length === 0 && (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                  No tasks yet. Add a task to get started.
                </div>
              )}
            </div>
          </div>
          
          {/* In Progress Column */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
              <span>In Progress</span>
              <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-0.5 px-1.5 rounded-full">
                {getColumnCount("in-progress")}
              </span>
            </h3>
            
            <div 
              className="space-y-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "in-progress")}
            >
              {inProgressTasks?.map((task) => (
                <div 
                  key={task.id}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                >
                  <TaskCard task={task} />
                </div>
              ))}
              
              {inProgressTasks?.length === 0 && (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                  Drag tasks here when you start working on them.
                </div>
              )}
            </div>
          </div>
          
          {/* Done Column */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
              <span>Done</span>
              <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-0.5 px-1.5 rounded-full">
                {getColumnCount("done")}
              </span>
            </h3>
            
            <div 
              className="space-y-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "done")}
            >
              {doneTasks?.map((task) => (
                <div 
                  key={task.id}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                >
                  <TaskCard task={task} />
                </div>
              ))}
              
              {doneTasks?.length === 0 && (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                  Completed tasks will appear here.
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsTaskModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Add Task</span>
          </Button>
        </CardFooter>
      </Card>
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </>
  );
}
