import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Goal } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import { Loader2 } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  estimatedDuration: z.number().min(1, "Duration is required").optional(),
  category: z.string().optional(),
  status: z.string().default("todo"),
  goalId: z.number().optional(),
  priority: z.string().default("medium"),
  addToCalendar: z.boolean().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals?: Goal[];
}

export function TaskModal({ isOpen, onClose, goals }: TaskModalProps) {
  const { createTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      estimatedDuration: 30,
      category: "work",
      status: "todo",
      priority: "medium",
      addToCalendar: false,
    }
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      
      // Extract goalId as number or undefined
      const goalId = data.goalId ? Number(data.goalId) : undefined;
      
      await createTask({
        title: data.title,
        description: data.description || "",
        estimatedDuration: data.estimatedDuration,
        status: data.status,
        goalId: goalId,
        priority: data.priority,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details"
                rows={3}
                {...form.register("description")}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Duration</Label>
                <div className="flex">
                  <Input
                    id="estimatedDuration"
                    type="number"
                    placeholder="30"
                    className="rounded-r-none"
                    {...form.register("estimatedDuration", { valueAsNumber: true })}
                  />
                  <div className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm rounded-r-md">
                    minutes
                  </div>
                </div>
                {form.formState.errors.estimatedDuration && (
                  <p className="text-sm text-red-500">{form.formState.errors.estimatedDuration.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={(value) => form.setValue("category", value)}
                  defaultValue={form.getValues("category")}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goalId">Related Goal</Label>
              <Select 
                onValueChange={(value) => form.setValue("goalId", Number(value) || undefined)}
                defaultValue={form.getValues("goalId")?.toString() || ""}
              >
                <SelectTrigger id="goalId">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {goals?.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                onValueChange={(value) => form.setValue("priority", value)}
                defaultValue={form.getValues("priority")}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="addToCalendar" 
                  checked={form.watch("addToCalendar")}
                  onCheckedChange={(checked) => form.setValue("addToCalendar", !!checked)}
                />
                <Label htmlFor="addToCalendar" className="text-sm">Add to calendar</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPriority" 
                  checked={form.watch("priority") === "high"}
                  onCheckedChange={(checked) => form.setValue("priority", checked ? "high" : "medium")}
                />
                <Label htmlFor="isPriority" className="text-sm">Priority</Label>
              </div>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
