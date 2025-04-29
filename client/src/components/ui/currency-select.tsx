import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CURRENCIES } from '@/lib/currency';

interface CurrencySelectProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function CurrencySelect({ 
  name, 
  label = 'Currency', 
  description,
  disabled = false 
}: CurrencySelectProps) {
  const form = useFormContext();
  
  if (!form) {
    throw new Error('CurrencySelect must be used within a FormProvider');
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          {description && <FormDescription>{description}</FormDescription>}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.symbol} - {currency.label} ({currency.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}