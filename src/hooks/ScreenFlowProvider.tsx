import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ScreenFlowContext, type Screen } from './screenFlowContext';

export function ScreenFlowProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('black');

  const goTo = useCallback((next: Screen) => {
    setScreen(next);
  }, []);

  const restart = useCallback(() => {
    setScreen('black');
  }, []);


  const value = useMemo(
    () => ({
      screen,
      goTo,
      restart,
    }),
    [screen, goTo, restart],
  );

  return <ScreenFlowContext.Provider value={value}>{children}</ScreenFlowContext.Provider>;
}
