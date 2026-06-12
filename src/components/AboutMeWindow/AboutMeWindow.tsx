import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import aboutMeIcon from '../../assets/icons/About Me Icon.png';
import linkedInIcon from '../../assets/windows/about-me/LinkedIn.png';
import githubIcon from '../../assets/windows/about-me/Github.png';
import skillTestAutomation from '../../assets/windows/about-me/Skill Test Automation.png';
import skillApiValidation from '../../assets/windows/about-me/Skill API Validation.png';
import skillDatabaseTesting from '../../assets/windows/about-me/Skill Database Testing.png';
import skillMobileQa from '../../assets/windows/about-me/Skill Mobile QA.png';
import skillPython from '../../assets/windows/about-me/Skill Python.png';
import skillDataIntegrity from '../../assets/windows/about-me/Skill Data Integrity.png';
import powerBiIcon from '../../assets/icons/PowerBI Icon.png';
import gamepadIcon from '../../assets/windows/about-me/Gamepad.png';
import watermark from '../../assets/windows/about-me/Watermark.png';
import toolbarBack from '../../assets/windows/about-me/Toolbar Back.png';
import toolbarFoldersPane from '../../assets/windows/about-me/Toolbar Folders Pane.png';
import toolbarSearch from '../../assets/windows/about-me/Toolbar Search.png';
import toolbarUp from '../../assets/windows/about-me/Toolbar Up.png';
import toolbarViews from '../../assets/windows/about-me/Toolbar Views.png';
import goButton from '../../assets/windows/about-me/Go Button.png';
import expanderDefault from '../../assets/windows/about-me/Expander Default Expand.png';
import expanderPrimary from '../../assets/windows/about-me/Expander Primary Expand.png';
import {
  DESKTOP_SHORTCUTS,
  type DesktopShortcut,
  type ShortcutId,
} from '../../constants/desktopShortcuts';
import { XpWindow } from '../XpWindow/XpWindow';
import { AddressCombo } from './AddressCombo';
import { FileMenu } from './FileMenu';
import styles from './AboutMeWindow.module.css';

const ABOUT_SHORTCUT = DESKTOP_SHORTCUTS.find((shortcut) => shortcut.id === 'about')!;
const ADDRESS_SHORTCUTS = DESKTOP_SHORTCUTS.filter((shortcut) => shortcut.id !== 'about');

const SKILLS = [
  { label: 'Test Automation', icon: skillTestAutomation },
  { label: 'API Validation', icon: skillApiValidation },
  { label: 'Database Testing', icon: skillDatabaseTesting },
  { label: 'Mobile QA', icon: skillMobileQa },
  { label: 'Python Scripting', icon: skillPython },
  { label: 'Data Integrity', icon: skillDataIntegrity },
  { label: 'PowerBI Visualizations', icon: powerBiIcon },
] as const;

const ABOUT_LINKS = [
  { label: 'LinkedIn', icon: linkedInIcon, href: 'https://www.linkedin.com/in/azizerdogan/' },
  { label: 'Github', icon: githubIcon, href: 'https://github.com/azizerdogan' },
] as const;

const SCROLL_ARROW_SIZE = 17;
const SCROLL_STEP = 48;

type ScrollMetrics = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
};

type AboutMeWindowProps = {
  focused?: boolean;
  hidden?: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  onNavigateShortcut?: (id: Exclude<ShortcutId, 'about'>) => void;
};

