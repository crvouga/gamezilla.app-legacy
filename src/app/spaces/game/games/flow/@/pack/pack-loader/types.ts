import { s } from '~/@/schema'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { Pack } from '../pack'
import { PacksDbQuery } from '../pack-db/query'
import { PackId } from '../pack-id'

//
//
//
//

export type ModelFrontend = {
  results: {
    [queryKey: string]: PackId[]
  }
  queries: {
    [name: string]: PacksDbQuery
  }
}

export const initFrontend: ModelFrontend = {
  results: {},
  queries: {},
}

export const MsgFrontend = s.obj({
  t: s.l('got-pack-db-packs'),
  query: PacksDbQuery,
  packs: s.arr(Pack),
})

export type MsgFrontend = s.Infer<typeof MsgFrontend>

export type MsgToFrontend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgBackend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: FlowFrontendCtxBase
  ViewSlot: {
    fab: null
  }
  ViewEmit: {
    clickedPackItem: Pack
  }
}>
