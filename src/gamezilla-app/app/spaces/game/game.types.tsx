import { p } from 'gamezilla-app/@/core/parser'
import { SpaceClientCtx, SpaceServerCtx, SpaceServerEvt } from '../@/space'
import { SpaceClientCmd } from '../@/space-client-cmd'
import { SpaceClientEvt } from '../@/space-client-evt'
import { SpaceServerCmd } from '../@/space-server-cmd'
import { GameClientModule } from './@/architecture/game-client-v2'
import { GameServerModule } from './@/architecture/game-server-v2'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four.types'
import { FlowServerCtx } from './flow/@/flow-server-ctx'
import * as Flow from './flow/types'
//
//
//
// Model
//
//
//

export type ModelClient = { t: 'connect-four'; c: ConnectFour.ModelClient } | { t: 'flow'; c: Flow.ModelClient }

export const ModelServer = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.ModelServer
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.ModelServer
  })
)
export type ModelServer = p.Infer<typeof ModelServer>

//
//
//
// Msg
//
//
//

export type MsgServer = { t: 'connect-four'; c: ConnectFour.MsgServer } | { t: 'flow'; c: Flow.MsgServer }

export type MsgClient = { t: 'connect-four'; c: ConnectFour.MsgClient } | { t: 'flow'; c: Flow.MsgClient }

export type MsgToClient = { t: 'connect-four'; c: ConnectFour.MsgToClient } | { t: 'flow'; c: Flow.MsgToClient }

export type MsgToServer = { t: 'connect-four'; c: ConnectFour.MsgToServer } | { t: 'flow'; c: Flow.MsgToServer }

//
//
//
// Game Name
//
//
//

export const gameNameList: GameName[] = [
  // "connect-four",
  'flow'
]

export const ModelCore = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.ModelCore
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.ModelCore
  })
)
export type ModelCore = p.Infer<typeof ModelCore>

export const MsgCore = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.MsgCore
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.MsgCore
  })
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
  MsgToServer: MsgToServer
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceClientCtx
  MsgEvtIn: SpaceClientEvt
  MsgCmdOut: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
}>

export type GameServerCtx = SpaceServerCtx & {
  flow: FlowServerCtx
}

export type ServerModule = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: GameServerCtx
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  Deps: null
}>
