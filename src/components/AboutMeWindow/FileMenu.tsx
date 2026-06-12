import { useState } from 'react';
import submenuArrow from '../../assets/context-menu/Submenu Arrow.png';
import submenuArrowSelected from '../../assets/context-menu/Submenu Arrow Selected.png';
import styles from './FileMenu.module.css';

type FileMenuProps = {
  onClose: () => void;
  onExit: () => void;
};

type FileMenuItemProps = {
  label: string;
  tall?: boolean;
  showArrow?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

function FileMenuItem({ label, tall, showArrow, disabled, onClick }: FileMenuItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={`${styles.item} ${tall ? styles.itemTall : ''}`}
      role="menuitem"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={styles.leading}>
        <span className={styles.decorator} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
      </span>
      {showArrow ? (
        <span className={styles.trailing} aria-hidden="true">
          <img
            src={hovered ? submenuArrowSelected : submenuArrow}
            alt=""
            className={styles.arrowIcon}
            draggable={false}
          />
        </span>
      ) : (
        <span className={styles.trailing} aria-hidden="true" />
      )}
    </button>
  );
}

export function FileMenu({ onClose, onExit }: FileMenuProps) {
  function handleExit() {
    onClose();
    onExit();
  }

  return (
    <div
      className={styles.menu}
      role="menu"
      aria-label="File menu"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <FileMenuItem label="Copy" disabled />
      <FileMenuItem label="Paste" disabled />
      <div className={styles.separator} role="separator">
        <div className={styles.separatorLine} />
      </div>
      <FileMenuItem label="Exit" tall showArrow onClick={handleExit} />
    </div>
  );
}
