import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import resumeIcon from '../../assets/icons/Resume Icon.png';
import resumePdf from '../../assets/resume/Sample QA Resume.pdf';
import toolbarBack from '../../assets/windows/resume/Toolbar Back.png';
import toolbarEmail from '../../assets/windows/resume/Toolbar Email.png';
import toolbarSave from '../../assets/windows/resume/Toolbar Save.png';
import toolbarSearch from '../../assets/windows/resume/Toolbar Search.png';
import { XpWindow } from '../XpWindow/XpWindow';
import { FileMenu } from '../AboutMeWindow/FileMenu';
import { PdfViewer } from './PdfViewer';
import styles from './ResumeWindow.module.css';

const SCROLL_ARROW_SIZE = 17;
const SCROLL_STEP = 48;
const CONTACT_EMAIL = 'azizerdogan@gmail.com';
const PDF_DOWNLOAD_NAME = 'Sample QA Resume.pdf';
const PDF_BASE_WIDTH = 560;
const ZOOM_SCALE = 1.5;

type ScrollMetrics = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
};

type ResumeWindowProps = {
  focused?: boolean;
  hidden?: boolean;
  initialPosition?: { x: number; y: number };
  onClose: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
};

export function ResumeWindow({
  focused,
  hidden,
  initialPosition,
  onClose,
  onMinimize,
  onFocus,
}: ResumeWindowProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const fileButtonRef = useRef<HTMLButtonElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [savePressed, setSavePressed] = useState(false);
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

  const pdfWidth = zoomed ? PDF_BASE_WIDTH * ZOOM_SCALE : PDF_BASE_WIDTH;

  const updateScrollMetrics = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setScrollMetrics({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    });
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    updateScrollMetrics();
    el.addEventListener('scroll', updateScrollMetrics);

    const observer = new ResizeObserver(updateScrollMetrics);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollMetrics);
      observer.disconnect();
    };
  }, [hidden, zoomed, pdfWidth, updateScrollMetrics]);

  useEffect(() => {
    if (!fileMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        fileButtonRef.current?.contains(target) ||
        fileMenuRef.current?.contains(target)
      ) {
        return;
      }
      setFileMenuOpen(false);
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [fileMenuOpen]);

  useEffect(() => {
    if (hidden) setFileMenuOpen(false);
  }, [hidden]);

  function handleFileClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onFocus?.();
    setFileMenuOpen((open) => !open);
  }

  function handleZoomToggle() {
    onFocus?.();
    setZoomed((current) => !current);
  }

  function handleSave() {
    const anchor = document.createElement('a');
    anchor.href = resumePdf;
    anchor.download = PDF_DOWNLOAD_NAME;
    anchor.click();
  }

  function scrollBy(delta: number) {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop += delta;
  }

  function scrollToRatio(ratio: number) {
    const el = contentRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    el.scrollTop = Math.min(maxScroll, Math.max(0, ratio * maxScroll));
  }

  function handleThumbPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const el = contentRef.current;
    const track = scrollTrackRef.current;
    if (!el || !track) return;

    const trackRect = track.getBoundingClientRect();
    const maxScroll = el.scrollHeight - el.clientHeight;
    const thumbHeight = Math.max(
      20,
      (el.clientHeight / el.scrollHeight) * trackRect.height,
    );
    const maxThumbTravel = trackRect.height - thumbHeight;
    const startY = e.clientY;
    const startScrollTop = el.scrollTop;

    function handleMove(moveEvent: PointerEvent) {
      if (maxThumbTravel <= 0 || maxScroll <= 0 || !el) return;
      const deltaY = moveEvent.clientY - startY;
      el.scrollTop = startScrollTop + (deltaY / maxThumbTravel) * maxScroll;
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

  function handleTrackPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();

    const el = contentRef.current;
    const track = scrollTrackRef.current;
    if (!el || !track) return;

    const trackRect = track.getBoundingClientRect();
    const thumbHeight = Math.max(
      20,
      (el.clientHeight / el.scrollHeight) * trackRect.height,
    );
    const clickY = e.clientY - trackRect.top - thumbHeight / 2;
    const maxThumbTravel = trackRect.height - thumbHeight;
    const ratio = maxThumbTravel > 0 ? clickY / maxThumbTravel : 0;
    scrollToRatio(ratio);
  }

  const { scrollTop, scrollHeight, clientHeight } = scrollMetrics;
  const canScroll = scrollHeight > clientHeight + 1;
  const trackHeight = Math.max(0, clientHeight - SCROLL_ARROW_SIZE * 2);
  const thumbHeight = canScroll
    ? Math.max(20, (clientHeight / scrollHeight) * trackHeight)
    : trackHeight;
  const maxScroll = scrollHeight - clientHeight;
  const maxThumbTravel = trackHeight - thumbHeight;
  const thumbTop =
    canScroll && maxThumbTravel > 0
      ? (scrollTop / maxScroll) * maxThumbTravel
      : 0;

  return (
    <XpWindow
      title="My Resume"
      icon={resumeIcon}
      focused={focused}
      hidden={hidden}
      initialPosition={initialPosition}
      onClose={onClose}
      onMinimize={onMinimize}
      onFocus={onFocus}
    >
      <div className={styles.bars}>
        <div className={styles.menuRow}>
          <div className={styles.menubar}>
            <div className={styles.menuButtonWrap} ref={fileMenuRef}>
              <button
                ref={fileButtonRef}
                type="button"
                className={`${styles.menuButton} ${fileMenuOpen ? styles.menuButtonActive : ''}`}
                aria-haspopup="menu"
                aria-expanded={fileMenuOpen}
                onClick={handleFileClick}
                onPointerDown={(event) => event.stopPropagation()}
              >
                File
              </button>
              {fileMenuOpen && (
                <FileMenu onClose={() => setFileMenuOpen(false)} onExit={onClose} />
              )}
            </div>
            <span className={`${styles.menuItem} ${styles.menuItemDisabled}`}>Edit</span>
            <span className={`${styles.menuItem} ${styles.menuItemDisabled}`}>View</span>
          </div>
          <div className={styles.menuTrailing}>
            <div className={`${styles.partitionV} ${styles.partitionSticker}`} aria-hidden="true" />
            <div className={styles.windowsSticker} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.partitionH} aria-hidden="true" />
        <div className={styles.toolbarRow}>
          <div className={`${styles.toolbarCombo} ${styles.toolbarComboDisabled}`}>
            <img src={toolbarBack} alt="" className={`${styles.toolbarIcon} ${styles.toolbarIconFlipped}`} draggable={false} />
            <span className={styles.toolbarLabel}>Back</span>
            <div className={styles.toolbarComboArrow} aria-hidden="true" />
          </div>
          <div className={`${styles.toolbarCombo} ${styles.toolbarComboDisabled}`}>
            <img src={toolbarBack} alt="" className={styles.toolbarIcon} draggable={false} />
            <span className={styles.toolbarLabel}>Forward</span>
            <div className={styles.toolbarComboArrow} aria-hidden="true" />
          </div>
          <div className={`${styles.partitionV} ${styles.partitionToolbar}`} aria-hidden="true" />
          <button
            type="button"
            className={`${styles.toolbarBtn} ${zoomed ? styles.toolbarBtnPressed : ''}`}
            aria-pressed={zoomed}
            onClick={handleZoomToggle}
          >
            <img src={toolbarSearch} alt="" className={styles.toolbarIconActive} draggable={false} />
            <span className={styles.toolbarLabelActive}>Zoom</span>
          </button>
          <a className={styles.toolbarBtn} href={`mailto:${CONTACT_EMAIL}`}>
            <img src={toolbarEmail} alt="" className={styles.toolbarIconActive} draggable={false} />
            <span className={styles.toolbarLabelActive}>Email</span>
          </a>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${savePressed ? styles.toolbarBtnPressed : ''}`}
            onPointerDown={() => setSavePressed(true)}
            onPointerUp={() => setSavePressed(false)}
            onPointerLeave={() => setSavePressed(false)}
            onPointerCancel={() => setSavePressed(false)}
            onClick={handleSave}
          >
            <img src={toolbarSave} alt="" className={styles.toolbarIconActive} draggable={false} />
            <span className={styles.toolbarLabelActive}>Save</span>
          </button>
          <div className={`${styles.partitionV} ${styles.partitionToolbar}`} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.content}>
          <div className={styles.contentInner} ref={contentRef}>
            <PdfViewer
              src={resumePdf}
              width={pdfWidth}
              onLayoutChange={updateScrollMetrics}
            />
          </div>

          <div className={styles.scrollbar} aria-hidden="true">
            <button
              type="button"
              className={`${styles.scrollBtn} ${styles.scrollBtnUp}`}
              disabled={!canScroll || scrollTop <= 0}
              onClick={() => scrollBy(-SCROLL_STEP)}
            />
            <div
              ref={scrollTrackRef}
              className={styles.scrollTrack}
              onPointerDown={handleTrackPointerDown}
            >
              {canScroll && (
                <div
                  className={styles.scrollThumb}
                  style={{ height: thumbHeight, top: thumbTop }}
                  onPointerDown={handleThumbPointerDown}
                />
              )}
            </div>
            <button
              type="button"
              className={`${styles.scrollBtn} ${styles.scrollBtnDown}`}
              disabled={!canScroll || scrollTop >= maxScroll - 1}
              onClick={() => scrollBy(SCROLL_STEP)}
            />
          </div>
        </div>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusInner}>
          <div className={styles.statusTrailing}>
            <div className={`${styles.partitionV} ${styles.partitionStatus}`} aria-hidden="true" />
            <span className={styles.statusLabel}>
              <img src={resumeIcon} alt="" className={styles.statusIcon} draggable={false} />
              My Resume
            </span>
            <div className={styles.resizeGrip} aria-hidden="true" />
          </div>
        </div>
      </div>
    </XpWindow>
  );
}
