import { andThen } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { ServerModule } from '../play.types'
import { ScreenPlayPuzzleCore } from './screen-play-puzzle.core'

export const update: ServerModule['update'] = async (input) => {
  return andThen(
    {},
    //
    () => recordUserCompletedPuzzle(input)
  )
}

const recordUserCompletedPuzzle: ServerModule['update'] = async (input) => {
  if (!input.msgCore || input.modelCore.screen.t !== 'screen-play-puzzle') {
    return {}
  }

  const updated = ScreenPlayPuzzleCore.updateScreen(input.modelCore.screen, input.msgCore)

  switch (updated.event?.t) {
    case 'user-completed-puzzle': {
      // await input.deps.flowPlayActivityDb.put([
      //   {

      //   }
      // ])
      return {}
    }
  }

  return {}
}
