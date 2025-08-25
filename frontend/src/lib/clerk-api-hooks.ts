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
      const response = await apiRequest('/api/credit-cards', {}, token);
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
      const response = await apiRequest('/api/credit-cards', {
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
      const response = await apiRequest('/api/loans', {}, token);
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
      const response = await apiRequest('/api/loans', {
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
      const response = await apiRequest('/api/monthly-payments', {}, token);
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
      const response = await apiRequest('/api/monthly-payments', {
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
      const response = await apiRequest('/api/incomes', {}, token);
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
      const response = await apiRequest('/api/incomes', {
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
