import { createContext, useContext, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TimeBlock, InsertTimeBlock } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay, addDays } from "date-fns";

interface CalendarContextProps {
  timeBlocks: TimeBlock[] | undefined;
  isLoading: boolean;
  createTimeBlock: (data: Omit<InsertTimeBlock, "userId">) => Promise<TimeBlock>;
  updateTimeBlock: (id: number, data: Partial<TimeBlock>) => Promise<TimeBlock>;
  deleteTimeBlock: (id: number) => Promise<void>;
  getTimeBlocksForRange: (startDate: Date, endDate: Date) => Promise<TimeBlock[]>;
}

const CalendarContext = createContext<CalendarContextProps | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Default date range (today)
  const today = new Date();
  const startDate = startOfDay(today);
  const endDate = endOfDay(today);

  // Fetch time blocks for today
  const { data: timeBlocks, isLoading } = useQuery<TimeBlock[]>({
    queryKey: ["/api/timeblocks", { startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') }],
  });

  // Create time block mutation
  const createTimeBlockMutation = useMutation({
    mutationFn: async (timeBlockData: Omit<InsertTimeBlock, "userId">) => {
      const res = await apiRequest("POST", "/api/timeblocks", timeBlockData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeblocks"] });
      toast({
        title: "Time block created",
        description: "Your time block has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create time block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update time block mutation
  const updateTimeBlockMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TimeBlock> }) => {
      const res = await apiRequest("PATCH", `/api/timeblocks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeblocks"] });
      toast({
        title: "Time block updated",
        description: "Your time block has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update time block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete time block mutation
  const deleteTimeBlockMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/timeblocks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeblocks"] });
      toast({
        title: "Time block deleted",
        description: "Your time block has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete time block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTimeBlock = async (data: Omit<InsertTimeBlock, "userId">) => {
    return await createTimeBlockMutation.mutateAsync(data);
  };

  const updateTimeBlock = async (id: number, data: Partial<TimeBlock>) => {
    return await updateTimeBlockMutation.mutateAsync({ id, data });
  };

  const deleteTimeBlock = async (id: number) => {
    await deleteTimeBlockMutation.mutateAsync(id);
  };

  const getTimeBlocksForRange = async (startDate: Date, endDate: Date) => {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    const data = await queryClient.fetchQuery<TimeBlock[]>({
      queryKey: ["/api/timeblocks", { startDate: formattedStartDate, endDate: formattedEndDate }],
    });
    
    return data;
  };

  return (
    <CalendarContext.Provider
      value={{
        timeBlocks,
        isLoading,
        createTimeBlock,
        updateTimeBlock,
        deleteTimeBlock,
        getTimeBlocksForRange,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};
