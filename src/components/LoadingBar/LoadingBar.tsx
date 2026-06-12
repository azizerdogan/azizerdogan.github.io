import { useEffect } from 'react';
import cubesImage from '../../assets/images/Loading Cubes.png';
import styles from './LoadingBar.module.css';

type LoadingBarProps = {
  durationMs?: number;
  onComplete: () => void;
};

export function LoadingBar({ durationMs = 3500, onComplete }: LoadingBarProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <div className={styles.trackOverlay} aria-hidden="true">
      <img src={cubesImage} alt="" className={styles.cubes} draggable={false} />
    </div>
  );
}
