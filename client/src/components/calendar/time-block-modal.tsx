import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { useCalendar } from "@/hooks/use-calendar";
import { useTasks } from "@/hooks/use-tasks";

const timeBlockSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  taskId: z.number().optional(),
  buffer: z.number().min(0).default(0),
});

type TimeBlockFormData = z.infer<typeof timeBlockSchema>;

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  existingTimeBlock?: any;
}

export function TimeBlockModal({ 
  isOpen, 
  onClose, 
  selectedDate = new Date(),
  existingTimeBlock
}: TimeBlockModalProps) {
  const { createTimeBlock, updateTimeBlock } = useCalendar();
  const { tasks } = useTasks();
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TimeBlockFormData>({
    resolver: zodResolver(timeBlockSchema),
    defaultValues: {
      title: existingTimeBlock?.title || "",
      date: existingTimeBlock?.startTime ? new Date(existingTimeBlock.startTime) : selectedDate,
      startTime: existingTimeBlock?.startTime ? format(new Date(existingTimeBlock.startTime), "HH:mm") : "09:00",
      endTime: existingTimeBlock?.endTime ? format(new Date(existingTimeBlock.endTime), "HH:mm") : "10:00",
      taskId: existingTimeBlock?.taskId,
      buffer: existingTimeBlock?.buffer || 0,
    }
  });
  
  // Generate time options (30 min intervals)
  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }
  
  const onSubmit = async (data: TimeBlockFormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert form data to startTime and endTime
      const startDateTime = new Date(data.date);
      const [startHour, startMinute] = data.startTime.split(":");
      startDateTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
      
      const endDateTime = new Date(data.date);
      const [endHour, endMinute] = data.endTime.split(":");
      endDateTime.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
      
      const timeBlockData = {
        title: data.title,
        startTime: startDateTime,
        endTime: endDateTime,
        taskId: data.taskId,
        buffer: data.buffer,
      };
      
      if (existingTimeBlock) {
        await updateTimeBlock(existingTimeBlock.id, timeBlockData);
      } else {
        await createTimeBlock(timeBlockData);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating/updating time block:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingTimeBlock ? "Edit Time Block" : "Create Time Block"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Meeting, Focus time, etc."
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      form.setValue("date", newDate as Date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select 
                  onValueChange={(value) => form.setValue("startTime", value)}
                  defaultValue={form.getValues("startTime")}
                >
                  <SelectTrigger id="startTime" className="w-full">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select 
                  onValueChange={(value) => form.setValue("endTime", value)}
                  defaultValue={form.getValues("endTime")}
                >
                  <SelectTrigger id="endTime" className="w-full">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskId">Related Task (Optional)</Label>
              <Select 
                onValueChange={(value) => form.setValue("taskId", value ? parseInt(value, 10) : undefined)}
                defaultValue={form.getValues("taskId")?.toString() || ""}
              >
                <SelectTrigger id="taskId">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {tasks?.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buffer">Buffer Time (minutes)</Label>
              <Input
                id="buffer"
                type="number"
                min="0"
                placeholder="0"
                {...form.register("buffer", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Buffer time before the next event
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : existingTimeBlock ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
