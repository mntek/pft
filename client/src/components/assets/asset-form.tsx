import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAssetSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
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

const assetSchema = insertAssetSchema.omit({ userId: true }).extend({
  name: z.string().min(2, "Asset name must be at least 2 characters"),
  type: z.enum(["bank", "non-bank"]),
  assetType: z.string().min(1, "Asset type is required"),
  institution: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 
    { message: "Amount must be a positive number or zero" }
  ),
});

type AssetFormValues = z.infer<typeof assetSchema>;

export function AssetForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      type: "bank",
      assetType: "",
      institution: "",
      currency: "TRY", // Changed default to TRY
      amount: "",
    },
  });

  const bankAssetTypes = ["Checking", "Savings", "Time Deposit", "Stocks"];
  const nonBankAssetTypes = ["Cash", "Crypto", "Physical Gold"];
  const currencies = ["TRY", "USD", "EUR", "GBP"]; // Added TRY first

  const createAssetMutation = useMutation({
    mutationFn: async (values: AssetFormValues) => {
      // Keep values as strings since that's what the schema expects
      // lastUpdated is automatically set by the database
      const processedValues = {
        ...values,
        userId: user!.id,
        amount: values.amount, // Keep as string
        // No need to set lastUpdated - it has a default value in the database
      };
      
      const response = await apiRequest("POST", "/api/assets", processedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Asset added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      navigate("/assets");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add asset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: AssetFormValues) {
    createAssetMutation.mutate(values);
  }

  const watchType = form.watch("type");
  const assetTypes = watchType === "bank" ? bankAssetTypes : nonBankAssetTypes;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/assets")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Asset Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <label htmlFor="bank" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Bank Asset
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non-bank" id="non-bank" />
                        <label htmlFor="non-bank" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Non-Bank Asset
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Primary Savings Account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Subtype</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchType === "bank" ? "Bank Name" : "Location"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={watchType === "bank" ? "City Bank" : "Wallet, Exchange, Safe, etc."} 
                        {...field} 
                        value={field.value || ""}
                      />
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
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={createAssetMutation.isPending}
              >
                {createAssetMutation.isPending ? "Adding..." : "Add Asset"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}