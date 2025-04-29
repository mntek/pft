import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CurrencySelect } from '@/components/ui/currency-select';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
            <CurrencySelect 
              name="defaultCurrency" 
              label="Default Currency"
              disabled={isPending}
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