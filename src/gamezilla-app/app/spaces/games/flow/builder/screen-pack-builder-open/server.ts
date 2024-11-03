import { GameServerModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-server-v2'
import type { ServerModule } from '../types'
import { PackCreateNewServer } from './create-new-pack/server'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => PackCreateNewServer.update(input))
}

export const ScreenPackBuilderOpenServer = {
  update
}
