import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export type GameMinesweeperInput = null

export function GameMinesweeper(_input: GameMinesweeperInput) {
  return h(Box, {}, [h(Text, { text: 'Welcome to GameMinesweeper!' })])
}

export default GameMinesweeper
