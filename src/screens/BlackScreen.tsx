import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { preloadAssets } from '../utils/preloadAssets';
import styles from './BlackScreen.module.css';

type BlackScreenProps = {
  onReady: () => void;
};

export function BlackScreen({ onReady }: BlackScreenProps) {
  const [assetsReady, setAssetsReady] = useState(false);
  const [flickerDone, setFlickerDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    preloadAssets()
      .then(() => {
        if (!cancelled) {
          setAssetsReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAssetsReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!flickerDone || !assetsReady) {
      return;
    }

    onReady();
  }, [assetsReady, flickerDone, onReady]);

  return (
    <div className={`xp-screen ${styles.screen}`}>
      <motion.div
        className={styles.crtLayer}
        initial={{ opacity: 1, filter: 'brightness(0)' }}
        animate={
          assetsReady
            ? {
                opacity: [1, 0.35, 1, 0.2, 1, 0.55, 1, 0.15, 1],
                filter: [
                  'brightness(0)',
                  'brightness(2.4)',
                  'brightness(0.4)',
                  'brightness(2.1)',
                  'brightness(0.6)',
                  'brightness(1.8)',
                  'brightness(0.85)',
                  'brightness(1.4)',
                  'brightness(1)',
                ],
              }
            : { opacity: 1, filter: 'brightness(0)' }
        }
        transition={
          assetsReady
            ? {
                duration: 1.35,
                ease: 'linear',
                onComplete: () => setFlickerDone(true),
              }
            : undefined
        }
      />
    </div>
  );
}
