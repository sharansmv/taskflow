import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Type definition for the authentication context
 * Contains user data, loading state, error state, and authentication mutations
 */
type AuthContextType = {
  user: SelectUser | null;           // The authenticated user or null if not authenticated
  isLoading: boolean;                // Whether the auth state is being loaded
  error: Error | null;               // Any error that occurred during authentication
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;    // Login mutation
  logoutMutation: UseMutationResult<void, Error, void>;              // Logout mutation
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>; // Registration mutation
};

/**
 * Type for login credentials, containing only username and password
 */
type LoginData = Pick<InsertUser, "username" | "password">;

// Create context for authentication state
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider component for authentication state
 * Manages user auth state and provides login/logout/register mutations
 * 
 * @param children - Child components that will have access to auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Query current user data from API
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }), // Return null on 401 (Unauthorized)
  });

  /**
   * Mutation for user login
   * Sends credentials to the server and updates user data on success
   */
  const loginMutation = useMutation({
    // Define mutation function that calls the login API
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    // On successful login, update the cached user data
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    // Display error toast on login failure
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Mutation for user registration
   * Creates a new user account and logs the user in on success
   */
  const registerMutation = useMutation({
    // Define mutation function that calls the register API
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    // On successful registration, update the cached user data
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    // Display error toast on registration failure
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Mutation for user logout
   * Ends the user session and clears user data
   */
  const logoutMutation = useMutation({
    // Define mutation function that calls the logout API
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    // On successful logout, set the user data to null
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    },
    // Display error toast on logout failure
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Provide auth context to children components
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the authentication context
 * Must be used within an AuthProvider component
 * 
 * @returns The authentication context with user data and auth mutations
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
