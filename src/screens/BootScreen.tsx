import loaderImage from '../assets/images/ErdoganXP Loader.png';
import { LoadingBar } from '../components/LoadingBar/LoadingBar';
import styles from './BootScreen.module.css';

type BootScreenProps = {
  onBootComplete: () => void;
};

export function BootScreen({ onBootComplete }: BootScreenProps) {
  return (
    <div className={`xp-screen ${styles.screen}`}>
      <div className={styles.center}>
        <div className={styles.loaderWrap}>
          <img
            src={loaderImage}
            alt="ErdoganXP"
            className={styles.loader}
            draggable={false}
          />
          <LoadingBar onComplete={onBootComplete} />
        </div>
      </div>

      <div className={styles.bottomLeft}>
        <p>For the best experience</p>
        <p>Enter Full Screen (F11)</p>
      </div>

      <p className={styles.bottomRight}>Portfolio</p>
    </div>
  );
}
