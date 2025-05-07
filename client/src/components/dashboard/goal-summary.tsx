import { Goal } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { format, isAfter, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalSummaryProps {
  goals: Goal[];
  isLoading?: boolean;
}

export function GoalSummary({ goals, isLoading = false }: GoalSummaryProps) {
  // Get category badge color
  const getCategoryColor = (category: string) => {
    const categories = {
      work: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      personal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      health: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      learning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      finance: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
    };
    
    return categories[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };
  
  // Format deadline to human-readable text
  const formatDeadline = (deadline: Date | null | undefined) => {
    if (!deadline) return "No deadline";
    
    const today = new Date();
    const daysLeft = differenceInDays(new Date(deadline), today);
    
    if (isAfter(today, new Date(deadline))) {
      return "Overdue";
    }
    
    if (daysLeft === 0) {
      return "Due today";
    }
    
    if (daysLeft === 1) {
      return "Due tomorrow";
    }
    
    if (daysLeft < 7) {
      return `Due in ${daysLeft} days`;
    }
    
    return `Due on ${format(new Date(deadline), "MMM d")}`;
  };
  
  // Filter for weekly goals, or fallback to all goals
  const displayGoals = goals.filter(goal => goal.timeframe === "weekly") || goals;
  
  // Calculate task completion for each goal
  const getTaskCompletion = (goal: Goal) => {
    // This would normally come from the API
    // For now, we'll use the progress value
    return `${goal.progress}%`;
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Weekly Goal Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Weekly Goal Progress</h2>
      
      {displayGoals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No weekly goals found. Create some goals to track your progress!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayGoals.slice(0, 4).map((goal) => (
            <Card key={goal.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", getCategoryColor(goal.category))}>
                      {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                    </span>
                    <h3 className="text-base font-medium mt-2 text-gray-800 dark:text-white">{goal.title}</h3>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {getTaskCompletion(goal)}
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2 mb-2" />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDeadline(goal.deadline)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
