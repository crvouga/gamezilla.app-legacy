import styles from './game-minesweeper.module.css';

/* eslint-disable-next-line */
export interface GameMinesweeperProps {}

export function GameMinesweeper(props: GameMinesweeperProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to GameMinesweeper!</h1>
    </div>
  );
}

export default GameMinesweeper;
