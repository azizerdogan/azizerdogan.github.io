import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import aboutMeIcon from '../assets/icons/About Me Icon.png';
import resumeIcon from '../assets/icons/Resume Icon.png';
import blissWallpaper from '../assets/images/Bliss Wallpaper.png';
import { DESKTOP_SHORTCUTS, type ShortcutId } from '../constants/desktopShortcuts';
import { AboutMeWindow } from '../components/AboutMeWindow/AboutMeWindow';
import { ResumeWindow } from '../components/ResumeWindow/ResumeWindow';
import { ContextMenu } from '../components/ContextMenu/ContextMenu';
import { CrtOverlay } from '../components/CrtOverlay/CrtOverlay';
import { DesktopIcon } from '../components/DesktopIcon/DesktopIcon';
import { StartMenu } from '../components/StartMenu/StartMenu';
import { Taskbar, type TaskbarProgram } from '../components/Taskbar/Taskbar';
import { useCrt } from '../hooks/crtContext';
import { useSound } from '../hooks/useSound';
import styles from './DesktopScreen.module.css';

const CONTEXT_MENU_WIDTH = 184;
const CONTEXT_MENU_HEIGHT = 254;
const TASKBAR_HEIGHT = 30;
const WINDOW_WIDTH = 807;
const WINDOW_HEIGHT = 562;
const MARQUEE_THRESHOLD = 4;

type WindowId = 'about' | 'resume';
type WindowState = 'closed' | 'open' | 'minimized';

type Marquee = {
  startX: number;
  startY: number;
  x: number;
  y: number;
};

function normalizeMarquee(marquee: Marquee) {
  const left = Math.min(marquee.startX, marquee.x);
  const top = Math.min(marquee.startY, marquee.y);
  const width = Math.abs(marquee.x - marquee.startX);
  const height = Math.abs(marquee.y - marquee.startY);
  return { left, top, width, height };
}

