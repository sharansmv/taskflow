import { useState } from "react";
import { TasksProvider } from "@/hooks/use-tasks";
import { GoalsProvider } from "@/hooks/use-goals";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskModal } from "@/components/tasks/task-modal";
import { TaskFilter } from "@/components/tasks/task-filter";
import { useTasks } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";

function TasksContent() {
  const { tasks, todoTasks, inProgressTasks, doneTasks, isLoading, updateTaskStatus } = useTasks();
  const { goals } = useGoals();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [activeTab, setActiveTab] = useState("all");
  
  const handleDragStart = (e: React.DragEvent, taskId: number, status: string) => {
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.setData("sourceStatus", status);
    e.currentTarget.classList.add("dragging");
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData("taskId"));
    const sourceStatus = e.dataTransfer.getData("sourceStatus");
    
    if (sourceStatus !== targetStatus) {
      await updateTaskStatus(taskId, targetStatus);
    }
  };
  
  // Filter tasks based on search term
  const filteredTasks = tasks?.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Filter for active tab
  const getDisplayedTasks = () => {
    if (!filteredTasks) return [];
    
    switch (activeTab) {
      case "todo":
        return filteredTasks.filter(task => task.status === "todo");
      case "in-progress":
        return filteredTasks.filter(task => task.status === "in-progress");
      case "done":
        return filteredTasks.filter(task => task.status === "done");
      default:
        return filteredTasks;
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Tasks" 
        onMenuClick={() => {}}  // This will be handled by parent component
        onNewTaskClick={() => setIsTaskModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text"
              placeholder="Search tasks..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setIsTaskModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <Button 
                variant={view === "kanban" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setView("kanban")}
                className="text-xs"
              >
                Kanban
              </Button>
              <Button 
                variant={view === "list" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setView("list")}
                className="text-xs"
              >
                List
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {view === "kanban" ? (
              <KanbanView 
                todoTasks={todoTasks || []}
                inProgressTasks={inProgressTasks || []}
                doneTasks={doneTasks || []}
                goals={goals || []}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isLoading={isLoading}
              />
            ) : (
              <ListView 
                tasks={getDisplayedTasks()}
                goals={goals || []}
                isLoading={isLoading}
              />
            )}
          </TabsContent>
          
          <TabsContent value="todo" className="mt-0">
            {view === "kanban" ? (
              <KanbanView 
                todoTasks={todoTasks || []}
                inProgressTasks={[]}
                doneTasks={[]}
                goals={goals || []}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isLoading={isLoading}
              />
            ) : (
              <ListView 
                tasks={getDisplayedTasks()}
                goals={goals || []}
                isLoading={isLoading}
              />
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-0">
            {view === "kanban" ? (
              <KanbanView 
                todoTasks={[]}
                inProgressTasks={inProgressTasks || []}
                doneTasks={[]}
                goals={goals || []}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isLoading={isLoading}
              />
            ) : (
              <ListView 
                tasks={getDisplayedTasks()}
                goals={goals || []}
                isLoading={isLoading}
              />
            )}
          </TabsContent>
          
          <TabsContent value="done" className="mt-0">
            {view === "kanban" ? (
              <KanbanView 
                todoTasks={[]}
                inProgressTasks={[]}
                doneTasks={doneTasks || []}
                goals={goals || []}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isLoading={isLoading}
              />
            ) : (
              <ListView 
                tasks={getDisplayedTasks()}
                goals={goals || []}
                isLoading={isLoading}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        goals={goals}
      />
      
      <TaskFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}

interface KanbanViewProps {
  todoTasks: Array<any>;
  inProgressTasks: Array<any>;
  doneTasks: Array<any>;
  goals: Array<any>;
  onDragStart: (e: React.DragEvent, taskId: number, status: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  isLoading: boolean;
}

function KanbanView({ 
  todoTasks, 
  inProgressTasks, 
  doneTasks,
  goals,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isLoading 
}: KanbanViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((column) => (
          <Card key={column}>
            <CardHeader className="p-4">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="p-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="mb-2 h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Find associated goal for each task
  const getGoalForTask = (goalId?: number) => {
    if (!goalId) return undefined;
    return goals.find(goal => goal.id === goalId);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">To Do</h3>
            <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-1.5 rounded-full">
              {todoTasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent 
          className="p-4 overflow-y-auto max-h-[600px]"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, "todo")}
        >
          {todoTasks.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
              No tasks to do
            </div>
          ) : (
            todoTasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task.id, "todo")}
                onDragEnd={onDragEnd}
                className="mb-2"
              >
                <TaskCard 
                  task={task} 
                  associatedGoal={getGoalForTask(task.goalId)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">In Progress</h3>
            <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-1.5 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent 
          className="p-4 overflow-y-auto max-h-[600px]"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, "in-progress")}
        >
          {inProgressTasks.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
              No tasks in progress
            </div>
          ) : (
            inProgressTasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task.id, "in-progress")}
                onDragEnd={onDragEnd}
                className="mb-2"
              >
                <TaskCard 
                  task={task} 
                  associatedGoal={getGoalForTask(task.goalId)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Done</h3>
            <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-1.5 rounded-full">
              {doneTasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent 
          className="p-4 overflow-y-auto max-h-[600px]"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, "done")}
        >
          {doneTasks.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-md">
              No completed tasks
            </div>
          ) : (
            doneTasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task.id, "done")}
                onDragEnd={onDragEnd}
                className="mb-2"
              >
                <TaskCard 
                  task={task} 
                  associatedGoal={getGoalForTask(task.goalId)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ListViewProps {
  tasks: Array<any>;
  goals: Array<any>;
  isLoading: boolean;
}

function ListView({ tasks, goals, isLoading }: ListViewProps) {
  // Find associated goal for each task
  const getGoalForTask = (goalId?: number) => {
    if (!goalId) return undefined;
    return goals.find(goal => goal.id === goalId);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="mb-2 h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4 divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <p>No tasks match your criteria</p>
            <Button 
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {}}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add a new task
            </Button>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="py-3 first:pt-0 last:pb-0">
              <TaskCard 
                task={task} 
                associatedGoal={getGoalForTask(task.goalId)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <TasksProvider>
      <GoalsProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <div className={`${sidebarCollapsed ? 'hidden' : 'block'} md:block`}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          </div>
          <TasksContent />
        </div>
      </GoalsProvider>
    </TasksProvider>
  );
}
