import { useState } from "react";
import { GoalsProvider } from "@/hooks/use-goals";
import { TasksProvider } from "@/hooks/use-tasks";
import { CalendarProvider } from "@/hooks/use-calendar";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { GoalSummary } from "@/components/dashboard/goal-summary";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { KanbanTasks } from "@/components/dashboard/kanban-tasks";
import { TaskModal } from "@/components/tasks/task-modal";
import { useGoals } from "@/hooks/use-goals";

function Dashboard() {
  const { weeklyGoals, isLoading: goalsLoading } = useGoals();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Today's Plan" 
        onMenuClick={toggleSidebar}
        onNewTaskClick={() => setIsTaskModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
        <GoalSummary goals={weeklyGoals || []} isLoading={goalsLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <CalendarView />
          </section>
          
          <section>
            <KanbanTasks />
          </section>
        </div>
      </main>
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        goals={weeklyGoals}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <CalendarProvider>
      <GoalsProvider>
        <TasksProvider>
          <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className={`${sidebarCollapsed ? 'hidden' : 'block'} md:block`}>
              <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            </div>
            <Dashboard />
          </div>
        </TasksProvider>
      </GoalsProvider>
    </CalendarProvider>
  );
}
