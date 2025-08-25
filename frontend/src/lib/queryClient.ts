import { QueryClient } from "@tanstack/react-query";
import { apiRequest as newApiRequest } from "./api";

// Backward compatibility wrapper for the old apiRequest signature
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<any> {
  const options: RequestInit = {
    method: method.toUpperCase(),
  };

  if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  // Remove /api prefix from endpoint since API_BASE_URL already includes it
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
  
  try {
    console.log(`Making ${method} request to: ${cleanEndpoint}`, data);
    const response = await newApiRequest(cleanEndpoint, options);
    console.log('API Response:', response);
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Create a query client with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on component mount
      refetchOnReconnect: false, // Don't refetch on reconnect
      retryOnMount: false, // Don't retry on mount
    },
    mutations: {
      retry: 1,
    },
  },
});

export default queryClient;
