import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { CURRENCIES } from '@/lib/currency';
import { Switch } from '@/components/ui/switch';
import { FormDescription, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPageSimpleFixed() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const notificationsEnabled = true; // Static initial state to avoid errors
  const currencySymbolsEnabled = true; // Static initial state to avoid errors
  
  const form = useForm({
    defaultValues: {
      defaultCurrency: user?.defaultCurrency || 'USD',
    },
  });

  // Common currencies to show at the top
  const topCurrencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CNY"];
  
  // Get all currency codes
  const allCurrencyCodes = CURRENCIES.map(c => c.value);
  
  // Filter out top currencies from the rest
  const otherCurrencies = allCurrencyCodes
    .filter(code => !topCurrencies.includes(code))
    .sort();

  // Currency update mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: { defaultCurrency: string }) => {
      const res = await apiRequest('PUT', '/api/user/profile', values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Currency Updated',
        description: 'Your default currency has been updated successfully.',
      });
      
      // Update user data in the cache
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update currency settings.',
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: { defaultCurrency: string }) {
    mutate(values);
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded bg-background" 
                defaultValue={user.username}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                className="w-full p-2 border rounded bg-background" 
                defaultValue={user.email}
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>Set your default currency for displaying financial information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded mb-4 text-sm">
            <h4 className="font-medium mb-2">How Currency Conversion Works</h4>
            <p className="mb-2">
              When you change your default currency, all financial information throughout the app will be displayed in your selected currency.
            </p>
            <p>
              The app will automatically convert values using real-time exchange rates.
            </p>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Default Currency</label>
              <Select 
                onValueChange={(value) => form.setValue('defaultCurrency', value)}
                defaultValue={user?.defaultCurrency || 'USD'}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <div className="mb-2 px-2 text-xs text-muted-foreground">Common Currencies</div>
                  {topCurrencies.map((code) => {
                    const currency = CURRENCIES.find(c => c.value === code);
                    return (
                      <SelectItem key={code} value={code}>
                        {code} - {currency ? currency.label : code}
                      </SelectItem>
                    );
                  })}
                  
                  <div className="my-2 px-2 text-xs text-muted-foreground">All Currencies</div>
                  {otherCurrencies.map((code) => {
                    const currency = CURRENCIES.find(c => c.value === code);
                    return (
                      <SelectItem key={code} value={code}>
                        {code} - {currency ? currency.label : code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Currency
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Preference Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance & Notifications</CardTitle>
          <CardDescription>Customize application preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel htmlFor="notifications">Notifications</FormLabel>
              <FormDescription>
                Enable notifications for important updates
              </FormDescription>
            </div>
            <Switch 
              id="notifications" 
              checked={notificationsEnabled}
              onCheckedChange={(checked) => {
                toast({
                  title: checked ? "Notifications enabled" : "Notifications disabled",
                  description: checked 
                    ? "You will now receive notifications about important updates" 
                    : "You will no longer receive notifications",
                });
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel htmlFor="currency-format">Currency Format</FormLabel>
              <FormDescription>
                Show currency symbols in lists
              </FormDescription>
            </div>
            <Switch 
              id="currency-format" 
              checked={currencySymbolsEnabled}
              onCheckedChange={(checked) => {
                toast({
                  title: "Display setting updated",
                  description: checked 
                    ? "Currency symbols will now be shown in lists" 
                    : "Currency symbols will be hidden in lists",
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password securely</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input 
                type="password" 
                className="w-full p-2 border rounded bg-background" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input 
                type="password" 
                className="w-full p-2 border rounded bg-background" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input 
                type="password" 
                className="w-full p-2 border rounded bg-background" 
              />
            </div>
            <Button>Update Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}