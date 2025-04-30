import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertExpenseSchema } from "@shared/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const expenseSchema = insertExpenseSchema.omit({ userId: true }).extend({
  description: z.string().min(2, "Description must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
    { message: "Amount must be a positive number" }
  ),
  date: z.string().min(1, "Date is required"),
  currency: z.string().min(1, "Currency is required"),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  isEditing?: boolean;
}

export function ExpenseForm({ isEditing = false }: ExpenseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const expenseId = isEditing ? location.split('/').pop() : null;

  // Fetch expense data if editing
  const { data: expense, isLoading: isLoadingExpense } = useQuery({
    queryKey: ["/api/expenses", expenseId],
    queryFn: async () => {
      if (!expenseId) return null;
      const response = await apiRequest("GET", `/api/expenses/${expenseId}`);
      if (!response.ok) {
        throw new Error("Expense not found");
      }
      const responseData = await response.json();
      console.log("Fetched expense data:", responseData);
      return responseData;
    },
    enabled: !!expenseId,
  });
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      category: "",
      amount: "",
      currency: "TRY", // Changed default to TRY
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    },
  });
  
  // Update form when expense data is loaded
  React.useEffect(() => {
    if (expense && isEditing) {
      // Properly set form values including defaultValues
      form.reset({
        description: expense.description || "",
        category: expense.category || "",
        amount: expense.amount ? expense.amount.toString() : "",
        currency: expense.currency || "TRY",
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      
      // Also set values directly to ensure they appear in form fields
      form.setValue("description", expense.description || "");
      form.setValue("category", expense.category || "");
      form.setValue("amount", expense.amount ? expense.amount.toString() : "");
      form.setValue("currency", expense.currency || "TRY");
      form.setValue("date", expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    }
  }, [expense, form, isEditing]);

  const categories = ["Education", "Health", "Travel", "Shopping", "Food", "Housing", "Entertainment", "Other"];
  const currencies = ["TRY", "USD", "EUR", "GBP"]; // Added TRY first

  const createExpenseMutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      // Convert string values to numeric types
      const processedValues = {
        ...values,
        userId: user!.id,
        amount: values.amount, // Keep as string
      };
      
      const response = await apiRequest("POST", "/api/expenses", processedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/expenses");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      if (!expenseId) throw new Error("Expense ID is required for updates");
      
      const processedValues = {
        ...values,
        amount: values.amount,
      };
      
      const response = await apiRequest("PUT", `/api/expenses/${expenseId}`, processedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/expenses");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: ExpenseFormValues) {
    if (isEditing) {
      updateExpenseMutation.mutate(values);
    } else {
      createExpenseMutation.mutate(values);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/expenses")}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="What was this expense for?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="100.00" {...field} />
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
                disabled={isEditing ? updateExpenseMutation.isPending : createExpenseMutation.isPending}
              >
                {isEditing
                  ? (updateExpenseMutation.isPending ? "Updating..." : "Update Expense")
                  : (createExpenseMutation.isPending ? "Adding..." : "Add Expense")
                }
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}