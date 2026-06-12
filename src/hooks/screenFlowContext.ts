import { createContext } from 'react';

export type Screen = 'black' | 'boot' | 'login' | 'welcome' | 'desktop';

export type ScreenFlowContextValue = {
  screen: Screen;
  goTo: (screen: Screen) => void;
  restart: () => void;
};

export const ScreenFlowContext = createContext<ScreenFlowContextValue | null>(null);
