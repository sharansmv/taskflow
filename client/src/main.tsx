import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
