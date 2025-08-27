// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
export const tokenManager = {
  getToken: () => localStorage.getItem('auth_token'),
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  removeToken: () => localStorage.removeItem('auth_token'),
  isAuthenticated: () => !!localStorage.getItem('auth_token')
};

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any[];
  total?: number;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  token: string;
}

// API Request wrapper with authentication
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  clerkToken?: string | null
): Promise<ApiResponse> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('Making API request to:', url);
  console.log('Options:', options);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  // Use Clerk token if provided, otherwise fallback to localStorage
  const token = clerkToken || tokenManager.getToken();
  
  // For development, don't require a token - let backend handle the fallback
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (process.env.NODE_ENV !== 'development') {
    console.warn('No authentication token available');
  }

  console.log('Headers:', headers);

  try {
    console.log('Making fetch request...');
    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('Response not ok:', response.status, data);
      console.error('Full validation details:', JSON.stringify(data.details, null, 2));
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        tokenManager.removeToken();
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      const errorMessage = data.details?.map((d: any) => `${d.path?.join('.')}: ${d.message}`).join(', ') || data.error;
      throw new Error(errorMessage || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.success && response.data) {
      tokenManager.setToken(response.data.token);
      return response.data;
    }
    throw new Error(response.error || 'Registration failed');
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.success && response.data) {
      tokenManager.setToken(response.data.token);
      return response.data;
    }
    throw new Error(response.error || 'Login failed');
  },

  async logout() {
    tokenManager.removeToken();
    window.location.href = '/auth';
  },

  async verifyToken() {
    const response = await apiRequest('/auth/verify', { method: 'POST' });
    return response.success && response.data?.valid;
  },

  async refreshToken(): Promise<string> {
    const response = await apiRequest('/auth/refresh', { method: 'POST' });
    if (response.success && response.data?.token) {
      tokenManager.setToken(response.data.token);
      return response.data.token;
    }
    throw new Error('Token refresh failed');
  }
};

// Generic CRUD API functions
export const createCrudApi = <T = any>(endpoint: string) => ({
  async getAll(clerkToken?: string): Promise<T[]> {
    const response = await apiRequest(endpoint, {}, clerkToken);
    return response.data || [];
  },

  async getById(id: string, clerkToken?: string): Promise<T> {
    const response = await apiRequest(`${endpoint}/${id}`, {}, clerkToken);
    return response.data;
  },

  async create(data: Partial<T>, clerkToken?: string): Promise<T> {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  },

  async update(id: string, data: Partial<T>, clerkToken?: string): Promise<T> {
    const response = await apiRequest(`${endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  },

  async delete(id: string, clerkToken?: string): Promise<void> {
    await apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }, clerkToken);
  }
});

// Specific API endpoints
export const creditCardsApi = createCrudApi('/credit-cards');
export const loansApi = createCrudApi('/loans');
export const monthlyPaymentsApi = createCrudApi('/monthly-payments');
export const incomeApi = createCrudApi('/income');
export const paymentsApi = {
  ...createCrudApi('/payments'),
  async markAsPaid(id: string, data: { confirmationNumber?: string; notes?: string }, clerkToken?: string): Promise<any> {
    const response = await apiRequest(`/payments/${id}/mark-paid`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  }
};
export const expensesApi = createCrudApi('/expenses');
export const savingsGoalsApi = createCrudApi('/savings-goals');
export const budgetsApi = createCrudApi('/budgets');
export const investmentsApi = createCrudApi('/investments');
export const assetsApi = createCrudApi('/assets');
export const liabilitiesApi = createCrudApi('/liabilities');
export const businessProfilesApi = createCrudApi('/business-profiles');
export const vendorsApi = createCrudApi('/vendors');
export const purchaseOrdersApi = createCrudApi('/purchase-orders');
export const businessCreditCardsApi = createCrudApi('/business-credit-cards');
export const businessLoansApi = createCrudApi('/business-loans');

// Specialized API functions
export const netWorthApi = {
  async getSnapshots(clerkToken?: string) {
    const response = await apiRequest('/net-worth-snapshots', {}, clerkToken);
    return response.data || [];
  },

  async getLatest(clerkToken?: string) {
    const response = await apiRequest('/net-worth-snapshots/latest', {}, clerkToken);
    return response.data;
  },

  async createSnapshot(data: any, clerkToken?: string) {
    const response = await apiRequest('/net-worth-snapshots', {
      method: 'POST',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  },

  async calculateNetWorth(clerkToken?: string) {
    const response = await apiRequest('/calculate-net-worth', { method: 'POST' }, clerkToken);
    return response.data;
  }
};

export const calculationsApi = {
  async calculatePayoff(data: {
    balance: number;
    interestRate: number;
    monthlyPayment: number;
    extraPayment?: number;
  }, clerkToken?: string) {
    const response = await apiRequest('/calculate-payoff', {
      method: 'POST',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  }
};

export const businessRevenueApi = {
  async getAll(clerkToken?: string) {
    const response = await apiRequest('/business-revenue', {}, clerkToken);
    return response.data || [];
  },

  async create(data: any, clerkToken?: string) {
    const response = await apiRequest('/business-revenue', {
      method: 'POST',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  }
};

export const businessExpensesApi = {
  async getAll(clerkToken?: string) {
    const response = await apiRequest('/business-expenses', {}, clerkToken);
    return response.data || [];
  },

  async create(data: any, clerkToken?: string) {
    const response = await apiRequest('/business-expenses', {
      method: 'POST',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  }
};

export const purchaseOrderItemsApi = {
  async getByPurchaseOrder(poId: string, clerkToken?: string) {
    const response = await apiRequest(`/purchase-orders/${poId}/items`, {}, clerkToken);
    return response.data || [];
  },

  async create(data: any, clerkToken?: string) {
    const response = await apiRequest('/purchase-order-items', {
      method: 'POST',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  },

  async update(id: string, data: any, clerkToken?: string) {
    const response = await apiRequest(`/purchase-order-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, clerkToken);
    return response.data;
  },

  async delete(id: string, clerkToken?: string) {
    await apiRequest(`/purchase-order-items/${id}`, { method: 'DELETE' }, clerkToken);
  }
};
