import { andThen } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { ServerModule } from '../play.types'

export const update: ServerModule['update'] = async (input) => {
  return andThen(
    {},
    //
    () => recordUserCompletedPuzzle(input)
  )
}

const recordUserCompletedPuzzle: ServerModule['update'] = async (input) => {
  switch (input.msgCore?.t) {
    case 'got-flow-play-msg': {
      return {}
    }
  }

  return {}
}
