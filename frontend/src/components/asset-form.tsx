import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAssetSchema, type InsertAsset } from "@shared/schema";
import { z } from "zod";

const formSchema = insertAssetSchema.extend({
  currentValue: z.string().min(1, "Current value is required"),
  purchasePrice: z.string().optional(),
  appreciationRate: z.string().optional(),
  depreciationRate: z.string().optional(),
  ownershipPercentage: z.string().optional(),
  expectedReturn: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface AssetFormProps {
  onSuccess?: () => void;
  asset?: InsertAsset & { id: string };
}

const ASSET_TYPES = [
  { value: "cash_liquid", label: "Cash & Liquid Assets" },
  { value: "investments", label: "Investments" },
  { value: "real_estate", label: "Real Estate" },
  { value: "vehicles", label: "Vehicles" },
  { value: "personal_property", label: "Personal Property" },
  { value: "business", label: "Business Assets" },
  { value: "receivables", label: "Receivables" }
];

const SUBCATEGORIES = {
  cash_liquid: ["checking", "savings", "emergency_fund", "money_market", "cd", "cash_on_hand"],
  investments: ["stocks", "bonds", "mutual_funds", "etfs", "crypto", "401k", "ira", "roth_ira", "brokerage"],
  real_estate: ["primary_home", "rental_property", "vacation_home", "raw_land", "commercial_property"],
  vehicles: ["auto", "motorcycle", "boat", "rv", "aircraft"],
  personal_property: ["jewelry", "art", "collectibles", "electronics", "furniture", "clothing"],
  business: ["business_equity", "equipment", "inventory", "intellectual_property"],
  receivables: ["loans_to_others", "accounts_receivable", "settlements", "insurance_claims"]
};

const RISK_LEVELS = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" }
];

export function AssetForm({ onSuccess, asset }: AssetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(asset?.assetType || "");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetName: asset?.assetName || "",
      assetType: asset?.assetType || "",
      subcategory: asset?.subcategory || "",
      currentValue: asset?.currentValue || "",
      purchasePrice: asset?.purchasePrice || "",
      purchaseDate: asset?.purchaseDate || "",
      appreciationRate: asset?.appreciationRate || "0",
      depreciationRate: asset?.depreciationRate || "0",
      ownershipPercentage: asset?.ownershipPercentage || "100",
      isLiquid: asset?.isLiquid ?? false,
      institution: asset?.institution || "",
      accountNumber: asset?.accountNumber || "",
      maturityDate: asset?.maturityDate || "",
      expectedReturn: asset?.expectedReturn || "",
      riskLevel: asset?.riskLevel || "",
      marketValue: asset?.marketValue || "",
      notes: asset?.notes || ""
    }
  });

  const createAssetMutation = useMutation({
    mutationFn: (data: InsertAsset) => apiRequest("POST", "/api/assets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calculate-net-worth"] });
      toast({
        title: "Success",
        description: "Asset created successfully"
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create asset",
        variant: "destructive"
      });
    }
  });

  const updateAssetMutation = useMutation({
    mutationFn: (data: InsertAsset) => apiRequest("PUT", `/api/assets/${asset?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calculate-net-worth"] });
      toast({
        title: "Success",
        description: "Asset updated successfully"
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormData) => {
    const assetData: InsertAsset = {
      ...data,
      purchasePrice: data.purchasePrice || null,
      purchaseDate: data.purchaseDate || null,
      appreciationRate: data.appreciationRate || "0",
      depreciationRate: data.depreciationRate || "0",
      ownershipPercentage: data.ownershipPercentage || "100",
      maturityDate: data.maturityDate || null,
      expectedReturn: data.expectedReturn || null,
      riskLevel: data.riskLevel || null,
      marketValue: data.marketValue || null,
      institution: data.institution || null,
      accountNumber: data.accountNumber || null,
      notes: data.notes || null
    };

    if (asset) {
      updateAssetMutation.mutate(assetData);
    } else {
      createAssetMutation.mutate(assetData);
    }
  };

  const isPending = createAssetMutation.isPending || updateAssetMutation.isPending;
  const availableSubcategories = selectedType ? SUBCATEGORIES[selectedType as keyof typeof SUBCATEGORIES] || [] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{asset ? "Edit Asset" : "Add New Asset"}</CardTitle>
        <CardDescription>
          {asset ? "Update asset information" : "Enter details for your new asset"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="assetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chase Checking Account" {...field} data-testid="input-asset-name" />
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
                    <FormLabel>Asset Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedType(value);
                        form.setValue("subcategory", "");
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-asset-type">
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASSET_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {availableSubcategories.length > 0 && (
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-asset-subcategory">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSubcategories.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="50000.00" {...field} data-testid="input-current-value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Purchase Information */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="45000.00" {...field} data-testid="input-purchase-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} data-testid="input-purchase-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownershipPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ownership Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" max="100" placeholder="100" {...field} data-testid="input-ownership-percentage" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rates and Returns */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="appreciationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appreciation Rate (% annual)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="3.5" {...field} data-testid="input-appreciation-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depreciationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depreciation Rate (% annual)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="15" {...field} data-testid="input-depreciation-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Return (% annual)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="7" {...field} data-testid="input-expected-return" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution/Bank</FormLabel>
                    <FormControl>
                      <Input placeholder="Chase Bank" {...field} data-testid="input-institution" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number (last 4 digits)</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" maxLength={4} {...field} data-testid="input-account-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maturityDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maturity Date (for CDs, bonds)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-maturity-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-risk-level">
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RISK_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="marketValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Value ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="52000.00" {...field} data-testid="input-market-value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isLiquid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Liquid Asset</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Can this asset be easily converted to cash?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-is-liquid"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this asset..."
                      className="resize-none"
                      {...field}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save-asset"
              >
                {isPending ? "Saving..." : asset ? "Update Asset" : "Save Asset"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}