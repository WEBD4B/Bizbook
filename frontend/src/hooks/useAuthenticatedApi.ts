import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiRequest } from "@/lib/api";

// Custom hook for queries that automatically includes Clerk token
export function useAuthenticatedQuery<TData = unknown, TError = Error>(
  queryKey: (string | number)[],
  queryFn: (token: string | null) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getToken();
      return queryFn(token);
    },
    ...options,
  });
}

// Custom hook for mutations that automatically includes Clerk token
export function useAuthenticatedMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables, token: string | null) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  const { getToken } = useAuth();
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const token = await getToken();
      return mutationFn(variables, token);
    },
    ...options,
  });
}

// Simplified API request with auth
export function useApiRequest() {
  const { getToken } = useAuth();
  
  return async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    return apiRequest(endpoint, options, token);
  };
}
