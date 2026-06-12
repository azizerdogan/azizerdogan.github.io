import { useState } from 'react';
import checkIcon from '../../assets/context-menu/Check.png';
import radioIcon from '../../assets/context-menu/Radio.png';
import submenuArrow from '../../assets/context-menu/Submenu Arrow.png';
import submenuArrowSelected from '../../assets/context-menu/Submenu Arrow Selected.png';
import styles from './ContextMenu.module.css';

type LeftDecorator = 'empty' | 'check' | 'radio';
type RightDecorator = 'empty' | 'arrow';

type MenuItemConfig =
  | { type: 'separator' }
  | {
      type: 'item';
      label: string;
      disabled?: boolean;
      leftDecorator?: LeftDecorator;
      rightDecorator?: RightDecorator;
      onClick?: () => void;
    };

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onRefresh: () => void;
};

const MENU_ITEMS: MenuItemConfig[] = [
  { type: 'item', label: 'Toolbar', disabled: true, rightDecorator: 'arrow' },
  { type: 'item', label: 'Status bar', disabled: true, leftDecorator: 'check' },
  { type: 'item', label: 'Explorer Panel', disabled: true, rightDecorator: 'arrow' },
  { type: 'separator' },
  { type: 'item', label: 'Thumbnails', disabled: true },
  { type: 'item', label: 'Mosaics', disabled: true, leftDecorator: 'radio' },
  { type: 'item', label: 'Icons', disabled: true },
  { type: 'item', label: 'List', disabled: true },
  { type: 'item', label: 'Details', disabled: true },
  { type: 'separator' },
  { type: 'item', label: 'Reorganize icons by', disabled: true, rightDecorator: 'arrow' },
  { type: 'separator' },
  { type: 'item', label: 'Choose details...', disabled: true },
  { type: 'item', label: 'Reach', disabled: true, rightDecorator: 'arrow' },
  {
    type: 'item',
    label: 'Refresh',
    onClick: undefined,
  },
];

function LeftDecoratorSlot({ kind }: { kind: LeftDecorator }) {
  if (kind === 'empty') {
    return <span className={styles.decorator} aria-hidden="true" />;
  }

  return (
    <span className={styles.decorator} aria-hidden="true">
      <img
        src={kind === 'check' ? checkIcon : radioIcon}
        alt=""
        className={`${styles.decoratorIcon} ${kind === 'check' ? styles.checkIcon : styles.radioIcon}`}
        draggable={false}
      />
    </span>
  );
}

function RightDecoratorSlot({
  kind,
  selected,
}: {
  kind: RightDecorator;
  selected: boolean;
}) {
  if (kind === 'empty') {
    return <span className={styles.trailing} aria-hidden="true" />;
  }

  return (
    <span className={styles.trailing} aria-hidden="true">
      <img
        src={selected ? submenuArrowSelected : submenuArrow}
        alt=""
        className={styles.arrowIcon}
        draggable={false}
      />
    </span>
  );
}

export function ContextMenu({ x, y, onClose, onRefresh }: ContextMenuProps) {
  function handleRefresh() {
    onRefresh();
    onClose();
  }

  return (
    <div
      className={styles.menu}
      role="menu"
      aria-label="Desktop context menu"
      style={{ left: x, top: y }}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {MENU_ITEMS.map((entry, index) => {
        if (entry.type === 'separator') {
          return (
            <div key={`sep-${index}`} className={styles.separator} role="separator">
              <div className={styles.separatorLine} />
            </div>
          );
        }

        const isRefresh = entry.label === 'Refresh';
        const disabled = entry.disabled ?? false;

        return (
          <MenuItem
            key={entry.label}
            label={entry.label}
            disabled={disabled}
            leftDecorator={entry.leftDecorator ?? 'empty'}
            rightDecorator={entry.rightDecorator ?? 'empty'}
            onClick={isRefresh ? handleRefresh : entry.onClick}
          />
        );
      })}
    </div>
  );
}

type MenuItemProps = {
  label: string;
  disabled: boolean;
  leftDecorator: LeftDecorator;
  rightDecorator: RightDecorator;
  onClick?: () => void;
};

function MenuItem({
  label,
  disabled,
  leftDecorator,
  rightDecorator,
  onClick,
}: MenuItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={styles.item}
      role="menuitem"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={styles.leading}>
        <LeftDecoratorSlot kind={leftDecorator} />
        <span className={styles.label}>{label}</span>
      </span>
      <RightDecoratorSlot kind={rightDecorator} selected={hovered && !disabled} />
    </button>
  );
}
