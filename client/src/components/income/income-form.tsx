import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertIncomeSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const incomeSchema = insertIncomeSchema.omit({ userId: true }).extend({
  source: z.string().min(2, "Source must be at least 2 characters"),
  type: z.enum(["fixed", "additional"]),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
    { message: "Amount must be a positive number" }
  ),
  date: z.string().min(1, "Date is required"),
  currency: z.string().min(1, "Currency is required"),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  isEditing?: boolean;
}

export function IncomeForm({ isEditing = false }: IncomeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const incomeId = isEditing ? location.split('/').pop() : null;

  // Fetch income data if editing
  const { data: income, isLoading: isLoadingIncome } = useQuery({
    queryKey: ["/api/incomes", incomeId],
    queryFn: async () => {
      if (!incomeId) return null;
      const response = await apiRequest("GET", `/api/incomes/${incomeId}`);
      if (!response.ok) {
        throw new Error("Income not found");
      }
      return response.json();
    },
    enabled: !!incomeId,
  });
  
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      source: "",
      type: "fixed",
      amount: "",
      currency: "TRY", // Changed default to TRY
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    },
  });
  
  // Update form when income data is loaded
  React.useEffect(() => {
    if (income && isEditing) {
      // Properly set form values including defaultValues
      form.reset({
        source: income.source || "",
        type: income.type || "fixed",
        amount: income.amount ? income.amount.toString() : "",
        currency: income.currency || "TRY",
        date: income.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      
      // Also set values directly to ensure they appear in form fields
      form.setValue("source", income.source || "");
      form.setValue("type", income.type || "fixed");
      form.setValue("amount", income.amount ? income.amount.toString() : "");
      form.setValue("currency", income.currency || "TRY");
      form.setValue("date", income.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    }
  }, [income, form, isEditing]);
  
  const currencies = ["TRY", "USD", "EUR", "GBP"]; // Added TRY first

  const createIncomeMutation = useMutation({
    mutationFn: async (values: IncomeFormValues) => {
      // Convert string values to numeric types
      const processedValues = {
        ...values,
        userId: user!.id,
        amount: values.amount, // Keep as string
      };
      
      const response = await apiRequest("POST", "/api/incomes", processedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/income");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add income: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: async (values: IncomeFormValues) => {
      if (!incomeId) throw new Error("Income ID is required for updates");
      
      const processedValues = {
        ...values,
        amount: values.amount,
      };
      
      const response = await apiRequest("PUT", `/api/incomes/${incomeId}`, processedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/income");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update income: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: IncomeFormValues) {
    if (isEditing) {
      updateIncomeMutation.mutate(values);
    } else {
      createIncomeMutation.mutate(values);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/income")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Source</FormLabel>
                    <FormControl>
                      <Input placeholder="Salary, Freelance, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Income Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <label htmlFor="fixed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Fixed (Regular)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="additional" id="additional" />
                          <label htmlFor="additional" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Additional (One-time)
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="1000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isEditing ? updateIncomeMutation.isPending : createIncomeMutation.isPending}
              >
                {isEditing
                  ? (updateIncomeMutation.isPending ? "Updating..." : "Update Income")
                  : (createIncomeMutation.isPending ? "Adding..." : "Add Income")
                }
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}