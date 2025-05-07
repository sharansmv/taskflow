import { useState } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { CalendarProvider } from "@/hooks/use-calendar";
import { TasksProvider } from "@/hooks/use-tasks";
import { GoalsProvider } from "@/hooks/use-goals";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { TimeBlockModal } from "@/components/calendar/time-block-modal";
import { TaskModal } from "@/components/tasks/task-modal";
import { useCalendar } from "@/hooks/use-calendar";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

function CalendarContent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("day");
  const [isTimeBlockModalOpen, setIsTimeBlockModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { timeBlocks, isLoading } = useCalendar();
  
  // Create time slots from 9 AM to 5 PM
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 9);
  
  const handlePrevDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, view === "day" ? 1 : 7));
  };
  
  const handleNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, view === "day" ? 1 : 7));
  };
  
  const handleToday = () => {
    setSelectedDate(new Date());
  };
  
  // Generate dates for week view
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return addDays(weekStart, i);
  });
  
  // Format date for display
  const dateDisplay = view === "day" 
    ? format(selectedDate, "EEEE, MMMM d, yyyy")
    : `${format(weekDates[0], "MMM d")} - ${format(weekDates[6], "MMM d, yyyy")}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Calendar" 
        onMenuClick={() => {}}  // This will be handled by parent component
        onNewTaskClick={() => setIsTaskModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
        <CalendarHeader 
          date={selectedDate}
          view={view}
          onViewChange={setView}
          onPrevious={handlePrevDay}
          onNext={handleNextDay}
          onToday={handleToday}
        />
        
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mx-2">{dateDisplay}</h2>
              <Button variant="ghost" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                className={view === "day" ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : ""}
                onClick={() => setView("day")}
              >
                Day
              </Button>
              <Button 
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                className={view === "week" ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : ""}
                onClick={() => setView("week")}
              >
                Week
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsTimeBlockModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Block Time
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {view === "day" ? (
                  <DayView 
                    date={selectedDate} 
                    timeSlots={timeSlots} 
                    isLoading={isLoading}
                  />
                ) : (
                  <WeekView 
                    dates={weekDates} 
                    timeSlots={timeSlots} 
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <TimeBlockModal 
        isOpen={isTimeBlockModalOpen}
        onClose={() => setIsTimeBlockModalOpen(false)}
        selectedDate={selectedDate}
      />
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
}

function DayView({ date, timeSlots, isLoading }: { date: Date, timeSlots: number[], isLoading: boolean }) {
  // Get current hour for highlighting
  const currentHour = new Date().getHours();
  const currentDate = new Date().setHours(0, 0, 0, 0);
  const selectedDate = new Date(date).setHours(0, 0, 0, 0);
  const isToday = currentDate === selectedDate;
  
  // Sample events for demonstration
  const events = [
    {
      id: 1,
      title: "Team Meeting",
      startHour: 10,
      startMinute: 0,
      endHour: 11,
      endMinute: 30,
      color: "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200"
    },
    {
      id: 2,
      title: "Project Review",
      startHour: 13,
      startMinute: 0,
      endHour: 14,
      endMinute: 0,
      color: "bg-purple-100 dark:bg-purple-900 border-l-4 border-purple-500 text-purple-800 dark:text-purple-200"
    },
    {
      id: 3,
      title: "Work on Proposal",
      startHour: 15,
      startMinute: 0,
      endHour: 17,
      endMinute: 0,
      color: "bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-800 dark:text-green-200"
    }
  ];
  
  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-[600px]">
      <div className="w-16 flex-shrink-0">
        {timeSlots.map((hour) => (
          <div 
            key={hour} 
            className="time-slot flex items-start justify-end pr-2 text-xs text-gray-500 dark:text-gray-400"
          >
            <span>{hour === 12 ? "12:00 PM" : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}</span>
          </div>
        ))}
      </div>
      
      <div className="flex-1 relative border-l border-gray-200 dark:border-gray-700">
        {timeSlots.map((hour) => (
          <div 
            key={hour} 
            className={`time-slot border-gray-200 dark:border-gray-700 ${isToday && hour === currentHour ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          ></div>
        ))}
        
        {isToday && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-red-500 z-10" 
            style={{ 
              top: `${((currentHour - 9) * 60) + (new Date().getMinutes())}px` 
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -mt-1.5 -ml-1.5"></div>
          </div>
        )}
        
        {events.map((event) => {
          const top = ((event.startHour - 9) * 60) + event.startMinute;
          const height = ((event.endHour - event.startHour) * 60) + (event.endMinute - event.startMinute);
          
          return (
            <div
              key={event.id}
              className={`absolute left-1 right-1 rounded p-2 z-20 ${event.color}`}
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs">
                {event.startHour === 12 ? "12" : event.startHour % 12}:
                {event.startMinute.toString().padStart(2, '0')} 
                {event.startHour >= 12 ? 'PM' : 'AM'} - 
                {event.endHour === 12 ? "12" : event.endHour % 12}:
                {event.endMinute.toString().padStart(2, '0')} 
                {event.endHour >= 12 ? 'PM' : 'AM'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ dates, timeSlots, isLoading }: { dates: Date[], timeSlots: number[], isLoading: boolean }) {
  // Get current time info
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
  
  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <div className="w-16 flex-shrink-0"></div>
        {dates.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div 
              key={index} 
              className={`flex-1 p-2 text-center ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {format(date, "EEE")}
              </p>
              <p className={`text-sm ${isToday ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-800 dark:text-gray-200'}`}>
                {format(date, "d")}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-1">
        <div className="w-16 flex-shrink-0">
          {timeSlots.map((hour) => (
            <div 
              key={hour} 
              className="time-slot flex items-start justify-end pr-2 text-xs text-gray-500 dark:text-gray-400"
            >
              <span>{hour === 12 ? "12:00 PM" : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}</span>
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-7 relative">
          {dates.map((date, dayIndex) => (
            <div 
              key={dayIndex} 
              className="relative border-l border-gray-200 dark:border-gray-700"
            >
              {timeSlots.map((hour) => (
                <div 
                  key={`${dayIndex}-${hour}`} 
                  className={`time-slot border-gray-200 dark:border-gray-700 ${
                    date.toDateString() === new Date().toDateString() && hour === currentHour 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : ''
                  }`}
                ></div>
              ))}
            </div>
          ))}
          
          {/* Current time indicator */}
          {dates.findIndex(date => date.toDateString() === new Date().toDateString()) !== -1 && (
            <div 
              className="absolute border-t-2 border-red-500 z-10" 
              style={{ 
                top: `${((currentHour - 9) * 60) + (new Date().getMinutes())}px`,
                left: `${(currentDay - 1) * (100 / 7)}%`,
                width: `${100 / 7}%`
              }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full -mt-1.5 -ml-1.5"></div>
            </div>
          )}
          
          {/* Sample events for Week view */}
          <div 
            className="absolute z-20 rounded p-2 bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200" 
            style={{ 
              top: '60px', 
              height: '90px',
              left: 'calc(100% / 7 * 1 + 4px)', // Tuesday
              width: 'calc(100% / 7 - 8px)'
            }}
          >
            <p className="text-xs font-medium truncate">Team Meeting</p>
            <p className="text-xs truncate">10:00 - 11:30 AM</p>
          </div>
          
          <div 
            className="absolute z-20 rounded p-2 bg-purple-100 dark:bg-purple-900 border-l-4 border-purple-500 text-purple-800 dark:text-purple-200" 
            style={{ 
              top: '240px', 
              height: '60px',
              left: 'calc(100% / 7 * 3 + 4px)', // Thursday
              width: 'calc(100% / 7 - 8px)'
            }}
          >
            <p className="text-xs font-medium truncate">Project Review</p>
            <p className="text-xs truncate">1:00 - 2:00 PM</p>
          </div>
          
          <div 
            className="absolute z-20 rounded p-2 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-800 dark:text-green-200" 
            style={{ 
              top: '360px', 
              height: '120px',
              left: 'calc(100% / 7 * 4 + 4px)', // Friday
              width: 'calc(100% / 7 - 8px)'
            }}
          >
            <p className="text-xs font-medium truncate">Work on Proposal</p>
            <p className="text-xs truncate">3:00 - 5:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <CalendarProvider>
      <TasksProvider>
        <GoalsProvider>
          <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className={`${sidebarCollapsed ? 'hidden' : 'block'} md:block`}>
              <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            </div>
            <CalendarContent />
          </div>
        </GoalsProvider>
      </TasksProvider>
    </CalendarProvider>
  );
}
