import { createContext, useContext, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Task, InsertTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TasksContextProps {
  tasks: Task[] | undefined;
  todoTasks: Task[] | undefined;
  inProgressTasks: Task[] | undefined;
  doneTasks: Task[] | undefined;
  isLoading: boolean;
  createTask: (data: Omit<InsertTask, "userId">) => Promise<Task>;
  updateTask: (id: number, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  updateTaskStatus: (id: number, status: string) => Promise<Task>;
}

const TasksContext = createContext<TasksContextProps | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<InsertTask, "userId">) => {
      const res = await apiRequest("POST", "/api/tasks", taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter tasks by status
  const todoTasks = tasks?.filter((task) => task.status === "todo");
  const inProgressTasks = tasks?.filter((task) => task.status === "in-progress");
  const doneTasks = tasks?.filter((task) => task.status === "done");

  const createTask = async (data: Omit<InsertTask, "userId">) => {
    return await createTaskMutation.mutateAsync(data);
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    return await updateTaskMutation.mutateAsync({ id, data });
  };

  const deleteTask = async (id: number) => {
    await deleteTaskMutation.mutateAsync(id);
  };

  const updateTaskStatus = async (id: number, status: string) => {
    return await updateTaskMutation.mutateAsync({ id, data: { status } });
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        isLoading,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};
