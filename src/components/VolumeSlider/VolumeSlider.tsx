import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { useVolume } from '../../hooks/volumeContext';
import styles from './VolumeSlider.module.css';

const TRACK_HEIGHT = 75;
const THUMB_HEIGHT = 9;

type VolumeSliderProps = {
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
};

function volumeFromPointer(clientY: number, trackTop: number) {
  const relativeY = clientY - trackTop;
  const usable = TRACK_HEIGHT - THUMB_HEIGHT;
  const fromBottom = TRACK_HEIGHT - relativeY - THUMB_HEIGHT / 2;
  return Math.min(1, Math.max(0, fromBottom / usable));
}

export function VolumeSlider({ onClose, triggerRef }: VolumeSliderProps) {
  const { volume, setVolume } = useVolume();
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        panelRef.current?.contains(target) ||
        triggerRef?.current?.contains(target)
      ) {
        return;
      }

      onClose();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose, triggerRef]);

  function updateFromPointer(clientY: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    setVolume(volumeFromPointer(clientY, rect.top));
  }

  function handleTrackPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
    updateFromPointer(event.clientY);

    function handleMove(moveEvent: PointerEvent) {
      updateFromPointer(moveEvent.clientY);
    }

    function handleUp() {
      setDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  const thumbOffset = volume * (TRACK_HEIGHT - THUMB_HEIGHT);

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      role="dialog"
      aria-label="Volume"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className={styles.slider}>
        <span className={styles.label}>Volume</span>
        <div className={styles.trackArea}>
          <div
            ref={trackRef}
            className={styles.track}
            onPointerDown={handleTrackPointerDown}
          >
            <div
              className={`${styles.thumb} ${dragging ? styles.thumbDragging : ''}`}
              style={{ bottom: `${thumbOffset}px` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
