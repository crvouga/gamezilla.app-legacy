import styles from './game-shared.module.css';

/* eslint-disable-next-line */
export interface GameSharedProps {}

export function GameShared(props: GameSharedProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to GameShared!</h1>
    </div>
  );
}

export default GameShared;
