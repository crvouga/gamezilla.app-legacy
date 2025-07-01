import { v } from '~/@/vdom/v'

export type GameMinesweeperInput = null

export function GameMinesweeper(_input: GameMinesweeperInput) {
  return v('h1', {}, ['Welcome to GameMinesweeper!'])
}

export default GameMinesweeper
