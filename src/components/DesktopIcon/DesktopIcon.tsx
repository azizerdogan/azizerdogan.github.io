import { forwardRef, type MouseEvent } from 'react';
import styles from './DesktopIcon.module.css';

type DesktopIconProps = {
  icon: string;
  label: string;
  selected?: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onDoubleClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onContextMenu?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export const DesktopIcon = forwardRef<HTMLButtonElement, DesktopIconProps>(function DesktopIcon(
  {
    icon,
    label,
    selected = false,
    onClick,
    onDoubleClick,
    onContextMenu,
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.icon} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <span className={styles.highlight} aria-hidden="true" />
      <img src={icon} alt="" className={styles.image} draggable={false} />
      <span className={styles.label}>{label}</span>
    </button>
  );
});
