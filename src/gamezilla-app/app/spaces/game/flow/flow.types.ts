import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { GameClientModule } from '../../@/architecture/game-client-v2'
import { GameServerModule } from '../../@/architecture/game-server-v2'
import { SpaceClientCtx, SpaceServerEvt } from '../../@/space'
import { SpaceServerCmd } from '../../@/space-server-cmd'
import type { GameMainMenu } from '../@/game'
import { FlowClientCmd, FlowClientCmdLocal } from './@/flow-client-cmd'
import { FlowClientEvt, FlowClientEvtIn } from './@/flow-client-evt'
import type { FlowPack, FlowPackListTypes } from './@/flow-pack'
import type { FlowPackId } from './@/flow-pack/flow-pack-id'
import type { FlowPuzzleListTypes } from './@/flow-puzzle'
import type { FlowPuzzle } from './@/flow-puzzle/flow-puzzle'
import type { FlowPuzzleId } from './@/flow-puzzle/flow-puzzle-id'
import { FlowServerCtx } from './@/flow-server-ctx'
import { BuilderTypes } from './builder'
import { PlayTypes } from './play'

//
//
// Model
//
//

export type ModelClient = {
  flowPuzzles: {
    [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
  }
  flowPacks: {
    [flowPackId: FlowPackId]: FlowPack
  }
  flowPuzzleList: FlowPuzzleListTypes.ModelClient
  flowPackList: FlowPackListTypes.ModelClient
  builder: BuilderTypes.ModelClient
  play: PlayTypes.ModelClient
}

export const ModelServer = p.or(
  p.obj({
    t: p.l('none')
  }),
  p.obj({
    t: p.l('builder'),
    c: BuilderTypes.ModelServer
  }),
  p.obj({
    t: p.l('play'),
    c: PlayTypes.ModelServer
  })
)

export type ModelServer = p.Infer<typeof ModelServer>

//
//
// Msg
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | { t: 'msgCore'; c: MsgCore }
  | { t: 'builder'; c: BuilderTypes.MsgClient }
  | { t: 'play'; c: PlayTypes.MsgClient }
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgClient }

export type MsgServer =
  | { t: 'builder'; c: BuilderTypes.MsgServer }
  | { t: 'play'; c: PlayTypes.MsgServer }
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgServer }

export type MsgToServer =
  | { t: 'builder'; c: BuilderTypes.MsgToServer }
  | { t: 'play'; c: PlayTypes.MsgToServer }
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgToServer }

export type MsgToClient =
  | { t: 'builder'; c: BuilderTypes.MsgToClient }
  | { t: 'play'; c: PlayTypes.MsgToClient }
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgToClient }

const MODE = ['builder', 'play'] as const
export const Mode = p.enumeration(MODE)
export type Mode = p.Infer<typeof Mode>

//
//
//
//
//
//
//

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-changed-mode'),
    mode: p.or(Mode, p.l(null)),
    userId: UserId
  }),
  p.obj({
    t: p.l('play'),
    c: PlayTypes.MsgCore
  }),
  p.obj({
    t: p.l('builder'),
    c: BuilderTypes.MsgCore
  })
)
export type MsgCore = p.Infer<typeof MsgCore>

export const ModelCore = p.obj({
  mode: p.or(Mode, p.l(null)),
  play: PlayTypes.ModelCore,
  builder: BuilderTypes.ModelCore
})
export type ModelCore = p.Infer<typeof ModelCore>

//
//
//
//
//
//
//

export type ClientModule = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  //
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  //
  MsgCore: MsgCore
  ModelCore: ModelCore
  //
  Ctx: SpaceClientCtx
  //
  MsgCmdOut: FlowClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgCmdIn: FlowClientCmdLocal
  MsgEvtIn: FlowClientEvtIn
  MsgEvtOut: FlowClientEvt
}>

export type ServerModule = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowServerCtx
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
}>
