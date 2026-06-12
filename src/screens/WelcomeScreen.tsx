import { useEffect } from 'react';
import { CrtOverlay } from '../components/CrtOverlay/CrtOverlay';
import { useSound } from '../hooks/useSound';
import styles from './WelcomeScreen.module.css';

type WelcomeScreenProps = {
  onComplete?: () => void;
};

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const playLogon = useSound('logon');

  useEffect(() => {
    playLogon();

    if (!onComplete) {
      return;
    }

    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [playLogon, onComplete]);

  return (
    <div className={`xp-screen ${styles.screen}`}>
      <div className={styles.bgPaint}>
        <div className={styles.topBar} />
        <div className={styles.mainBg}>
          <CrtOverlay variant="subtle" embedded />
        </div>
        <div className={styles.bottomBar} />
      </div>

      <div className={styles.uiLayer}>
        <div className={styles.topBarSpacer} />
        <div className={styles.main}>
          <p className={styles.welcomeText}>welcome</p>
        </div>
        <div className={styles.bottomBarSpacer} />
      </div>
    </div>
  );
}
