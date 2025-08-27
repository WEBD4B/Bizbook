import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { 
  creditCardsApi, 
  loansApi, 
  monthlyPaymentsApi, 
  incomeApi, 
  paymentsApi, 
  expensesApi, 
  savingsGoalsApi, 
  budgetsApi, 
  investmentsApi, 
  assetsApi, 
  liabilitiesApi, 
  businessProfilesApi, 
  vendorsApi, 
  purchaseOrdersApi, 
  businessCreditCardsApi, 
  businessLoansApi,
  netWorthApi,
  calculationsApi,
  businessRevenueApi,
  businessExpensesApi,
  purchaseOrderItemsApi
} from "../lib/api";

// Credit Cards hooks
export const useCreditCards = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["credit-cards"],
    queryFn: async () => {
      const token = await getToken();
      return creditCardsApi.getAll(token);
    },
  });
};

export const useCreditCard = (id: string) =>
  useQuery({
    queryKey: ["credit-cards", id],
    queryFn: () => creditCardsApi.getById(id),
    enabled: !!id,
  });

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: creditCardsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
};

export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      creditCardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
};

export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: creditCardsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
};

// Loans hooks
export const useLoans = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const token = await getToken();
      return loansApi.getAll(token);
    },
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      loansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
};

// Monthly Payments hooks
export const useMonthlyPayments = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["monthly-payments"],
    queryFn: async () => {
      const token = await getToken();
      return monthlyPaymentsApi.getAll(token);
    },
  });
};

export const useCreateMonthlyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: monthlyPaymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-payments"] });
    },
  });
};

export const useUpdateMonthlyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      monthlyPaymentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-payments"] });
    },
  });
};

export const useDeleteMonthlyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: monthlyPaymentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-payments"] });
    },
  });
};

// Income hooks
export const useIncome = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["income"],
    queryFn: async () => {
      const token = await getToken();
      return incomeApi.getAll(token);
    },
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incomeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
    },
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      incomeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
    },
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incomeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
    },
  });
};

// Payments hooks
export const usePayments = () =>
  useQuery({
    queryKey: ["payments"],
    queryFn: paymentsApi.getAll,
  });

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const useMarkPaymentAsPaid = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { confirmationNumber?: string; notes?: string } }) => {
      const token = await getToken();
      return paymentsApi.markAsPaid(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-payments"] });
    },
  });
};

// Expenses hooks
export const useExpenses = () =>
  useQuery({
    queryKey: ["expenses"],
    queryFn: expensesApi.getAll,
  });

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      expensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

// Savings Goals hooks
export const useSavingsGoals = () =>
  useQuery({
    queryKey: ["savings-goals"],
    queryFn: savingsGoalsApi.getAll,
  });

export const useCreateSavingsGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savingsGoalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
};

export const useUpdateSavingsGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      savingsGoalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
};

export const useDeleteSavingsGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savingsGoalsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
};

// Budgets hooks
export const useBudgets = () =>
  useQuery({
    queryKey: ["budgets"],
    queryFn: budgetsApi.getAll,
  });

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

// Investments hooks
export const useInvestments = () =>
  useQuery({
    queryKey: ["investments"],
    queryFn: investmentsApi.getAll,
  });

export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
};

export const useUpdateInvestment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      investmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
};

export const useDeleteInvestment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
};

// Assets hooks
export const useAssets = () =>
  useQuery({
    queryKey: ["assets"],
    queryFn: assetsApi.getAll,
  });

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      assetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

// Liabilities hooks
export const useLiabilities = () =>
  useQuery({
    queryKey: ["liabilities"],
    queryFn: liabilitiesApi.getAll,
  });

export const useCreateLiability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: liabilitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
    },
  });
};

export const useUpdateLiability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      liabilitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
    },
  });
};

export const useDeleteLiability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: liabilitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
    },
  });
};

// Business Profiles hooks
export const useBusinessProfiles = () =>
  useQuery({
    queryKey: ["business-profiles"],
    queryFn: businessProfilesApi.getAll,
  });

export const useCreateBusinessProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessProfilesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-profiles"] });
    },
  });
};

export const useUpdateBusinessProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      businessProfilesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-profiles"] });
    },
  });
};

// Vendors hooks
export const useVendors = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const token = await getToken();
      return vendorsApi.getAll(token);
    },
  });
};

export const useCreateVendor = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      return vendorsApi.create(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

export const useUpdateVendor = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = await getToken();
      return vendorsApi.update(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vendorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

// Purchase Orders hooks
export const usePurchaseOrders = () =>
  useQuery({
    queryKey: ["purchase-orders"],
    queryFn: purchaseOrdersApi.getAll,
  });

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseOrdersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      purchaseOrdersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseOrdersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

// Purchase Order Items hooks
export const usePurchaseOrderItems = (poId: string) =>
  useQuery({
    queryKey: ["purchase-order-items", poId],
    queryFn: () => purchaseOrderItemsApi.getByPurchaseOrder(poId),
    enabled: !!poId,
  });

export const useCreatePurchaseOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseOrderItemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order-items"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useUpdatePurchaseOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      purchaseOrderItemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order-items"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useDeletePurchaseOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseOrderItemsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order-items"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

// Business Credit Cards hooks
export const useBusinessCreditCards = () =>
  useQuery({
    queryKey: ["business-credit-cards"],
    queryFn: businessCreditCardsApi.getAll,
  });

export const useCreateBusinessCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessCreditCardsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-credit-cards"] });
    },
  });
};

export const useUpdateBusinessCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      businessCreditCardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-credit-cards"] });
    },
  });
};

export const useDeleteBusinessCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessCreditCardsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-credit-cards"] });
    },
  });
};

// Business Loans hooks
export const useBusinessLoans = () =>
  useQuery({
    queryKey: ["business-loans"],
    queryFn: businessLoansApi.getAll,
  });

export const useCreateBusinessLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessLoansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-loans"] });
    },
  });
};

export const useUpdateBusinessLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      businessLoansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-loans"] });
    },
  });
};

export const useDeleteBusinessLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessLoansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-loans"] });
    },
  });
};

// Business Revenue hooks
export const useBusinessRevenue = () =>
  useQuery({
    queryKey: ["business-revenue"],
    queryFn: businessRevenueApi.getAll,
  });

export const useCreateBusinessRevenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessRevenueApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-revenue"] });
    },
  });
};

// Business Expenses hooks
export const useBusinessExpenses = () =>
  useQuery({
    queryKey: ["business-expenses"],
    queryFn: businessExpensesApi.getAll,
  });

export const useCreateBusinessExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessExpensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-expenses"] });
    },
  });
};

// Net Worth hooks
export const useNetWorthSnapshots = () =>
  useQuery({
    queryKey: ["net-worth-snapshots"],
    queryFn: netWorthApi.getSnapshots,
  });

export const useLatestNetWorth = () =>
  useQuery({
    queryKey: ["net-worth-snapshots", "latest"],
    queryFn: netWorthApi.getLatest,
  });

export const useCreateNetWorthSnapshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: netWorthApi.createSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["net-worth-snapshots"] });
    },
  });
};

export const useCalculateNetWorth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: netWorthApi.calculateNetWorth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["net-worth-snapshots"] });
    },
  });
};

// Calculations hooks
export const useCalculatePayoff = () =>
  useMutation({
    mutationFn: calculationsApi.calculatePayoff,
  });
