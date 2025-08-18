import { QueryClient } from "@tanstack/react-query";
import type { QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// List of API endpoints that should return dummy data
const DUMMY_ENDPOINTS = [
  "/api/credit-cards",
  "/api/monthly-payments", 
  "/api/loans",
  "/api/assets",
  "/api/expenses",
  "/api/business-revenue",
  "/api/business-profiles",
  "/api/income",
  "/api/business-credit-cards",
  "/api/business-expenses",
  "/api/investments",
  "/api/business-loans",
  "/api/vendors",
  "/api/purchase-orders",
  "/api/tax-documents",
  "/api/sales-tax-settings",
  "/api/business-info",
  "/api/payment-methods"
];

// Function to get dummy data for specific endpoints
const getDummyData = (url: string): any => {
  if (url.includes("/api/credit-cards")) {
    return [
      {
        id: "1",
        name: "Chase Sapphire Preferred",
        balance: "2500.50",
        creditLimit: "10000.00",
        minimumPayment: "125.00",
        interestRate: "18.99",
        dueDate: 15
      },
      {
        id: "2", 
        name: "American Express Gold",
        balance: "1200.75",
        creditLimit: "5000.00",
        minimumPayment: "60.00",
        interestRate: "22.99",
        dueDate: 28
      }
    ];
  }
  
  if (url.includes("/api/loans")) {
    return [
      {
        id: "1",
        name: "Auto Loan - Honda Civic",
        balance: "15000.00",
        monthlyPayment: "350.00",
        interestRate: "4.5",
        termMonths: "60",
        originalAmount: "25000.00",
        loanType: "auto"
      },
      {
        id: "2",
        name: "Personal Loan",
        balance: "8500.00", 
        monthlyPayment: "200.00",
        interestRate: "8.99",
        termMonths: "48",
        originalAmount: "10000.00",
        loanType: "personal"
      }
    ];
  }
  
  if (url.includes("/api/income")) {
    return [
      {
        id: "1",
        name: "Software Engineer Salary",
        source: "Software Engineer Salary",
        amount: "8500.00",
        frequency: "monthly",
        description: "Primary job income",
        nextPayDate: "2025-08-25",
        category: "salary"
      },
      {
        id: "2",
        name: "Freelance Projects",
        source: "Freelance Projects", 
        amount: "1200.00",
        frequency: "monthly",
        description: "Side project income",
        nextPayDate: "2025-08-30",
        category: "freelance"
      },
      {
        id: "3",
        name: "Investment Dividends",
        source: "Investment Dividends",
        amount: "450.00", 
        frequency: "quarterly",
        description: "Stock dividends",
        nextPayDate: "2025-09-15",
        category: "investment"
      }
    ];
  }
  
  if (url.includes("/api/assets")) {
    return [
      {
        id: "1",
        name: "Primary Checking Account",
        category: "checking",
        value: "5500.00",
        currentValue: "5500.00"
      },
      {
        id: "2",
        name: "Emergency Savings",
        category: "savings", 
        value: "15000.00",
        currentValue: "15000.00"
      },
      {
        id: "3",
        name: "Investment Portfolio",
        category: "investment",
        value: "35000.00",
        currentValue: "35000.00"
      }
    ];
  }
  
  if (url.includes("/api/business-profiles")) {
    return [
      {
        id: "1",
        businessName: "BizBook Solutions LLC",
        address: "123 Business Ave",
        city: "San Francisco", 
        state: "CA",
        zipCode: "94102",
        phone: "(555) 123-4567",
        email: "info@bizbook.com"
      }
    ];
  }
  
  if (url.includes("/api/vendors")) {
    return [
      {
        id: "1",
        companyName: "Office Supply Co",
        contactName: "John Smith",
        email: "john@officesupply.com",
        phone: "(555) 987-6543",
        address: "456 Supply Street"
      },
      {
        id: "2",
        companyName: "Tech Services Inc",
        contactName: "Jane Doe", 
        email: "jane@techservices.com",
        phone: "(555) 246-8135",
        address: "789 Tech Blvd"
      }
    ];
  }
  
  // Return empty array for all other endpoints
  return [];
};

// Function to check if an endpoint should return dummy data
const shouldReturnDummyData = (url: string): boolean => {
  // Check if it's one of our dummy endpoints
  const isDummyEndpoint = DUMMY_ENDPOINTS.some(endpoint => url.includes(endpoint));
  
  // Also handle query parameters (like expenses with date ranges)
  if (url.includes("/api/expenses?")) return true;
  
  return isDummyEndpoint;
};

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Return dummy data for specified endpoints
    if (shouldReturnDummyData(url)) {
      console.log(`Returning dummy data for: ${url}`);
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 200));
      return getDummyData(url) as any;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
      retry: 1, // Only retry once instead of false
      retryDelay: 1000, // 1 second delay between retries
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});
