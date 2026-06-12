import { createContext, useContext } from 'react';

type CrtContextValue = {
  crtEnabled: boolean;
  toggleCrt: () => void;
};

export const CrtContext = createContext<CrtContextValue | null>(null);

export function useCrt() {
  const context = useContext(CrtContext);

  if (!context) {
    throw new Error('useCrt must be used within CrtProvider');
  }

  return context;
}