function rectsIntersect(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function getWindowInitialPosition(offsetX = 0, offsetY = 0) {
  return {
    x: Math.max(24, (window.innerWidth - WINDOW_WIDTH) / 2 + offsetX),
    y: Math.max(24, (window.innerHeight - TASKBAR_HEIGHT - WINDOW_HEIGHT) / 2 + offsetY),
  };
}

export function DesktopScreen() {
  const { crtEnabled } = useCrt();
  const playStartup = useSound('startup');
  const playRestore = useSound('restore');
  const playMinimize = useSound('minimize');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<ShortcutId>>(new Set());
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const [marqueeActive, setMarqueeActive] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef(new Map<ShortcutId, HTMLButtonElement>());
  const suppressDesktopClickRef = useRef(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [iconsRefreshing, setIconsRefreshing] = useState(false);
  const [aboutMeState, setAboutMeState] = useState<WindowState>('closed');
  const [resumeState, setResumeState] = useState<WindowState>('closed');
  const [focusedWindow, setFocusedWindow] = useState<WindowId | null>(null);

  useEffect(() => {
    playStartup();
  }, [playStartup]);

  function handleDesktopClick() {
    if (suppressDesktopClickRef.current) {
      suppressDesktopClickRef.current = false;
      return;
    }
    setSelectedIds(new Set());
    setStartMenuOpen(false);
    setContextMenu(null);
    setFocusedWindow(null);
  }

  function updateSelectionForMarquee(marqueeRect: ReturnType<typeof normalizeMarquee>) {
    const desktop = desktopRef.current;
    if (!desktop) return;

    const desktopBounds = desktop.getBoundingClientRect();
    const selectionBounds = {
      left: desktopBounds.left + marqueeRect.left,
      top: desktopBounds.top + marqueeRect.top,
      right: desktopBounds.left + marqueeRect.left + marqueeRect.width,
      bottom: desktopBounds.top + marqueeRect.top + marqueeRect.height,
    };

    const nextSelected = new Set<ShortcutId>();
    for (const shortcut of DESKTOP_SHORTCUTS) {
      const icon = iconRefs.current.get(shortcut.id);
      if (!icon) continue;
      const iconBounds = icon.getBoundingClientRect();
      if (rectsIntersect(selectionBounds, iconBounds)) {
        nextSelected.add(shortcut.id);
      }
    }
    setSelectedIds(nextSelected);
  }

  function handleDesktopSurfacePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;

    const desktop = desktopRef.current;
    if (!desktop) return;

    const desktopBounds = desktop.getBoundingClientRect();
    const startX = event.clientX - desktopBounds.left;
    const startY = event.clientY - desktopBounds.top;
    const pointerId = event.pointerId;
    let dragged = false;

    setMarquee({ startX, startY, x: startX, y: startY });
    event.currentTarget.setPointerCapture(pointerId);

    function handlePointerMove(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) return;

      const x = moveEvent.clientX - desktopBounds.left;
      const y = moveEvent.clientY - desktopBounds.top;
      const nextMarquee = { startX, startY, x, y };
      const normalized = normalizeMarquee(nextMarquee);

      if (
        !dragged &&
        (normalized.width > MARQUEE_THRESHOLD || normalized.height > MARQUEE_THRESHOLD)
      ) {
        dragged = true;
        setMarqueeActive(true);
        setStartMenuOpen(false);
        setContextMenu(null);
        setFocusedWindow(null);
      }

      if (dragged) {
        setMarquee(nextMarquee);
        updateSelectionForMarquee(normalized);
      }
    }

    function finishPointer(eventType: 'up' | 'cancel') {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);

      if (dragged) {
        suppressDesktopClickRef.current = true;
      } else if (eventType === 'up') {
        setSelectedIds(new Set());
        setStartMenuOpen(false);
        setContextMenu(null);
        setFocusedWindow(null);
      }

      setMarquee(null);
      setMarqueeActive(false);
    }

    function handlePointerUp(upEvent: PointerEvent) {
      if (upEvent.pointerId !== pointerId) return;
      finishPointer('up');
    }

    function handlePointerCancel(cancelEvent: PointerEvent) {
      if (cancelEvent.pointerId !== pointerId) return;
      finishPointer('cancel');
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
  }

  function openAboutMe() {
    playRestore();
    setAboutMeState('open');
    setFocusedWindow('about');
    setStartMenuOpen(false);
    setContextMenu(null);
  }

  function closeAboutMe() {
    playMinimize();
    setAboutMeState('closed');
    setFocusedWindow((current) => (current === 'about' ? null : current));
  }

  function minimizeAboutMe() {
    playMinimize();
    setAboutMeState('minimized');
    setFocusedWindow((current) => (current === 'about' ? null : current));
  }

  function openResume() {
    playRestore();
    setResumeState('open');
    setFocusedWindow('resume');
    setStartMenuOpen(false);
    setContextMenu(null);
  }

  function closeResume() {
    playMinimize();
    setResumeState('closed');
    setFocusedWindow((current) => (current === 'resume' ? null : current));
  }

  function minimizeResume() {
    playMinimize();
    setResumeState('minimized');
    setFocusedWindow((current) => (current === 'resume' ? null : current));
  }

  function handleNavigateFromAboutMe(id: Exclude<ShortcutId, 'about'>) {
    closeAboutMe();
    setSelectedIds(new Set([id]));
    if (id === 'resume') {
      openResume();
    }
  }

  function handleAboutMeTaskbarClick() {
    if (aboutMeState === 'minimized') {
      playRestore();
      setAboutMeState('open');
      setFocusedWindow('about');
      return;
    }

    if (focusedWindow === 'about') {
      minimizeAboutMe();
      return;
    }

    playRestore();
    setAboutMeState('open');
    setFocusedWindow('about');
  }

  function handleResumeTaskbarClick() {
    if (resumeState === 'minimized') {
      playRestore();
      setResumeState('open');
      setFocusedWindow('resume');
      return;
    }

    if (focusedWindow === 'resume') {
      minimizeResume();
      return;
    }

    playRestore();
    setResumeState('open');
    setFocusedWindow('resume');
  }

  function handleDesktopContextMenu(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    const maxX = window.innerWidth - CONTEXT_MENU_WIDTH;
    const maxY = window.innerHeight - TASKBAR_HEIGHT - CONTEXT_MENU_HEIGHT;

    setSelectedIds(new Set());
    setStartMenuOpen(false);
    setContextMenu({
      x: Math.min(Math.max(0, event.clientX), maxX),
      y: Math.min(Math.max(0, event.clientY), maxY),
    });
  }

  function handleRefreshDesktop() {
    setIconsRefreshing(true);
    window.setTimeout(() => setIconsRefreshing(false), 150);
  }

  function handleShortcutClick(id: ShortcutId) {
    setSelectedIds(new Set([id]));
    setStartMenuOpen(false);
  }

  function handleShortcutOpen(id: ShortcutId) {
    setSelectedIds(new Set([id]));
    if (id === 'about') {
      openAboutMe();
      return;
    }
    if (id === 'resume') {
      openResume();
    }
  }

  function handleStartClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setStartMenuOpen((open) => !open);
  }

  const taskbarPrograms: TaskbarProgram[] = [];

  if (aboutMeState !== 'closed') {
    taskbarPrograms.push({
      id: 'about',
      label: 'About Me',
      icon: aboutMeIcon,
      active: aboutMeState === 'open' && focusedWindow === 'about',
      onClick: handleAboutMeTaskbarClick,
    });
  }

  if (resumeState !== 'closed') {
    taskbarPrograms.push({
      id: 'resume',
      label: 'My Resume',
      icon: resumeIcon,
      active: resumeState === 'open' && focusedWindow === 'resume',
      onClick: handleResumeTaskbarClick,
    });
  }

  return (
    <div
      className={`xp-screen ${styles.screen}`}
      onClick={handleDesktopClick}
      onContextMenu={(event) => event.preventDefault()}
    >
      <img
        src={blissWallpaper}
        alt=""
        className={styles.wallpaper}
        draggable={false}
      />

      <div
        ref={desktopRef}
        className={`${styles.desktop} ${marqueeActive ? styles.desktopMarqueeActive : ''}`}
      >
        <div
          className={styles.desktopSurface}
          onPointerDown={handleDesktopSurfacePointerDown}
          onContextMenu={handleDesktopContextMenu}
        />
        {marquee && (() => {
          const normalized = normalizeMarquee(marquee);
          if (
            normalized.width <= MARQUEE_THRESHOLD &&
            normalized.height <= MARQUEE_THRESHOLD
          ) {
            return null;
          }
          return (
            <div
              className={styles.selectionMarquee}
              style={{
                left: normalized.left,
                top: normalized.top,
                width: normalized.width,
                height: normalized.height,
              }}
              aria-hidden="true"
            />
          );
        })()}
        <div
          className={`${styles.iconColumn} ${iconsRefreshing ? styles.iconColumnRefreshing : ''}`}
        >
          {DESKTOP_SHORTCUTS.map((shortcut) => (
            <DesktopIcon
              key={shortcut.id}
              ref={(node) => {
                if (node) iconRefs.current.set(shortcut.id, node);
                else iconRefs.current.delete(shortcut.id);
              }}
              icon={shortcut.icon}
              label={shortcut.label}
              selected={selectedIds.has(shortcut.id)}
              onClick={(e) => {
                e.stopPropagation();
                handleShortcutClick(shortcut.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleShortcutOpen(shortcut.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          ))}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRefresh={handleRefreshDesktop}
        />
      )}

      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}

      {aboutMeState !== 'closed' && (
        <AboutMeWindow
          focused={focusedWindow === 'about'}
          hidden={aboutMeState === 'minimized'}
          onClose={closeAboutMe}
          onMinimize={minimizeAboutMe}
          onFocus={() => setFocusedWindow('about')}
          onNavigateShortcut={handleNavigateFromAboutMe}
        />
      )}

      {resumeState !== 'closed' && (
        <ResumeWindow
          focused={focusedWindow === 'resume'}
          hidden={resumeState === 'minimized'}
          initialPosition={getWindowInitialPosition(48, 40)}
          onClose={closeResume}
          onMinimize={minimizeResume}
          onFocus={() => setFocusedWindow('resume')}
        />
      )}

      <div className={styles.taskbarWrap} onClick={(event) => event.stopPropagation()}>
        <Taskbar
          startMenuOpen={startMenuOpen}
          onStartClick={handleStartClick}
          programs={taskbarPrograms}
        />
      </div>

      {crtEnabled && <CrtOverlay />}
    </div>
  );
}
