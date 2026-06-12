import { createContext, useContext } from 'react';

export type VolumeContextValue = {
  volume: number;
  setVolume: (value: number) => void;
};

export const VolumeContext = createContext<VolumeContextValue | null>(null);

export function useVolume() {
  const context = useContext(VolumeContext);

  if (!context) {
    throw new Error('useVolume must be used within VolumeProvider');
  }

  return context;
}
