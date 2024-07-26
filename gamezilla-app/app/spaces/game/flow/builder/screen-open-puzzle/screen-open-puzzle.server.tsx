import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import type { ServerModule } from '../builder.types'
import { CreateNewPuzzleServer } from './create-new/create-new-puzzle.server'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({ model: input.model }, (model) =>
    CreateNewPuzzleServer.update({
      ...input,
      model
    })
  )
}

export const ScreenOpenPuzzleServer = {
  update
}
