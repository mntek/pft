import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CURRENCIES } from "@/lib/currency";

// Form schema
const currencyFormSchema = z.object({
  defaultCurrency: z.string().min(3).max(3),
});

type CurrencyFormValues = z.infer<typeof currencyFormSchema>;

export function CurrencySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize form with user's default currency
  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
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

  // Mutation for updating currency
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CurrencyFormValues) => {
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

  // Form submit handler
  function onSubmit(values: CurrencyFormValues) {
    mutate(values);
  }

  // Function to get currency names
  function getCurrencyName(code: string): string {
    const currency = CURRENCIES.find(c => c.value === code);
    return currency ? currency.label : code;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
        <CardDescription>
          Set your default currency for displaying financial information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Currency</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value} 
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="mb-2 px-2 text-xs text-muted-foreground">Common Currencies</div>
                        {topCurrencies.map((code: string) => (
                          <SelectItem key={code} value={code}>
                            {code} - {getCurrencyName(code)}
                          </SelectItem>
                        ))}
                        
                        <div className="my-2 px-2 text-xs text-muted-foreground">All Currencies</div>
                        {otherCurrencies.map((code: string) => (
                          <SelectItem key={code} value={code}>
                            {code} - {getCurrencyName(code)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}