import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import styles from './XpWindow.module.css';

const TASKBAR_HEIGHT = 30;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const DEFAULT_WIDTH = 807;
const DEFAULT_HEIGHT = 562;

type XpWindowProps = {
  title: string;
  icon: string;
  focused?: boolean;
  hidden?: boolean;
  initialPosition?: { x: number; y: number };
  onClose: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  children: ReactNode;
};

export function XpWindow({
  title,
  icon,
  focused = true,
  hidden = false,
  initialPosition,
  onClose,
  onMinimize,
  onFocus,
  children,
}: XpWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(
    initialPosition ?? {
      x: Math.max(24, (window.innerWidth - DEFAULT_WIDTH) / 2),
      y: Math.max(24, (window.innerHeight - TASKBAR_HEIGHT - DEFAULT_HEIGHT) / 2),
    },
  );
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [isMaximized, setIsMaximized] = useState(false);

  const positionRef = useRef(position);
  const sizeRef = useRef(size);
  positionRef.current = position;
  sizeRef.current = size;

  const preMaximize = useRef<{
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);

  function clampPosition(x: number, y: number, w: number, h: number) {
    return {
      x: Math.min(Math.max(0, x), window.innerWidth - w),
      y: Math.min(Math.max(0, y), window.innerHeight - TASKBAR_HEIGHT - h),
    };
  }

  function handleTitlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || isMaximized || hidden) return;
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    e.stopPropagation();
    onFocus?.();

    const startX = e.clientX;
    const startY = e.clientY;
    const origin = { ...positionRef.current };

    function handleMove(moveEvent: PointerEvent) {
      const w = sizeRef.current.width;
      const h = sizeRef.current.height;
      const next = clampPosition(
        origin.x + (moveEvent.clientX - startX),
        origin.y + (moveEvent.clientY - startY),
        w,
        h,
      );
      positionRef.current = next;
      setPosition(next);
    }

    function handleUp() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  }

  function handleResizePointerDown(edge: string) {
    return (e: ReactPointerEvent) => {
      if (e.button !== 0 || hidden) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus?.();

      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { ...positionRef.current };
      const startSize = { ...sizeRef.current };

      function handleMove(moveEvent: PointerEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let nx = startPos.x;
        let ny = startPos.y;
        let nw = startSize.width;
        let nh = startSize.height;

        if (edge.includes('e')) nw = Math.max(MIN_WIDTH, startSize.width + dx);
        if (edge.includes('s')) nh = Math.max(MIN_HEIGHT, startSize.height + dy);
        if (edge.includes('w')) {
          nw = Math.max(MIN_WIDTH, startSize.width - dx);
          nx = startPos.x + (startSize.width - nw);
        }
        if (edge.includes('n')) {
          nh = Math.max(MIN_HEIGHT, startSize.height - dy);
          ny = startPos.y + (startSize.height - nh);
        }

        const nextPos = { x: nx, y: ny };
        const nextSize = { width: nw, height: nh };
        positionRef.current = nextPos;
        sizeRef.current = nextSize;
        setPosition(nextPos);
        setSize(nextSize);
      }

      function handleUp() {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
      }

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
    };
  }

  function handleMaximize() {
    if (isMaximized) {
      setIsMaximized(false);
      if (preMaximize.current) {
        positionRef.current = preMaximize.current.position;
        sizeRef.current = preMaximize.current.size;
        setPosition(preMaximize.current.position);
        setSize(preMaximize.current.size);
        preMaximize.current = null;
      }
    } else {
      preMaximize.current = {
        position: { ...positionRef.current },
        size: { ...sizeRef.current },
      };
      setIsMaximized(true);
    }
  }

  const windowStyle = isMaximized
    ? {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight - TASKBAR_HEIGHT,
      }
    : { left: position.x, top: position.y, width: size.width, height: size.height };

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${focused ? styles.focused : ''} ${hidden ? styles.hidden : ''}`}
      style={windowStyle}
      role="dialog"
      aria-label={title}
      aria-hidden={hidden}
      onMouseDown={() => onFocus?.()}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {!isMaximized && (
        <>
          <div className={`${styles.resizeHandle} ${styles.resizeN}`} onPointerDown={handleResizePointerDown('n')} />
          <div className={`${styles.resizeHandle} ${styles.resizeS}`} onPointerDown={handleResizePointerDown('s')} />
          <div className={`${styles.resizeHandle} ${styles.resizeE}`} onPointerDown={handleResizePointerDown('e')} />
          <div className={`${styles.resizeHandle} ${styles.resizeW}`} onPointerDown={handleResizePointerDown('w')} />
          <div className={`${styles.resizeHandle} ${styles.resizeNE}`} onPointerDown={handleResizePointerDown('ne')} />
          <div className={`${styles.resizeHandle} ${styles.resizeNW}`} onPointerDown={handleResizePointerDown('nw')} />
          <div className={`${styles.resizeHandle} ${styles.resizeSE}`} onPointerDown={handleResizePointerDown('se')} />
          <div className={`${styles.resizeHandle} ${styles.resizeSW}`} onPointerDown={handleResizePointerDown('sw')} />
        </>
      )}

      <div className={styles.titlebar}>
        <div className={styles.titlebarChrome} aria-hidden="true" />
        <div className={styles.titlebarCommands} onPointerDown={handleTitlePointerDown}>
          <div className={styles.titleLeading}>
            <img src={icon} alt="" className={styles.titleIcon} draggable={false} />
            <span className={styles.titleText}>{title}</span>
          </div>
          <div className={styles.controls}>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.controlBtnBlue}`}
              aria-label="Minimize"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onMinimize}
            >
              <span className={styles.minimizeIcon} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.controlBtnBlue}`}
              aria-label={isMaximized ? 'Restore' : 'Maximize'}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleMaximize}
            >
              <span
                className={isMaximized ? styles.restoreIcon : styles.maximizeIcon}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.controlBtnRed}`}
              aria-label="Close"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onClose}
            >
              <span className={styles.closeIcon} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.frame}>
        <div className={styles.borderLeft} aria-hidden="true" />
        <div className={styles.body}>{children}</div>
        <div className={styles.borderRight} aria-hidden="true" />
      </div>
      <div className={styles.borderBottom} aria-hidden="true" />
    </div>
  );
}
