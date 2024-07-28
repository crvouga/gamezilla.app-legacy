import { p } from 'gamezilla-app/@/core/parser'

export const GAME_NAME = ['connect-four', 'flow', 'tic-tac-toe', 'gomoku', 'chess'] as const

export const GameName = p.enumeration(GAME_NAME)

export type GameName = p.Infer<typeof GameName>

export const gameNames: { [gameName in GameName]: GameName } = {
  'connect-four': 'connect-four',
  flow: 'flow',
  'tic-tac-toe': 'tic-tac-toe',
  gomoku: 'gomoku',
  chess: 'chess'
}

export const isGameName = (x: unknown): x is GameName => {
  return typeof x === 'string' && Object.keys(gameNames).includes(x)
}
