import { useState } from "react";
import { GoalsProvider } from "@/hooks/use-goals";
import { TasksProvider } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import { GoalModal } from "@/components/goals/goal-modal";
import { GoalCard } from "@/components/goals/goal-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

function GoalsContent() {
  const { goals, longTermGoals, monthlyGoals, weeklyGoals, dailyGoals, isLoading } = useGoals();
  const { tasks } = useTasks();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Filter goals based on search and category
  const filterGoals = (goalList: any[]) => {
    if (!goalList) return [];
    
    return goalList.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (goal.description && goal.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || goal.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };
  
  // Get tasks associated with a goal
  const getTasksForGoal = (goalId: number) => {
    return tasks?.filter(task => task.goalId === goalId) || [];
  };
  
  // Calculate completion percentage based on associated tasks
  const calculateCompletion = (goalId: number) => {
    const goalTasks = getTasksForGoal(goalId);
    if (goalTasks.length === 0) return 0;
    
    const completedTasks = goalTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goalTasks.length) * 100);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Goals" 
        onMenuClick={() => {}}  // This will be handled by parent component
        onNewTaskClick={() => setIsGoalModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text"
              placeholder="Search goals..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="default" 
              size="default"
              onClick={() => setIsGoalModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Goal
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="long-term">Long-term</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <GoalsLoading />
            ) : (
              <>
                {filterGoals(goals || []).length === 0 ? (
                  <EmptyGoals onAddClick={() => setIsGoalModalOpen(true)} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterGoals(goals || []).map(goal => (
                      <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        tasks={getTasksForGoal(goal.id)}
                        completion={calculateCompletion(goal.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="long-term">
            {isLoading ? (
              <GoalsLoading />
            ) : (
              <>
                {filterGoals(longTermGoals || []).length === 0 ? (
                  <EmptyGoals onAddClick={() => setIsGoalModalOpen(true)} timeframe="long-term" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterGoals(longTermGoals || []).map(goal => (
                      <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        tasks={getTasksForGoal(goal.id)}
                        completion={calculateCompletion(goal.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="monthly">
            {isLoading ? (
              <GoalsLoading />
            ) : (
              <>
                {filterGoals(monthlyGoals || []).length === 0 ? (
                  <EmptyGoals onAddClick={() => setIsGoalModalOpen(true)} timeframe="monthly" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterGoals(monthlyGoals || []).map(goal => (
                      <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        tasks={getTasksForGoal(goal.id)}
                        completion={calculateCompletion(goal.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="weekly">
            {isLoading ? (
              <GoalsLoading />
            ) : (
              <>
                {filterGoals(weeklyGoals || []).length === 0 ? (
                  <EmptyGoals onAddClick={() => setIsGoalModalOpen(true)} timeframe="weekly" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterGoals(weeklyGoals || []).map(goal => (
                      <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        tasks={getTasksForGoal(goal.id)}
                        completion={calculateCompletion(goal.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="daily">
            {isLoading ? (
              <GoalsLoading />
            ) : (
              <>
                {filterGoals(dailyGoals || []).length === 0 ? (
                  <EmptyGoals onAddClick={() => setIsGoalModalOpen(true)} timeframe="daily" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterGoals(dailyGoals || []).map(goal => (
                      <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        tasks={getTasksForGoal(goal.id)}
                        completion={calculateCompletion(goal.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <GoalModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goals={goals} // For parent goal selection
      />
    </div>
  );
}

function GoalsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Card key={item}>
          <CardContent className="p-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyGoals({ onAddClick, timeframe }: { onAddClick: () => void, timeframe?: string }) {
  const getTitle = () => {
    if (!timeframe) return "No goals found";
    return `No ${timeframe} goals found`;
  };
  
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{getTitle()}</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
          Goals help you organize your tasks and track your progress.
        </p>
        <Button variant="default" onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-1" />
          Create your first {timeframe} goal
        </Button>
      </CardContent>
    </Card>
  );
}

export default function GoalsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <GoalsProvider>
      <TasksProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <div className={`${sidebarCollapsed ? 'hidden' : 'block'} md:block`}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          </div>
          <GoalsContent />
        </div>
      </TasksProvider>
    </GoalsProvider>
  );
}
