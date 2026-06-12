import { useContext } from 'react';
import { ScreenFlowContext } from './screenFlowContext';

export type { Screen } from './screenFlowContext';

export function useScreenFlow() {
  const context = useContext(ScreenFlowContext);

  if (!context) {
    throw new Error('useScreenFlow must be used within ScreenFlowProvider');
  }

  return context;
}
