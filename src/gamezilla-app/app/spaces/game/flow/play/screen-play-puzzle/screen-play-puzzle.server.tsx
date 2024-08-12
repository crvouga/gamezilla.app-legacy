import { andThen } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { ServerModule } from '../play.types'

export const update: ServerModule['update'] = async (input) => {
  return andThen(
    { model: input.model },
    //
    (model) => recordUserCompletedPuzzle({ ...input, model })
  )
}

const recordUserCompletedPuzzle: ServerModule['update'] = async (input) => {
  switch (input.msgCore?.t) {
    case 'got-flow-play-msg': {
      return {
        model: input.model
      }
    }
  }

  return {
    model: input.model
  }
}
