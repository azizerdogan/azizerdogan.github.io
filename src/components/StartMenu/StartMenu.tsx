import linkedInPhoto from '../../assets/images/LinkedIn Photo.png';
import logOffIcon from '../../assets/icons/Log Off Button.png';
import powerOffIcon from '../../assets/icons/Power off Button.png';
import allProgramsArrow from '../../assets/start-menu/All Programs Arrow.png';
import computerIcon from '../../assets/start-menu/Computer.png';
import controlPanelIcon from '../../assets/start-menu/Control Panel.png';
import defaultProgramsIcon from '../../assets/start-menu/Default Programs.png';
import guidedTourIcon from '../../assets/start-menu/Guided Tour.png';
import helpIcon from '../../assets/start-menu/Help.png';
import internetExplorerIcon from '../../assets/start-menu/Internet Explorer.png';
import msnIcon from '../../assets/start-menu/MSN.png';
import myDocumentsIcon from '../../assets/start-menu/My Documents.png';
import myMusicIcon from '../../assets/start-menu/My Music.png';
import myPicturesIcon from '../../assets/start-menu/My Pictures.png';
import outlookIcon from '../../assets/start-menu/Outlook Express.png';
import printersIcon from '../../assets/start-menu/Printers and Faxes.png';
import recentDocumentsIcon from '../../assets/start-menu/Recent Documents.png';
import runIcon from '../../assets/start-menu/Run.png';
import searchIcon from '../../assets/start-menu/Search.png';
import separatorImg from '../../assets/start-menu/Separator.png';
import submenuArrow from '../../assets/start-menu/Submenu Arrow.png';
import transferWizardIcon from '../../assets/start-menu/Transfer Wizard.png';
import visualKeyboardIcon from '../../assets/start-menu/Visual Keyboard.png';
import mediaPlayerIcon from '../../assets/start-menu/Windows Media Player.png';
import messengerIcon from '../../assets/start-menu/Windows Messenger.png';
import styles from './StartMenu.module.css';

type StartMenuProps = {
  onClose: () => void;
};

const PINNED_PROGRAMS = [
  {
    icon: internetExplorerIcon,
    title: 'Internet',
    subtitle: 'Internet Explorer',
  },
  {
    icon: outlookIcon,
    title: 'E-Mails',
    subtitle: 'Outlook Express',
  },
] as const;

const RECENT_PROGRAMS = [
  { icon: mediaPlayerIcon, label: 'Windows Media Player' },
  { icon: msnIcon, label: 'MSN' },
  { icon: messengerIcon, label: 'Windows Messenger' },
  { icon: guidedTourIcon, label: 'Windows XP Guided Tour' },
  { icon: transferWizardIcon, label: 'Files and Settings Transfert Wizzard' },
  { icon: visualKeyboardIcon, label: 'Visual Keyboard' },
] as const;

const LOCATIONS = [
  { icon: myDocumentsIcon, label: 'My Documents', bold: true },
  { icon: recentDocumentsIcon, label: 'My Recent Documents', bold: true, submenu: true },
  { icon: myPicturesIcon, label: 'My Pictures', bold: true },
  { icon: myMusicIcon, label: 'My Music', bold: true },
  { icon: computerIcon, label: 'Computer', bold: true },
  { type: 'separator' as const },
  { icon: controlPanelIcon, label: 'Control Pannel' },
  { icon: defaultProgramsIcon, label: 'Setup Default Programs' },
  { icon: printersIcon, label: 'Printers and Faxes' },
  { type: 'separator' as const },
  { icon: helpIcon, label: 'Help and Support' },
  { icon: searchIcon, label: 'Search' },
  { icon: runIcon, label: 'Run...' },
] as const;

export function StartMenu({ onClose }: StartMenuProps) {
  return (
    <div
      className={styles.menu}
      role="menu"
      aria-label="Start menu"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <header className={styles.header}>
        <div className={styles.user}>
          <img
            src={linkedInPhoto}
            alt=""
            className={styles.avatar}
            draggable={false}
          />
          <span className={styles.userName}>Aziz Erdogan</span>
        </div>
      </header>

      <div className={styles.launcher}>
        <div className={styles.programs}>
          {PINNED_PROGRAMS.map((program) => (
            <button key={program.title} type="button" className={styles.programItemPinned}>
              <img src={program.icon} alt="" className={styles.programIconLg} draggable={false} />
              <span className={styles.programText}>
                <span className={styles.programTitle}>{program.title}</span>
                <span className={styles.programSubtitle}>{program.subtitle}</span>
              </span>
            </button>
          ))}

          <div className={styles.separator}>
            <img src={separatorImg} alt="" draggable={false} />
          </div>

          {RECENT_PROGRAMS.map((program) => (
            <button key={program.label} type="button" className={styles.programItem}>
              <img src={program.icon} alt="" className={styles.programIconLg} draggable={false} />
              <span className={styles.programLabel}>{program.label}</span>
            </button>
          ))}

          <div className={styles.separator}>
            <img src={separatorImg} alt="" draggable={false} />
          </div>

          <button type="button" className={styles.allPrograms}>
            <span>All Programs</span>
            <img src={allProgramsArrow} alt="" className={styles.allProgramsArrow} draggable={false} />
          </button>
        </div>

        <aside className={styles.locations}>
          {LOCATIONS.map((item, index) => {
            if ('type' in item && item.type === 'separator') {
              return <div key={`sep-${index}`} className={styles.locationSeparator} />;
            }

            const location = item as Exclude<(typeof LOCATIONS)[number], { type: 'separator' }>;
            const isBold = 'bold' in location && location.bold;
            const hasSubmenu = 'submenu' in location && location.submenu;

            return (
              <button
                key={location.label}
                type="button"
                className={`${styles.locationItem} ${isBold ? styles.locationItemBold : ''}`}
              >
                <img src={location.icon} alt="" className={styles.locationIcon} draggable={false} />
                <span className={styles.locationLabel}>{location.label}</span>
                {hasSubmenu && (
                  <img src={submenuArrow} alt="" className={styles.submenuArrow} draggable={false} />
                )}
              </button>
            );
          })}
        </aside>
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.powerBtn} onClick={onClose}>
          <img src={logOffIcon} alt="" className={styles.powerIcon} draggable={false} />
          <span>Log off</span>
        </button>
        <button type="button" className={styles.powerBtn} onClick={onClose}>
          <img src={powerOffIcon} alt="" className={styles.powerIcon} draggable={false} />
          <span>Turn off</span>
        </button>
      </footer>
    </div>
  );
}
