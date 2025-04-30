import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCreditCardSchema } from "@shared/schema";
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

// Define card colors
const CARD_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#10b981", label: "Green" },
  { value: "#ef4444", label: "Red" },
  { value: "#f59e0b", label: "Yellow" },
];

const creditCardSchema = insertCreditCardSchema.omit({ userId: true }).extend({
  name: z.string().min(2, "Card name must be at least 2 characters"),
  bank: z.string().min(2, "Bank name must be at least 2 characters"),
  creditLimit: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
    { message: "Credit limit must be a positive number" }
  ),
  statementDate: z.string().min(1, "Statement date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  minPaymentPercent: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) <= 100,
    { message: "Minimum payment must be between 1 and 100%" }
  ),
  currentBalance: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    { message: "Current balance must be a positive number or zero" }
  ),
  currency: z.string().min(1, "Currency is required"),
  color: z.string().min(1, "Card color is required"),
});

type CreditCardFormValues = z.infer<typeof creditCardSchema>;

interface CreditCardFormProps {
  isEditing?: boolean;
}

export function CreditCardForm({ isEditing = false }: CreditCardFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const cardId = isEditing ? location.split('/').pop() : null;

  // Fetch credit card data if editing
  const { data: card, isLoading: isLoadingCard } = useQuery({
    queryKey: ["/api/credit-cards", cardId],
    queryFn: async () => {
      if (!cardId) return null;
      const response = await fetch(`/api/credit-cards/${cardId}`);
      if (!response.ok) {
        throw new Error("Credit card not found");
      }
      return response.json();
    },
    enabled: !!cardId,
  });
  
  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: "",
      bank: "",
      creditLimit: "",
      statementDate: "",
      dueDate: "",
      minPaymentPercent: "5",
      currentBalance: "0",
      currency: "TRY",  // Default to Turkish Lira
      color: "#3b82f6",
    },
  });
  
  // Update form when card data is loaded
  React.useEffect(() => {
    if (card && isEditing) {
      form.reset({
        name: card.name,
        bank: card.bank,
        creditLimit: card.creditLimit.toString(),
        currentBalance: card.currentBalance.toString(),
        statementDate: card.statementDate.split('T')[0], // Format ISO date to YYYY-MM-DD
        dueDate: card.dueDate.split('T')[0], // Format ISO date to YYYY-MM-DD
        minPaymentPercent: card.minPaymentPercent.toString(),
        currency: card.currency,
        color: card.color,
      });
    }
  }, [card, form, isEditing]);
  
  const currencies = ["TRY", "USD", "EUR", "GBP"]; // TRY first as default

  const createCardMutation = useMutation({
    mutationFn: async (values: CreditCardFormValues) => {
      // Don't convert strings to numeric types - the backend expects strings
      const processedValues = {
        ...values,
        userId: user!.id,
        // Keep as strings since that's what the schema expects
        creditLimit: values.creditLimit,
        minPaymentPercent: values.minPaymentPercent,
        currentBalance: values.currentBalance,
      };
      
      const response = await apiRequest("POST", "/api/credit-cards", processedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Credit card added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/credit-cards");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add credit card: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async (values: CreditCardFormValues) => {
      if (!cardId) throw new Error("Card ID is required for updates");
      
      const processedValues = {
        ...values,
        creditLimit: values.creditLimit,
        minPaymentPercent: values.minPaymentPercent,
        currentBalance: values.currentBalance,
      };
      
      const response = await apiRequest("PUT", `/api/credit-cards/${cardId}`, processedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Credit card updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/credit-cards");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update credit card: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: CreditCardFormValues) {
    if (isEditing) {
      updateCardMutation.mutate(values);
    } else {
      createCardMutation.mutate(values);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/credit-cards")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Name</FormLabel>
                    <FormControl>
                      <Input placeholder="MasterCard Gold" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Bank</FormLabel>
                    <FormControl>
                      <Input placeholder="Citibank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit</FormLabel>
                    <FormControl>
                      <Input placeholder="5000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Balance</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="statementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statement Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minPaymentPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Payment (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="5" {...field} />
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Color</FormLabel>
                    <div className="flex space-x-3 mt-2">
                      {CARD_COLORS.map((color) => (
                        <Button
                          key={color.value}
                          type="button"
                          className={`h-8 w-8 rounded-full p-0 ${
                            field.value === color.value
                              ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                              : ""
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => field.onChange(color.value)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isEditing ? updateCardMutation.isPending : createCardMutation.isPending}
              >
                {isEditing 
                  ? (updateCardMutation.isPending ? "Updating..." : "Update Credit Card")
                  : (createCardMutation.isPending ? "Adding..." : "Add Credit Card")
                }
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
