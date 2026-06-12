import { createPortal } from 'react-dom';
import styles from './CrtOverlay.module.css';

type CrtOverlayProps = {
  variant?: 'default' | 'subtle';
  embedded?: boolean;
};

export function CrtOverlay({ variant = 'default', embedded = false }: CrtOverlayProps) {
  const overlayClass = [
    styles.overlay,
    variant === 'subtle' ? styles.subtle : '',
    embedded ? styles.embedded : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <div className={overlayClass} aria-hidden="true">
      <div className={styles.phosphor} />
      <div className={styles.glow} />
      <div className={styles.vignette} />
      <div className={styles.noise} />
      <div className={styles.flicker} />
    </div>
  );

  if (embedded) {
    return content;
  }

  return createPortal(content, document.body);
}
