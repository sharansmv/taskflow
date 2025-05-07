import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check } from "lucide-react";
import { insertUserSchema } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data);
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    await registerMutation.mutateAsync(data);
  };

  // Redirect if logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 items-center">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
              <span className="text-xl font-bold">Taskflow</span>
            </div>
            <CardTitle className="text-2xl">Welcome to Taskflow</CardTitle>
            <CardDescription>
              Manage your goals, tasks, and calendar in one unified interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        {...loginForm.register("username")}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                    
                    {loginMutation.isError && (
                      <p className="text-sm text-red-500 mt-2">
                        {loginMutation.error?.message || "Login failed. Please try again."}
                      </p>
                    )}
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name (Optional)</Label>
                      <Input 
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        {...registerForm.register("fullName")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password"
                        type="password"
                        placeholder="Create a strong password"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                    
                    {registerMutation.isError && (
                      <p className="text-sm text-red-500 mt-2">
                        {registerMutation.error?.message || "Registration failed. Please try again."}
                      </p>
                    )}
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By continuing, you agree to Taskflow's Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
        
        <div className="hidden md:flex flex-col space-y-8 p-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">Organize your work and life</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Taskflow helps you manage your goals, tasks, and time in one place, so you can stay organized and get more done.
            </p>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Goal-oriented planning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Set meaningful goals and break them down into manageable tasks</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Calendar integration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sync with Google Calendar to plan your schedule</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Time blocking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Allocate time for tasks to stay focused and productive</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Progress tracking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Visualize your progress toward goals with intuitive dashboards</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
