import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, addDays, parseISO, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeBlock } from "@shared/schema";
import { useCalendar } from "@/hooks/use-calendar";

interface CalendarViewProps {
  date?: Date;
  timeBlocks?: TimeBlock[];
  isLoading?: boolean;
}

type CalendarEvent = {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  category?: string;
  color: string;
};

export function CalendarView({ date = new Date(), timeBlocks = [], isLoading = false }: CalendarViewProps) {
  const [view, setView] = useState<"day" | "week">("day");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const { getTimeBlocksForRange } = useCalendar();
  
  // Create time slots from 9 AM to 5 PM
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 9);
  
  // Set current time indicator position
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Position in pixels based on hours since 9 AM (first time slot)
    const hoursOffset = hours - 9;
    const minutesOffset = minutes / 60;
    
    // Each time slot is 60px high
    const position = (hoursOffset + minutesOffset) * 60;
    
    setCurrentTime(position);
    
    // Update every minute
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const hoursOffset = hours - 9;
      const minutesOffset = minutes / 60;
      const position = (hoursOffset + minutesOffset) * 60;
      setCurrentTime(position);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Convert timeBlocks to calendar events
  useEffect(() => {
    // This would normally come from the API
    // For now, we'll create some demo events
    const sampleEvents: CalendarEvent[] = [
      {
        id: 1,
        title: "Team Meeting",
        startTime: new Date(date.setHours(10, 0, 0, 0)),
        endTime: new Date(date.setHours(11, 30, 0, 0)),
        category: "work",
        color: "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500",
      },
      {
        id: 2,
        title: "Project Review",
        startTime: new Date(date.setHours(13, 0, 0, 0)),
        endTime: new Date(date.setHours(14, 0, 0, 0)),
        category: "work",
        color: "bg-purple-100 dark:bg-purple-900 border-l-4 border-purple-500",
      },
      {
        id: 3,
        title: "Work on Proposal",
        startTime: new Date(date.setHours(15, 0, 0, 0)),
        endTime: new Date(date.setHours(17, 0, 0, 0)),
        category: "work",
        color: "bg-green-100 dark:bg-green-900 border-l-4 border-green-500",
      },
    ];
    
    setEvents(sampleEvents);
  }, [date, timeBlocks]);
  
  // Position event based on time
  const positionEvent = (event: CalendarEvent) => {
    const startHour = event.startTime.getHours();
    const startMinute = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMinute = event.endTime.getMinutes();
    
    // Calculate position and height
    const top = ((startHour - 9) * 60) + (startMinute);
    const height = ((endHour - startHour) * 60) + (endMinute - startMinute);
    
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Schedule</h2>
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
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="overflow-y-auto max-h-[500px] relative">
          <div className="flex">
            <div className="w-16 flex-shrink-0">
              {/* Time labels */}
              {timeSlots.map((hour) => (
                <div key={hour} className="time-slot flex items-start justify-end pr-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{hour === 12 ? "12:00 PM" : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}</span>
                </div>
              ))}
            </div>
            
            <div className="flex-1 relative border-l border-gray-200 dark:border-gray-700">
              {/* Horizontal time dividers */}
              {timeSlots.map((hour) => (
                <div key={hour} className="time-slot border-gray-200 dark:border-gray-700"></div>
              ))}
              
              {/* Current time indicator - only show if today */}
              {isToday(date) && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-red-500 z-10" 
                  style={{ top: `${currentTime}px` }}
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full -mt-1.5 -ml-1.5"></div>
                </div>
              )}
              
              {/* Calendar events */}
              {events.map((event) => {
                const style = positionEvent(event);
                return (
                  <div
                    key={event.id}
                    className={cn("absolute left-1 right-1 rounded p-2 z-20", event.color)}
                    style={{ top: style.top, height: style.height }}
                  >
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{event.title}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {format(event.startTime, "h:mm a")} - {format(event.endTime, "h:mm a")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
