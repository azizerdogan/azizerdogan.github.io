import windowsXpLogo from '../../assets/images/Windows XP Logo.png';
import logOffIcon from '../../assets/icons/Log Off Button.png';
import powerOffIcon from '../../assets/icons/Power off Button.png';
import { useSound } from '../../hooks/useSound';
import styles from './ShutdownDialog.module.css';

type ShutdownDialogProps = {
  onRestart: () => void;
  onClose: () => void;
};

export function ShutdownDialog({ onRestart, onClose }: ShutdownDialogProps) {
  const playError = useSound('error');
  const playShutdown = useSound('shutdown');

  function handleRestart() {
    playShutdown();
    setTimeout(onRestart, 600);
  }

  function handleShutDown() {
    playError();
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} role="dialog" aria-labelledby="shutdown-dialog-title">
        <div className={styles.titleBar}>
          <span id="shutdown-dialog-title" className={styles.titleText}>
            Turn off ErdoganXP
          </span>
          <img
            src={windowsXpLogo}
            alt=""
            className={styles.titleLogo}
            draggable={false}
          />
        </div>

        <div className={styles.mainPanel}>
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${styles.restartBtn}`}
              type="button"
              onClick={handleRestart}
            >
              <span className={styles.restartIconWrap} aria-hidden="true">
                <img
                  src={logOffIcon}
                  alt=""
                  className={styles.actionIcon}
                  draggable={false}
                />
              </span>
              <span className={styles.actionLabel}>Restart</span>
            </button>

            <button
              className={styles.actionBtn}
              type="button"
              onClick={handleShutDown}
              disabled
            >
              <span className={styles.shutdownIconWrap} aria-hidden="true">
                <img
                  src={powerOffIcon}
                  alt=""
                  className={styles.actionIcon}
                  draggable={false}
                />
              </span>
              <span className={styles.actionLabel}>Shut Down</span>
            </button>
          </div>
        </div>

        <div className={styles.footerBar}>
          <button className={styles.cancelBtn} type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
