import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, CalendarDays, CheckSquare, Flag, ChevronLeft, SunMedium, MoonStar, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const NavItem = ({ 
    href, 
    icon: Icon, 
    label, 
    isActive 
  }: { 
    href: string; 
    icon: React.ElementType; 
    label: string; 
    isActive: boolean;
  }) => (
    <Link href={href}>
      <a className={cn(
        "flex items-center py-2 px-4 text-sm rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      )}>
        <Icon className="mr-3 h-5 w-5" />
        {!collapsed && <span>{label}</span>}
      </a>
    </Link>
  );

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.username.substring(0, 2).toUpperCase() || "?";
  };

  return (
    <aside className={cn(
      "flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-500">
              <path fill="currentColor" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            {!collapsed && <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Taskflow</h1>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            aria-label="Toggle sidebar"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className={cn("h-5 w-5", collapsed && "rotate-180")} />
          </Button>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className={cn("px-4 mb-2", collapsed && "text-center")}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {collapsed ? "MAIN" : "Main"}
          </p>
        </div>
        
        <NavItem 
          href="/" 
          icon={LayoutDashboard} 
          label="Dashboard" 
          isActive={location === "/"} 
        />
        
        <NavItem 
          href="/calendar" 
          icon={CalendarDays} 
          label="Calendar" 
          isActive={location === "/calendar"} 
        />
        
        <NavItem 
          href="/tasks" 
          icon={CheckSquare} 
          label="Tasks" 
          isActive={location === "/tasks"} 
        />
        
        <NavItem 
          href="/goals" 
          icon={Flag} 
          label="Goals" 
          isActive={location === "/goals"} 
        />
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className="w-full justify-start"
        >
          {theme === "dark" ? (
            <>
              <SunMedium className="h-5 w-5" />
              {!collapsed && <span className="ml-2">Light Mode</span>}
            </>
          ) : (
            <>
              <MoonStar className="h-5 w-5" />
              {!collapsed && <span className="ml-2">Dark Mode</span>}
            </>
          )}
        </Button>
        
        {!collapsed && (
          <Button
            variant="ghost"
            size="default"
            onClick={handleLogout}
            className="w-full justify-start mt-2"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Logout</span>
          </Button>
        )}
        
        <div className={cn("mt-4 flex", collapsed ? "justify-center" : "items-center")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profilePicture || ""} alt={user?.username} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
