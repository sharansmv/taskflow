import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface TaskFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: any) => void;
}

export function TaskFilter({ isOpen, onClose, onApply }: TaskFilterProps) {
  const [status, setStatus] = useState<string[]>(["todo", "in-progress", "done"]);
  const [priority, setPriority] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [durationRange, setDurationRange] = useState<number[]>([0, 120]);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  
  const handleStatusChange = (value: string, checked: boolean) => {
    if (checked) {
      setStatus([...status, value]);
    } else {
      setStatus(status.filter(s => s !== value));
    }
  };
  
  const handleReset = () => {
    setStatus(["todo", "in-progress", "done"]);
    setPriority("all");
    setCategory("all");
    setDurationRange([0, 120]);
    setShowCompletedTasks(true);
  };
  
  const handleApply = () => {
    if (onApply) {
      onApply({
        status,
        priority,
        category,
        durationRange,
        showCompletedTasks
      });
    }
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Tasks</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <Label>Status</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="status-todo" 
                  checked={status.includes("todo")}
                  onCheckedChange={(checked) => handleStatusChange("todo", !!checked)}
                />
                <Label htmlFor="status-todo">To Do</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="status-in-progress" 
                  checked={status.includes("in-progress")}
                  onCheckedChange={(checked) => handleStatusChange("in-progress", !!checked)}
                />
                <Label htmlFor="status-in-progress">In Progress</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="status-done" 
                  checked={status.includes("done")}
                  onCheckedChange={(checked) => handleStatusChange("done", !!checked)}
                />
                <Label htmlFor="status-done">Done</Label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label>Priority</Label>
            <RadioGroup value={priority} onValueChange={setPriority}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="priority-all" />
                <Label htmlFor="priority-all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="priority-high" />
                <Label htmlFor="priority-high">High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="priority-medium" />
                <Label htmlFor="priority-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="priority-low" />
                <Label htmlFor="priority-low">Low</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div>
              <Label>Duration (minutes)</Label>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{durationRange[0]} min</span>
                <span>{durationRange[1]} min</span>
              </div>
              <Slider 
                value={durationRange} 
                min={0} 
                max={240} 
                step={15} 
                onValueChange={setDurationRange} 
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-completed" 
              checked={showCompletedTasks}
              onCheckedChange={(checked) => setShowCompletedTasks(!!checked)}
            />
            <Label htmlFor="show-completed">Show completed tasks</Label>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
          >
            Reset
          </Button>
          <div className="space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
