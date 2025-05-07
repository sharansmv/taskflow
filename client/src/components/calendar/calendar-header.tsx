import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface CalendarHeaderProps {
  date: Date;
  view: "day" | "week";
  onViewChange: (view: "day" | "week") => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateSelect?: (date: Date) => void;
}

export function CalendarHeader({
  date,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onDateSelect
}: CalendarHeaderProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateSelect?.(selectedDate);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onToday}
        >
          Today
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              size="sm"
              className="ml-2"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(date, "MMMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant={view === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("day")}
        >
          Day
        </Button>
        <Button 
          variant={view === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("week")}
        >
          Week
        </Button>
      </div>
    </div>
  );
}
