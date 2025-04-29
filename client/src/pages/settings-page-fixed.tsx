import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  FormDescription,
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { CurrencySettings } from '@/components/settings/currency-settings';

// Form schemas
const profileFormSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  
  const isDarkMode = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiRequest('PUT', '/api/user/profile', values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });
      
      // Update user data in cache
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      const res = await apiRequest('PUT', '/api/user/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Password Updated',
        description: 'Your password has been updated. Please log in again.',
      });
      
      // Clear form
      passwordForm.reset();
      
      // Logout user after password change
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  function onProfileSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate(values);
  }
  
  function onPasswordSubmit(values: PasswordFormValues) {
    updatePasswordMutation.mutate(values);
  }

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      <div className="space-y-6">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile details here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Password Settings */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password here. After saving, you'll be logged out.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Settings */}
          <TabsContent value="preferences">
            <div className="space-y-6">
              {/* Currency Settings */}
              <CurrencySettings />
              
              {/* Appearance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Appearance & Preferences</CardTitle>
                  <CardDescription>
                    Customize your application experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel htmlFor="dark-mode">Dark Mode</FormLabel>
                      <FormDescription>
                        Toggle between light and dark theme
                      </FormDescription>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={isDarkMode}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel htmlFor="notifications">Notifications</FormLabel>
                      <FormDescription>
                        Enable notifications for important updates
                      </FormDescription>
                    </div>
                    <Switch id="notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel htmlFor="currency-format">Currency Format</FormLabel>
                      <FormDescription>
                        Show currency symbols in lists
                      </FormDescription>
                    </div>
                    <Switch id="currency-format" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}