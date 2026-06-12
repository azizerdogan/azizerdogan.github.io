import { useMemo, useState, type ReactNode } from 'react';
import { VolumeContext } from './volumeContext';

const STORAGE_KEY = 'erdoganxp-volume';

function readStoredVolume(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return 0.8;
    }

    const parsed = Number(stored);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
      return parsed;
    }
  } catch {
    // ignore
  }

  return 0.8;
}

export function VolumeProvider({ children }: { children: ReactNode }) {
  const [volume, setVolumeState] = useState(readStoredVolume);

  const setVolume = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolumeState(clamped);

    try {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      // ignore
    }
  };

  const value = useMemo(
    () => ({
      volume,
      setVolume,
    }),
    [volume],
  );

  return <VolumeContext.Provider value={value}>{children}</VolumeContext.Provider>;
}
