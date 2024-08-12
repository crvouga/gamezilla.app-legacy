import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import type { ServerModule } from '../builder.types'
import { PackCreateNewServer } from './create-new-pack/create-new-pack.server'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => PackCreateNewServer.update(input))
}

export const ScreenOpenPackServer = {
  update
}
