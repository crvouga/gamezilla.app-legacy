import type { Brand } from '~/@/brand/brand'
import { IntRange } from '~/@/range/range'

//
//
//
// Model
//
//
//

export type EloRating = Brand<number, 'EloRating'>

const MIN_ELO_RATING: EloRating = 100 as EloRating

const MAX_ELO_RATING: EloRating = 4000 as EloRating

const is = (n: unknown): n is EloRating => {
  return typeof n === 'number' && n >= MIN_ELO_RATING && n <= MAX_ELO_RATING
}

export type KFactor = IntRange<10, 40>

const fromNumber = (n: number): EloRating => {
  const cleaned = Math.max(MIN_ELO_RATING, Math.min(MAX_ELO_RATING, Math.round(n)))

  if (is(cleaned)) {
    return cleaned
  }

  throw new Error('Impossible condition')
}

//
//
//
// Model End Game
//
//
//

export type EndGame = 'win' | 'lost' | 'draw'

const endGameToSspace = (endGame: EndGame): number => {
  switch (endGame) {
    case 'win':
      return 1
    case 'lost':
      return 0
    case 'draw':
      return 0.5
  }
}

//
//
//
//
//
//
//

const toExpectedSspace = ({
  playerRating,
  opponentRating,
}: {
  playerRating: EloRating
  opponentRating: EloRating
}): number => {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400))
}

const toNewRating = ({
  rating,
  actualSspace,
  expectedSspace,
  kFactor,
}: {
  rating: EloRating
  actualSspace: number
  expectedSspace: number
  kFactor: KFactor
}): EloRating => {
  return fromNumber(rating + kFactor * (actualSspace - expectedSspace))
}

const toNextRating = ({
  playerRating,
  opponentRating,
  kFactor = defaultKFactor,
  endGame,
}: {
  playerRating: EloRating
  opponentRating: EloRating
  kFactor?: KFactor
  endGame: EndGame
}): EloRating => {
  const expectedSspace = toExpectedSspace({
    playerRating,
    opponentRating,
  })

  const actualSspace = endGameToSspace(endGame)

  return toNewRating({
    rating: playerRating,
    actualSspace,
    expectedSspace,
    kFactor,
  })
}

const initialRating = fromNumber(1200)

const defaultKFactor: KFactor = 30

//
//
//
//
//
//

export type ChessLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master' | 'Grandmaster'

const toChessLevel = (rating: number): ChessLevel => {
  if (rating < 800) {
    return 'Beginner'
  }
  if (rating < 1200) {
    return 'Intermediate'
  }
  if (rating < 1600) {
    return 'Advanced'
  }
  if (rating < 2000) {
    return 'Expert'
  }
  if (rating < 2400) {
    return 'Master'
  }
  return 'Grandmaster'
}

export const EloRating = {
  initialRating,
  toNextRating,
  fromNumber,
  is,
  toChessLevel,
}