export function AboutMeWindow({
  focused,
  hidden,
  onClose,
  onMinimize,
  onFocus,
  onNavigateShortcut,
}: AboutMeWindowProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const fileButtonRef = useRef<HTMLButtonElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const addressComboRef = useRef<HTMLDivElement>(null);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [addressComboOpen, setAddressComboOpen] = useState(false);
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

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
  }, [hidden, updateScrollMetrics]);

  useEffect(() => {
    if (!fileMenuOpen && !addressComboOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        fileButtonRef.current?.contains(target) ||
        fileMenuRef.current?.contains(target) ||
        addressComboRef.current?.contains(target)
      ) {
        return;
      }
      setFileMenuOpen(false);
      setAddressComboOpen(false);
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [fileMenuOpen, addressComboOpen]);

  useEffect(() => {
    if (hidden) {
      setFileMenuOpen(false);
      setAddressComboOpen(false);
    }
  }, [hidden]);

  function handleFileClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onFocus?.();
    setAddressComboOpen(false);
    setFileMenuOpen((open) => !open);
  }

  function handleAddressOpenChange(open: boolean) {
    onFocus?.();
    if (open) {
      setFileMenuOpen(false);
    }
    setAddressComboOpen(open);
  }

  function handleAddressSelect(shortcut: DesktopShortcut) {
    if (shortcut.id === 'about') return;
    onNavigateShortcut?.(shortcut.id);
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
      if (!el || maxThumbTravel <= 0 || maxScroll <= 0) return;
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
      title="About Me"
      icon={aboutMeIcon}
      focused={focused}
      hidden={hidden}
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
            <span className={`${styles.menuItem} ${styles.menuItemDisabled}`}>View</span>
            <span className={`${styles.menuItem} ${styles.menuItemDisabled}`}>Display</span>
            <span className={`${styles.menuItem} ${styles.menuItemDisabled}`}>Favorites</span>
            <span className={`${styles.menuItem} ${styles.menuItemDisabled}`}>Tools</span>
            <span className={`${styles.menuItem} ${styles.menuItemDisabled}`}>?</span>
          </div>
          <div className={styles.addressRow}>
            <div className={`${styles.partitionV} ${styles.partitionMenu}`} aria-hidden="true" />
            <span className={styles.addressLabel}>Address</span>
            <div ref={addressComboRef} className={styles.addressComboSlot}>
              <AddressCombo
                value={ABOUT_SHORTCUT}
                options={ADDRESS_SHORTCUTS}
                open={addressComboOpen}
                onOpenChange={handleAddressOpenChange}
                onSelect={handleAddressSelect}
              />
            </div>
            <div className={styles.addressTrailing}>
              <img
                src={goButton}
                alt="Go"
                className={styles.goButton}
                draggable={false}
              />
              <div className={`${styles.partitionV} ${styles.partitionSticker}`} aria-hidden="true" />
              <div className={styles.windowsSticker} aria-hidden="true" />
            </div>
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
          <div className={`${styles.toolbarBtn} ${styles.toolbarBtnIconOnly} ${styles.toolbarComboDisabled}`}>
            <img src={toolbarUp} alt="" className={styles.toolbarIcon} draggable={false} />
          </div>
          <div className={`${styles.partitionV} ${styles.partitionToolbar}`} aria-hidden="true" />
          <div className={`${styles.toolbarBtn} ${styles.toolbarComboDisabled}`}>
            <img src={toolbarSearch} alt="" className={styles.toolbarIcon} draggable={false} />
            <span className={styles.toolbarLabel}>Search</span>
          </div>
          <div className={`${styles.toolbarBtn} ${styles.toolbarComboDisabled}`}>
            <img src={toolbarFoldersPane} alt="" className={styles.toolbarIcon} draggable={false} />
            <span className={styles.toolbarLabel}>Folders</span>
          </div>
          <div className={`${styles.partitionV} ${styles.partitionToolbar}`} aria-hidden="true" />
          <div className={`${styles.toolbarBtn} ${styles.toolbarBtnViews} ${styles.toolbarComboDisabled}`}>
            <img src={toolbarViews} alt="" className={styles.toolbarIcon} draggable={false} />
            <div className={styles.toolbarComboArrow} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className={styles.main}>
        <aside className={styles.sidePanel}>
          <div className={styles.section}>
            <div className={`${styles.sectionHeader} ${styles.sectionHeaderPrimary}`}>
              <div className={styles.sectionHeaderLeading}>
                <img
                  src={aboutMeIcon}
                  alt=""
                  className={styles.sectionHeaderIcon}
                  draggable={false}
                />
                <span
                  className={`${styles.sectionHeaderTitle} ${styles.sectionHeaderTitlePrimary}`}
                >
                  About Me
                </span>
              </div>
              <img
                src={expanderDefault}
                alt=""
                className={styles.expanderBtn}
                draggable={false}
                aria-hidden="true"
              />
            </div>
            <div className={`${styles.sectionBody} ${styles.sectionBodyPrimary}`}>
              {ABOUT_LINKS.map((link) => (
                <div key={link.label} className={styles.sectionItem}>
                  <img src={link.icon} alt="" className={styles.sectionItemIcon} draggable={false} />
                  <a
                    href={link.href}
                    className={styles.sectionItemLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={`${styles.sectionHeader} ${styles.sectionHeaderSecondary}`}>
              <div className={styles.sectionHeaderLeading}>
                <span
                  className={`${styles.sectionHeaderTitle} ${styles.sectionHeaderTitleSecondary}`}
                >
                  Skills
                </span>
              </div>
              <img
                src={expanderPrimary}
                alt=""
                className={styles.expanderBtn}
                draggable={false}
                aria-hidden="true"
              />
            </div>
            <div className={`${styles.sectionBody} ${styles.sectionBodySecondary}`}>
              {SKILLS.map((skill) => (
                <div key={skill.label} className={styles.sectionItem}>
                  <img src={skill.icon} alt="" className={styles.sectionItemIcon} draggable={false} />
                  <span className={styles.sectionItemText}>{skill.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.content}>
          <div ref={contentRef} className={styles.contentInner}>
            <div className={styles.headingRow}>
              <h1 className={styles.heading}>About Aziz Erdogan (me!)</h1>
              <img src={gamepadIcon} alt="" className={styles.gamepad} draggable={false} />
            </div>
            <p className={styles.bio}>
              Hey! I&apos;m Aziz Erdogan. Here is a quick summary to get to know me better:
            </p>
            <ol className={`${styles.bio} ${styles.bioList}`}>
              <li>I am a QA Engineer with over 4 years of hands-on experience.</li>
              <li>
                I am pursuing my Bachelor&apos;s in Computer Science at the University of Central
                Missouri.
              </li>
              <li>
                I was born in Azerbaijan but have been raised in Missouri for most of my life.
              </li>
              <li>
                In my free time, I like to play games, work on side projects (like this one!), and
                learn new languages.
              </li>
              <li>My favorite programming language is Python—I don&apos;t care if it&apos;s overrated!</li>
              <li>I&apos;m legitimately one of the top players in Guild Wars 2.</li>
            </ol>
          </div>
          <img src={watermark} alt="" className={styles.watermark} draggable={false} />
          <div className={styles.scrollbar}>
            <button
              type="button"
              className={`${styles.scrollBtn} ${styles.scrollBtnUp}`}
              aria-label="Scroll up"
              disabled={!canScroll}
              onClick={() => scrollBy(-SCROLL_STEP)}
            />
            <div
              ref={scrollTrackRef}
              className={styles.scrollTrack}
              onPointerDown={canScroll ? handleTrackPointerDown : undefined}
            >
              {canScroll && (
                <div
                  className={styles.scrollThumb}
                  style={{ top: thumbTop, height: thumbHeight }}
                  onPointerDown={handleThumbPointerDown}
                />
              )}
            </div>
            <button
              type="button"
              className={`${styles.scrollBtn} ${styles.scrollBtnDown}`}
              aria-label="Scroll down"
              disabled={!canScroll}
              onClick={() => scrollBy(SCROLL_STEP)}
            />
          </div>
        </section>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusInner}>
          <div />
          <div className={styles.statusTrailing}>
            <div className={`${styles.partitionV} ${styles.partitionStatus}`} aria-hidden="true" />
            <div className={styles.statusLabel}>
              <img src={aboutMeIcon} alt="" className={styles.statusIcon} draggable={false} />
              <span>About Me</span>
            </div>
            <div className={styles.resizeGrip} aria-hidden="true" />
          </div>
        </div>
      </div>
    </XpWindow>
  );
}
