import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface ApiContextType {
  getToken: () => Promise<string | null>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  const value: ApiContextType = {
    getToken
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}
