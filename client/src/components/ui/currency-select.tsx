import * as React from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { Loader2 } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";

interface CurrencySelectProps {
  name: string;
  label: string;
  disabled?: boolean;
}

export function CurrencySelect({ name, label, disabled = false }: CurrencySelectProps) {
  const form = useFormContext();
  const { isLoading } = useExchangeRates();
  
  // Common currencies to show at the top
  const topCurrencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CNY"];
  
  // Get currency codes from the CURRENCIES constant
  const allCurrencyCodes = CURRENCIES.map(c => c.value);
  
  // Filter out top currencies from the rest
  const otherCurrencies = allCurrencyCodes
    .filter(code => !topCurrencies.includes(code))
    .sort();
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled || isLoading}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading currencies...
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

