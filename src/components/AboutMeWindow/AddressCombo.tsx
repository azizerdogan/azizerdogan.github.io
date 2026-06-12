import type { DesktopShortcut } from '../../constants/desktopShortcuts';
import styles from './AddressCombo.module.css';

type AddressComboProps = {
  value: DesktopShortcut;
  options: readonly DesktopShortcut[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (shortcut: DesktopShortcut) => void;
};

export function AddressCombo({
  value,
  options,
  open,
  onOpenChange,
  onSelect,
}: AddressComboProps) {
  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onOpenChange(!open);
  }

  function handleSelect(event: React.MouseEvent<HTMLButtonElement>, shortcut: DesktopShortcut) {
    event.stopPropagation();
    onSelect(shortcut);
    onOpenChange(false);
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.combobox} ${open ? styles.comboboxOpen : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={handleToggle}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span className={styles.comboboxValue}>
          <img src={value.icon} alt="" className={styles.comboboxIcon} draggable={false} />
          <span>{value.label}</span>
        </span>
        <span className={styles.comboboxDrop} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.list} role="listbox" aria-label="Address shortcuts">
          {options.map((shortcut) => (
            <button
              key={shortcut.id}
              type="button"
              className={styles.listItem}
              role="option"
              onClick={(event) => handleSelect(event, shortcut)}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src={shortcut.icon} alt="" className={styles.listItemIcon} draggable={false} />
              <span>{shortcut.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
