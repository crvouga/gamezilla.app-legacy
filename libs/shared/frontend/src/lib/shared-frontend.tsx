import styles from './shared-frontend.module.css';

/* eslint-disable-next-line */
export interface SharedFrontendProps {}

export function SharedFrontend(props: SharedFrontendProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SharedFrontend!</h1>
    </div>
  );
}

export default SharedFrontend;
