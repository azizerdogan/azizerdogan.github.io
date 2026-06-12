import linkedInPhoto from '../../assets/images/LinkedIn Photo.png';
import styles from './UserProfile.module.css';

type UserProfileProps = {
  onClick: () => void;
};

export function UserProfile({ onClick }: UserProfileProps) {
  return (
    <button className={styles.card} onClick={onClick} type="button">
      <div className={styles.photoWrap}>
        <img
          src={linkedInPhoto}
          alt="Aziz Erdogan"
          className={styles.photo}
          draggable={false}
        />
      </div>
      <div className={styles.info}>
        <span className={styles.name}>Aziz Erdogan</span>
        <span className={styles.title}>QA Engineer</span>
      </div>
    </button>
  );
}
