import { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import type { ServerModule } from '../types'
import { DeleteForeverServer } from './delete-forever/server'
import { EditPuzzleNameServer } from './edit-puzzle-name/server'
import { SaveChangesServer } from './save-changes/server'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    {},
    () => DeleteForeverServer.update(input),
    () => EditPuzzleNameServer.update(input),
    () => SaveChangesServer.update(input)
  )
}

export const ScreenPuzzleBuilderServer: Pick<ServerModule, 'update'> = {
  update
}
