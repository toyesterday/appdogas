import React, { createContext, useContext, ReactNode } from 'react';
import { Depot } from '@/types';

interface DepotContextType {
  depot: Depot;
}

const DepotContext = createContext<DepotContextType | undefined>(undefined);

export const DepotProvider = ({ children, depot }: { children: ReactNode, depot: Depot }) => {
  return (
    <DepotContext.Provider value={{ depot }}>
      {children}
    </DepotContext.Provider>
  );
};

export const useDepot = () => {
  const context = useContext(DepotContext);
  if (context === undefined) {
    throw new Error('useDepot must be used within a DepotProvider');
  }
  return context;
};