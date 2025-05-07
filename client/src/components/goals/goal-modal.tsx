import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Goal } from "@shared/schema";
import { useGoals } from "@/hooks/use-goals";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  timeframe: z.string().min(1, "Timeframe is required"),
  deadline: z.date().optional().nullable(),
  priority: z.string().default("medium"),
  parentGoalId: z.number().optional().nullable(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGoal?: Goal;
  goals?: Goal[];
}

export function GoalModal({ 
  isOpen, 
  onClose, 
  existingGoal,
  goals = []
}: GoalModalProps) {
  const { createGoal, updateGoal } = useGoals();
  const [deadline, setDeadline] = useState<Date | undefined>(existingGoal?.deadline ? new Date(existingGoal.deadline) : undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: existingGoal?.title || "",
      description: existingGoal?.description || "",
      category: existingGoal?.category || "work",
      timeframe: existingGoal?.timeframe || "weekly",
      deadline: existingGoal?.deadline ? new Date(existingGoal.deadline) : null,
      priority: existingGoal?.priority || "medium",
      parentGoalId: existingGoal?.parentGoalId || null,
    }
  });
  
  const onSubmit = async (data: GoalFormData) => {
    try {
      setIsSubmitting(true);
      
      // Create object for server
      const goalData = {
        ...data,
        deadline: data.deadline || undefined,
      };
      
      if (existingGoal) {
        await updateGoal(existingGoal.id, goalData);
      } else {
        await createGoal(goalData);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating/updating goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter out the current goal and its children from parent goal options to prevent circular references
  const parentGoalOptions = goals.filter(g => {
    if (!existingGoal) return true;
    return g.id !== existingGoal.id && g.parentGoalId !== existingGoal.id;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingGoal ? "Edit Goal" : "Create Goal"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Complete project, Learn new skill, etc."
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
                placeholder="Add details about your goal"
                rows={3}
                {...form.register("description")}
              />
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
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select 
                onValueChange={(value) => form.setValue("timeframe", value)}
                defaultValue={form.getValues("timeframe")}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long-term">Long-term</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Deadline (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Select a deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(newDate) => {
                      setDeadline(newDate);
                      form.setValue("deadline", newDate as Date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
            
            <div className="space-y-2">
              <Label htmlFor="parentGoalId">Parent Goal (optional)</Label>
              <Select 
                onValueChange={(value) => form.setValue("parentGoalId", value ? parseInt(value, 10) : null)}
                defaultValue={form.getValues("parentGoalId")?.toString() || ""}
              >
                <SelectTrigger id="parentGoalId">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {parentGoalOptions.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Link this goal to a larger goal
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                existingGoal ? "Update Goal" : "Create Goal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
