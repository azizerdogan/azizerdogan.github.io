import { useEffect, useRef, useState } from 'react';

import logOffIcon from '../assets/icons/Log Off Button.png';

import erdoganXpLogo from '../assets/images/ErdoganXP.png';

import { CrtOverlay } from '../components/CrtOverlay/CrtOverlay';

import { ShutdownDialog } from '../components/ShutdownDialog/ShutdownDialog';

import { UserProfile } from '../components/UserProfile/UserProfile';

import styles from './LoginScreen.module.css';



type LoginScreenProps = {

  onLogin: () => void;

  onRestart: () => void;

};



export function LoginScreen({ onLogin, onRestart }: LoginScreenProps) {

  const [dialogOpen, setDialogOpen] = useState(false);
  const [greyscaled, setGreyscaled] = useState(false);
  const [dissolveFast, setDissolveFast] = useState(false);
  const greyscaleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (greyscaleTimerRef.current) {
        clearTimeout(greyscaleTimerRef.current);
      }
    };
  }, []);

  function openDialog() {
    setDialogOpen(true);
    setDissolveFast(false);
    setGreyscaled(false);

    if (greyscaleTimerRef.current) {
      clearTimeout(greyscaleTimerRef.current);
    }

    greyscaleTimerRef.current = setTimeout(() => {
      setGreyscaled(true);
    }, 1000);
  }

  function closeDialog() {
    setDissolveFast(true);
    setGreyscaled(false);
    setDialogOpen(false);

    if (greyscaleTimerRef.current) {
      clearTimeout(greyscaleTimerRef.current);
      greyscaleTimerRef.current = null;
    }
  }

  function handleRestart() {
    closeDialog();
    onRestart();
  }



  return (

    <div className={`xp-screen ${styles.screen}`}>

      <div

        className={`${styles.loginContent} ${greyscaled ? styles.loginGreyscaled : ''} ${dissolveFast ? styles.loginDissolve : ''}`}

      >

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

            <div className={styles.cluster}>

              <div className={styles.leftCol}>

                <img

                  src={erdoganXpLogo}

                  alt="ErdoganXP"

                  className={styles.brandLogo}

                  draggable={false}

                />

                <p className={styles.instruction}>

                  To begin, click on Aziz Erdogan to log in

                </p>

              </div>



              <div className={styles.divider} />



              <div className={styles.rightCol}>

                <UserProfile onClick={onLogin} />

              </div>

            </div>

          </div>



          <div className={styles.bottomBar}>

            <div className={styles.footerLeft}>

              <button

                className={styles.logOffBtn}

                type="button"

                onClick={openDialog}

                aria-label="Open restart dialog"

              >

                <img

                  src={logOffIcon}

                  alt=""

                  className={styles.logOffIcon}

                  draggable={false}

                />

              </button>

              <span className={styles.restartLabel}>Restart ErdoganXP</span>

            </div>



            <p className={styles.footerRight}>

              After you login, you're obligated to hire me!

              <br />

              Just kidding, feel free to browse around.

            </p>

          </div>

        </div>

      </div>



      {dialogOpen && (

        <ShutdownDialog

          onRestart={handleRestart}

          onClose={closeDialog}

        />

      )}

    </div>

  );

}


