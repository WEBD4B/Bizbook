import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign, Building, Car, Briefcase, CreditCard, GraduationCap, Receipt, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { AssetForm } from "./asset-form";
import { LiabilityForm } from "./liability-form";
import { useAssets, useLiabilities, useNetWorthSnapshots } from "@/hooks/useApi";
import type { Asset, Liability, NetWorthSnapshot } from "@shared/schema";

const ASSET_COLORS = {
  cash_liquid: "#4f46e5",
  investments: "#059669",
  real_estate: "#dc2626",
  vehicles: "#7c3aed",
  personal_property: "#ea580c",
  business: "#0891b2"
};

const LIABILITY_COLORS = {
  consumer_debt: "#ef4444",
  vehicle_loans: "#f97316",
  real_estate: "#eab308",
  education: "#8b5cf6",
  business: "#06b6d4",
  taxes_bills: "#f43f5e"
};

export function ComprehensiveNetWorth() {
  const queryClient = useQueryClient();
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);

  // Fetch data using custom hooks
  const { data: assets = [], isLoading: assetsLoading } = useAssets();
  const { data: liabilities = [], isLoading: liabilitiesLoading } = useLiabilities();

  const { data: netWorthCalculation, isLoading: calculationLoading } = useQuery({
    queryKey: ["/api/calculate-net-worth"],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/calculate-net-worth");
      return response.json();
    }
  });

  const { data: snapshots = [], isLoading: snapshotsLoading } = useNetWorthSnapshots();

  // Create snapshot mutation
  const createSnapshotMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/net-worth-snapshots", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/net-worth-snapshots"] });
    }
  });

  const isLoading = assetsLoading || liabilitiesLoading || calculationLoading;

  // Prepare chart data
  const assetsChartData = assets.length > 0 ? [
    { name: "Cash & Liquid", value: parseFloat(netWorthCalculation?.cashLiquidAssets || "0"), color: ASSET_COLORS.cash_liquid },
    { name: "Investments", value: parseFloat(netWorthCalculation?.investmentAssets || "0"), color: ASSET_COLORS.investments },
    { name: "Real Estate", value: parseFloat(netWorthCalculation?.realEstateAssets || "0"), color: ASSET_COLORS.real_estate },
    { name: "Vehicles", value: parseFloat(netWorthCalculation?.vehicleAssets || "0"), color: ASSET_COLORS.vehicles },
    { name: "Personal Property", value: parseFloat(netWorthCalculation?.personalPropertyAssets || "0"), color: ASSET_COLORS.personal_property },
    { name: "Business", value: parseFloat(netWorthCalculation?.businessAssets || "0"), color: ASSET_COLORS.business }
  ].filter(item => item.value > 0) : [];

  const liabilitiesChartData = liabilities.length > 0 ? [
    { name: "Consumer Debt", value: parseFloat(netWorthCalculation?.consumerDebt || "0"), color: LIABILITY_COLORS.consumer_debt },
    { name: "Vehicle Loans", value: parseFloat(netWorthCalculation?.vehicleLoans || "0"), color: LIABILITY_COLORS.vehicle_loans },
    { name: "Real Estate Debt", value: parseFloat(netWorthCalculation?.realEstateDebt || "0"), color: LIABILITY_COLORS.real_estate },
    { name: "Education Debt", value: parseFloat(netWorthCalculation?.educationDebt || "0"), color: LIABILITY_COLORS.education },
    { name: "Business Debt", value: parseFloat(netWorthCalculation?.businessDebt || "0"), color: LIABILITY_COLORS.business },
    { name: "Taxes & Bills", value: parseFloat(netWorthCalculation?.taxesBills || "0"), color: LIABILITY_COLORS.taxes_bills }
  ].filter(item => item.value > 0) : [];

  // Net worth trend data from snapshots
  const trendData = snapshots.slice(0, 12).reverse().map(snapshot => ({
    date: new Date(snapshot.snapshotDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    netWorth: parseFloat(snapshot.netWorth),
    assets: parseFloat(snapshot.totalAssets),
    liabilities: parseFloat(snapshot.totalLiabilities)
  }));

  const handleCreateSnapshot = () => {
    if (netWorthCalculation) {
      createSnapshotMutation.mutate({
        snapshotDate: new Date().toISOString().split('T')[0],
        totalAssets: netWorthCalculation.totalAssets,
        totalLiabilities: netWorthCalculation.totalLiabilities,
        netWorth: netWorthCalculation.netWorth,
        buyingPower: netWorthCalculation.buyingPower,
        cashLiquidAssets: netWorthCalculation.cashLiquidAssets,
        investmentAssets: netWorthCalculation.investmentAssets,
        realEstateAssets: netWorthCalculation.realEstateAssets,
        vehicleAssets: netWorthCalculation.vehicleAssets,
        personalPropertyAssets: netWorthCalculation.personalPropertyAssets,
        businessAssets: netWorthCalculation.businessAssets,
        consumerDebt: netWorthCalculation.consumerDebt,
        vehicleLoans: netWorthCalculation.vehicleLoans,
        realEstateDebt: netWorthCalculation.realEstateDebt,
        educationDebt: netWorthCalculation.educationDebt,
        businessDebt: netWorthCalculation.businessDebt,
        taxesBills: netWorthCalculation.taxesBills
      });
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Net Worth Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-assets">
              {formatCurrency(netWorthCalculation?.totalAssets || "0")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-total-liabilities">
              {formatCurrency(netWorthCalculation?.totalLiabilities || "0")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              parseFloat(netWorthCalculation?.netWorth || "0") >= 0 ? "text-green-600" : "text-red-600"
            }`} data-testid="text-net-worth">
              {formatCurrency(netWorthCalculation?.netWorth || "0")}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                onClick={handleCreateSnapshot}
                size="sm"
                disabled={createSnapshotMutation.isPending}
                data-testid="button-create-snapshot"
              >
                {createSnapshotMutation.isPending ? "Saving..." : "Save Snapshot"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buying Power</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-buying-power">
              {formatCurrency(netWorthCalculation?.buyingPower || "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Liquid assets + available credit
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Assets Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Assets Breakdown</CardTitle>
                <CardDescription>Distribution of your assets by category</CardDescription>
              </CardHeader>
              <CardContent>
                {assetsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetsChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {assetsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No assets added yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Liabilities Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Liabilities Breakdown</CardTitle>
                <CardDescription>Distribution of your debts by category</CardDescription>
              </CardHeader>
              <CardContent>
                {liabilitiesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={liabilitiesChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {liabilitiesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No liabilities added yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Asset Management</h3>
            <Dialog open={showAssetForm} onOpenChange={setShowAssetForm}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-asset">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>
                    Add a new asset to track your net worth
                  </DialogDescription>
                </DialogHeader>
                <AssetForm onSuccess={() => setShowAssetForm(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {assets.map((asset) => (
              <Card key={asset.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        {asset.assetType === 'cash_liquid' && <DollarSign className="h-5 w-5 text-blue-600" />}
                        {asset.assetType === 'investments' && <TrendingUp className="h-5 w-5 text-green-600" />}
                        {asset.assetType === 'real_estate' && <Building className="h-5 w-5 text-red-600" />}
                        {asset.assetType === 'vehicles' && <Car className="h-5 w-5 text-purple-600" />}
                        {asset.assetType === 'business' && <Briefcase className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold" data-testid={`text-asset-name-${asset.id}`}>{asset.assetName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{asset.assetType.replace('_', ' ')}</Badge>
                          {asset.subcategory && <Badge variant="secondary">{asset.subcategory}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold" data-testid={`text-asset-value-${asset.id}`}>
                        {formatCurrency(asset.currentValue)}
                      </div>
                      {asset.ownershipPercentage !== "100" && (
                        <div className="text-sm text-muted-foreground">
                          {asset.ownershipPercentage}% ownership
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {assets.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    No assets added yet. Click "Add Asset" to get started.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Liability Management</h3>
            <Dialog open={showLiabilityForm} onOpenChange={setShowLiabilityForm}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-liability">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Liability
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Liability</DialogTitle>
                  <DialogDescription>
                    Add a new debt or liability to track your net worth
                  </DialogDescription>
                </DialogHeader>
                <LiabilityForm onSuccess={() => setShowLiabilityForm(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {liabilities.map((liability) => (
              <Card key={liability.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                        {liability.liabilityType === 'consumer_debt' && <CreditCard className="h-5 w-5 text-red-600" />}
                        {liability.liabilityType === 'vehicle_loans' && <Car className="h-5 w-5 text-orange-600" />}
                        {liability.liabilityType === 'real_estate' && <Building className="h-5 w-5 text-yellow-600" />}
                        {liability.liabilityType === 'education' && <GraduationCap className="h-5 w-5 text-purple-600" />}
                        {liability.liabilityType === 'business' && <Briefcase className="h-5 w-5 text-blue-600" />}
                        {liability.liabilityType === 'taxes_bills' && <Receipt className="h-5 w-5 text-pink-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold" data-testid={`text-liability-name-${liability.id}`}>{liability.liabilityName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{liability.liabilityType.replace('_', ' ')}</Badge>
                          {liability.subcategory && <Badge variant="secondary">{liability.subcategory}</Badge>}
                        </div>
                        {liability.interestRate && (
                          <div className="text-sm text-muted-foreground">
                            {liability.interestRate}% APR
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600" data-testid={`text-liability-balance-${liability.id}`}>
                        {formatCurrency(liability.currentBalance)}
                      </div>
                      {liability.monthlyPayment && (
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(liability.monthlyPayment)}/month
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {liabilities.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    No liabilities added yet. Click "Add Liability" to get started.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Trend</CardTitle>
              <CardDescription>Track your net worth progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="netWorth" stroke="#2563eb" strokeWidth={3} name="Net Worth" />
                    <Line type="monotone" dataKey="assets" stroke="#059669" strokeWidth={2} name="Total Assets" />
                    <Line type="monotone" dataKey="liabilities" stroke="#dc2626" strokeWidth={2} name="Total Liabilities" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No historical data yet. Create your first snapshot to start tracking trends.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}