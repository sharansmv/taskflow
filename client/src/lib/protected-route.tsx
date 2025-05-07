import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

/**
 * ProtectedRoute component for handling authenticated routes
 * 
 * This component wraps routes that require authentication.
 * If the user is not authenticated, they are redirected to the auth page.
 * If auth state is loading, a spinner is shown.
 * 
 * @param path - The URL path for the route
 * @param component - The component to render if authenticated
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Get authentication state from auth context
  const { user, isLoading } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Redirect to auth page if user is not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Render the protected component if user is authenticated
  return <Component />
}
