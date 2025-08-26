import { apiRequest } from './api';
import { useAuth } from '@clerk/clerk-react';

// Create a function that automatically includes the Clerk token
export async function apiRequestWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  // This will be called from within React components where useAuth is available
  const { getToken } = useAuth();
  const token = await getToken();
  return apiRequest(endpoint, options, token);
}

// For use outside of React components, we'll need to pass the token explicitly
export { apiRequest };
