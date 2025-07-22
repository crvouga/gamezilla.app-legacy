import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'

export type GameMinesweeperInput = null

export function GameMinesweeper(_input: GameMinesweeperInput) {
  return h(Box, {}, ['Welcome to GameMinesweeper!'])
}

export default GameMinesweeper
