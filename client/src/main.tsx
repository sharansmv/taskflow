import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

/**
 * Main entry point for the Taskflow application
 * 
 * The application is wrapped with several providers:
 * - QueryClientProvider: Provides React Query functionality for data fetching
 * - ThemeProvider: Manages the application's light/dark theme
 * - AuthProvider: Handles user authentication state
 */
createRoot(document.getElementById("root")!).render(
  // QueryClientProvider must be the outermost provider since other providers depend on it
  <QueryClientProvider client={queryClient}>
    {/* ThemeProvider manages light/dark mode preferences */}
    <ThemeProvider>
      {/* AuthProvider manages user authentication state */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
