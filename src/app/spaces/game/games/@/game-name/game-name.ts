import { s } from '~/@/schema'

export const GAME_NAME = ['connect-four', 'numberlink', 'tic-tac-toe', 'gomoku', 'chess'] as const

export const GameName = s.enumeration(GAME_NAME)

export type GameName = s.Infer<typeof GameName>

export const gameNames: { [gameName in GameName]: GameName } = {
  'connect-four': 'connect-four',
  numberlink: 'numberlink',
  'tic-tac-toe': 'tic-tac-toe',
  gomoku: 'gomoku',
  chess: 'chess',
}

export const isGameName = (x: unknown): x is GameName => {
  return typeof x === 'string' && Object.keys(gameNames).includes(x)
}
