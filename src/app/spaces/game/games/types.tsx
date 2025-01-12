import { p } from '~/@/parser'
import { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { SpaceClientEvt } from '~/app/spaces/@/space-client/evt'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { GameClientModule } from './@/architecture/game-client-v2'
import { GameBackendModule } from './@/architecture/game-backend-v2'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four.types'
import { FlowBackendCtx } from './flow/@/backend/ctx'
import * as Flow from './flow/types'

//
//
//
//
//
//
//

export type ModelClient = { t: 'connect-four'; c: ConnectFour.ModelClient } | { t: 'flow'; c: Flow.ModelClient }

export const ModelBackend = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.ModelBackend,
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.ModelBackend,
  }),
)
export type ModelBackend = p.Infer<typeof ModelBackend>

//
//
//
//
//
//
//

export type MsgBackend = { t: 'connect-four'; c: ConnectFour.MsgBackend } | { t: 'flow'; c: Flow.MsgBackend }

export type MsgClient = { t: 'connect-four'; c: ConnectFour.MsgClient } | { t: 'flow'; c: Flow.MsgClient }

export type MsgToClient = { t: 'connect-four'; c: ConnectFour.MsgToClient } | { t: 'flow'; c: Flow.MsgToClient }

export type MsgToBackend = { t: 'connect-four'; c: ConnectFour.MsgToBackend } | { t: 'flow'; c: Flow.MsgToBackend }

//
//
//
// Game Name
//
//
//

export const gameNameList: GameName[] = [
  // "connect-four",
  'flow',
]

export const ModelCore = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.ModelCore,
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.ModelCore,
  }),
)
export type ModelCore = p.Infer<typeof ModelCore>

export const MsgCore = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.MsgCore,
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.MsgCore,
  }),
)
export type MsgCore = p.Infer<typeof MsgCore>

//
//
//
//
//
//

export type ClientModule = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceClientCtx
  MsgEvtIn: SpaceClientEvt
  MsgCmdOut: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToBackend: MsgToBackend
  }>
}>

export type GameBackendCtx = SpaceBackendCtx & {
  flow: FlowBackendCtx
}

export type BackendModule = GameBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: GameBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
  Deps: null
}>
