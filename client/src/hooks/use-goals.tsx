import { createContext, useContext, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Goal, InsertGoal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GoalsContextProps {
  goals: Goal[] | undefined;
  weeklyGoals: Goal[] | undefined;
  monthlyGoals: Goal[] | undefined;
  longTermGoals: Goal[] | undefined;
  dailyGoals: Goal[] | undefined;
  isLoading: boolean;
  createGoal: (data: Omit<InsertGoal, "userId">) => Promise<Goal>;
  updateGoal: (id: number, data: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (id: number) => Promise<void>;
  updateGoalProgress: (id: number, progress: number) => Promise<Goal>;
}

const GoalsContext = createContext<GoalsContextProps | undefined>(undefined);

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all goals
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<InsertGoal, "userId">) => {
      const res = await apiRequest("POST", "/api/goals", goalData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal created",
        description: "Your goal has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Goal> }) => {
      const res = await apiRequest("PATCH", `/api/goals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter goals by timeframe
  const longTermGoals = goals?.filter((goal) => goal.timeframe === "long-term");
  const monthlyGoals = goals?.filter((goal) => goal.timeframe === "monthly");
  const weeklyGoals = goals?.filter((goal) => goal.timeframe === "weekly");
  const dailyGoals = goals?.filter((goal) => goal.timeframe === "daily");

  const createGoal = async (data: Omit<InsertGoal, "userId">) => {
    return await createGoalMutation.mutateAsync(data);
  };

  const updateGoal = async (id: number, data: Partial<Goal>) => {
    return await updateGoalMutation.mutateAsync({ id, data });
  };

  const deleteGoal = async (id: number) => {
    await deleteGoalMutation.mutateAsync(id);
  };

  const updateGoalProgress = async (id: number, progress: number) => {
    return await updateGoalMutation.mutateAsync({ id, data: { progress } });
  };

  return (
    <GoalsContext.Provider
      value={{
        goals,
        weeklyGoals,
        monthlyGoals,
        longTermGoals,
        dailyGoals,
        isLoading,
        createGoal,
        updateGoal,
        deleteGoal,
        updateGoalProgress,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error("useGoals must be used within a GoalsProvider");
  }
  return context;
};
