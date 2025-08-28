import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./api";

// Custom hook to make authenticated API requests
export function useAuthenticatedApi() {
  const { getToken } = useAuth();

  const authenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    return apiRequest(endpoint, options, token);
  };

  return authenticatedRequest;
}

// Credit Cards hooks with Clerk authentication
export function useCreditCards() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['creditCards'],
    queryFn: async () => {
      const token = await getToken();
      const response = await apiRequest('/credit-cards', {}, token);
      return response.data;
    },
  });
}

export function useCreditCardMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const response = await apiRequest('/credit-cards', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditCards'] });
    },
  });
}

// Loans hooks with Clerk authentication
export function useLoans() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const token = await getToken();
      const response = await apiRequest('/loans', {}, token);
      return response.data;
    },
  });
}

export function useLoanMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const response = await apiRequest('/loans', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

// Monthly Payments hooks with Clerk authentication
export function useMonthlyPayments() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['monthlyPayments'],
    queryFn: async () => {
      const token = await getToken();
      const response = await apiRequest('/monthly-payments', {}, token);
      return response.data;
    },
  });
}

export function useMonthlyPaymentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const response = await apiRequest('/monthly-payments', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyPayments'] });
    },
  });
}

// Income hooks with Clerk authentication
export function useIncomes() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const token = await getToken();
      const response = await apiRequest('/income', {}, token);
      return response.data;
    },
  });
}

export function useIncomeMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const response = await apiRequest('/income', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });
}

// Expenses hooks with Clerk authentication
export function useExpenses() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const token = await getToken();
      const response = await apiRequest('/expenses', {}, token);
      return response.data;
    },
  });
}

export function useExpenseMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const response = await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// Payments hooks with Clerk authentication
export function usePayments() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.warn('No Clerk token available for payments request');
          return [];
        }
        
        const response = await apiRequest('/payments', {}, token);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching payments:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
  });
}

export function usePaymentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const response = await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}
