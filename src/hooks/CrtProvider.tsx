import { useMemo, useState, type ReactNode } from 'react';
import { CrtContext } from './crtContext';

const STORAGE_KEY = 'erdoganxp-crt-enabled';
const LEGACY_STORAGE_KEY = 'erdoganxp-crt';

function readStoredCrt(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy !== null) {
      const migrated = legacy !== 'true';
      localStorage.setItem(STORAGE_KEY, String(migrated));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return migrated;
    }
  } catch {
    // ignore
  }

  return true;
}

export function CrtProvider({ children }: { children: ReactNode }) {
  const [crtEnabled, setCrtEnabled] = useState(readStoredCrt);

  const toggleCrt = () => {
    setCrtEnabled((enabled) => {
      const next = !enabled;

      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }

      return next;
    });
  };

  const value = useMemo(
    () => ({
      crtEnabled,
      toggleCrt,
    }),
    [crtEnabled],
  );

  return <CrtContext.Provider value={value}>{children}</CrtContext.Provider>;
}
