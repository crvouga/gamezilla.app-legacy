import styles from './game-battleship.module.css';

/* eslint-disable-next-line */
export interface GameBattleshipProps {}

export function GameBattleship(props: GameBattleshipProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to GameBattleship!</h1>
    </div>
  );
}

export default GameBattleship;
