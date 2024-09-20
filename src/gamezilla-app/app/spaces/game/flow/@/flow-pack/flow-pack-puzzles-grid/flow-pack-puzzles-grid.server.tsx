import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { sendToClient } from 'gamezilla-app/app/@/server'
import type { SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { FlowServerCtx } from '../../flow-server-ctx'
import type { ModelServer, MsgServer, MsgToClient, MsgToServer } from './flow-pack-puzzles-grid.types'

type ServerModule = AppServerModule<{
  Ctx: FlowServerCtx
  Model: ModelServer
  Msg: MsgServer
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: null
}>

const ListPuzzlesById: Pick<ServerModule, 'update'> = {
  async update(input) {
    switch (input.msgClient?.t) {
      case 'list-puzzles-by-id': {
        const listed = await input.ctx.flowPuzzleDb.list({
          pagination: {
            limit: input.msgClient.puzzleIds.length,
            offset: 0
          },
          order: {
            createdAt: 'asc'
          },
          where: {
            puzzleId: {
              in: input.msgClient.puzzleIds
            }
          }
        })
        return {
          msgCmd: [
            sendToClient(input.msgClient, {
              t: 'listed-puzzles-by-id',
              listed,
              causedBy: { msgClient: input.msgClient }
            })
          ]
        }
      }
    }
    return {}
  }
}

export const FlowPackPuzzlesGridServer: Pick<ServerModule, 'update'> = {
  async update(input) {
    return AppServerModule.andThen(
      {},
      () => ListPuzzlesById.update(input)
      //
    )
  }
}
