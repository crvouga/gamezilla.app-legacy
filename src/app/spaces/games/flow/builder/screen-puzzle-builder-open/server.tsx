import { GameServerModule } from '~/app/spaces/games/@/architecture/game-server-v2'
import type { ServerModule } from '../types'
import { CreateNewPuzzleServer } from './create-new-puzzle/server'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => CreateNewPuzzleServer.update(input))
}

export const ScreenPuzzleBuilderOpenServer = {
  update
}
