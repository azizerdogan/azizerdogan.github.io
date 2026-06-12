import { useEffect, useRef, useState, type MouseEvent } from 'react';
import crtIcon from '../../assets/icons/CRT Icon.png';
import startButtonHover from '../../assets/icons/Start Button Hover.png';
import startButtonIdle from '../../assets/icons/Start Button Idle.png';
import startButtonPressed from '../../assets/icons/Start Button Pressed.png';
import volumeIcon from '../../assets/icons/Volume Icon.png';
import { useCrt } from '../../hooks/crtContext';
import { VolumeSlider } from '../VolumeSlider/VolumeSlider';
import styles from './Taskbar.module.css';

type StartButtonVisual = 'idle' | 'hover' | 'pressed';

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getStartButtonImage(visual: StartButtonVisual) {
  switch (visual) {
    case 'hover':
      return startButtonHover;
    case 'pressed':
      return startButtonPressed;
    default:
      return startButtonIdle;
  }
}

export type TaskbarProgram = {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
};

type TaskbarProps = {
  startMenuOpen: boolean;
  programs?: TaskbarProgram[];
  onStartClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function Taskbar({ startMenuOpen, programs = [], onStartClick }: TaskbarProps) {
  const { crtEnabled, toggleCrt } = useCrt();
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [startHovered, setStartHovered] = useState(false);
  const volumeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(formatClock(new Date()));
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  function toggleVolume() {
    setVolumeOpen((open) => !open);
  }

  const startVisual: StartButtonVisual = startMenuOpen
    ? 'pressed'
    : startHovered
      ? 'hover'
      : 'idle';

  return (
    <footer className={styles.taskbar}>
      <div className={styles.leading}>
        <button
          type="button"
          className={`${styles.startBtn} ${startMenuOpen ? styles.startBtnActive : ''}`}
          aria-label="Start"
          aria-expanded={startMenuOpen}
          aria-haspopup="menu"
          onClick={onStartClick}
          onMouseEnter={() => setStartHovered(true)}
          onMouseLeave={() => setStartHovered(false)}
        >
          <img
            src={getStartButtonImage(startVisual)}
            alt=""
            className={styles.startBtnBg}
            draggable={false}
          />
        </button>

        <div className={styles.tasklist}>
          {programs.map((program) => (
            <button
              key={program.id}
              type="button"
              className={`${styles.programTab} ${program.active ? styles.programTabActive : ''}`}
              onClick={program.onClick}
            >
              <img
                src={program.icon}
                alt=""
                className={styles.programTabIcon}
                draggable={false}
              />
              <span className={styles.programTabLabel}>{program.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.trailing}>
        <div className={styles.systemTray}>
          <div className={styles.trayIcons}>
            <button
              type="button"
              className={`${styles.crtBtn} ${crtEnabled ? styles.crtBtnOn : styles.crtBtnOff}`}
              onClick={toggleCrt}
              aria-label="CRT effect"
              aria-pressed={crtEnabled}
            >
              <img src={crtIcon} alt="" className={styles.trayIcon} draggable={false} />
            </button>
            <div className={styles.volumeWrap}>
              <button
                ref={volumeBtnRef}
                type="button"
                className={styles.volumeBtn}
                onClick={toggleVolume}
                aria-label="Volume"
                aria-expanded={volumeOpen}
              >
                <img src={volumeIcon} alt="" className={styles.trayIcon} draggable={false} />
              </button>
              {volumeOpen && (
                <VolumeSlider
                  triggerRef={volumeBtnRef}
                  onClose={() => setVolumeOpen(false)}
                />
              )}
            </div>
            <span className={styles.clock}>{clock}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
