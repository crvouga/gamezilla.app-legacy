import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { GameClientModule } from '../../@/architecture/game-client-v2'
import { GameServerModule } from '../../@/architecture/game-server-v2'
import { SpaceClientCtx, SpaceClientEvt, SpaceServerCtx, SpaceServerEvt } from '../../@/space'
import { SpaceClientCmd } from '../../@/space-client-cmd'
import { SpaceServerCmd } from '../../@/space-server-cmd'
import type { GameMainMenu } from '../@/game'
import type { FlowPack } from './@/flow-pack'
import type { FlowPackId } from './@/flow-pack/flow-pack-id'
import type { FlowPuzzleList } from './@/flow-puzzle'
import type { FlowPuzzle } from './@/flow-puzzle/flow-puzzle'
import type { FlowPuzzleId } from './@/flow-puzzle/flow-puzzle-id'
import { BuilderTypes } from './builder'
import { BuilderServer } from './builder/builder.server'
import { PlayTypes } from './play'
import { PlayServer } from './play/play.server'

//
//
// Model
//
//

export type BaseModelClient = {
  flowPuzzles: {
    [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
  }
  flowPacks: {
    [flowPackId: FlowPackId]: FlowPack
  }
  flowPuzzleList: FlowPuzzleList.ModelClient
}

export type VariantModelClient =
  | { t: 'none' }
  | { t: 'builder'; c: BuilderTypes.ModelClient }
  | { t: 'play'; c: PlayTypes.ModelClient }

export type ModelClient = BaseModelClient & VariantModelClient

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

export type MsgServer = { t: 'builder'; c: BuilderTypes.MsgServer } | { t: 'play'; c: PlayTypes.MsgServer }

export type MsgToServer = { t: 'builder'; c: BuilderTypes.MsgToServer } | { t: 'play'; c: PlayTypes.MsgToServer }

export type MsgToClient = { t: 'builder'; c: BuilderTypes.MsgToClient } | { t: 'play'; c: PlayTypes.MsgToClient }

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

export const ModelCore = p.or(
  p.obj({ t: p.l(null) }),
  p.obj({ t: p.l('builder'), c: BuilderTypes.ModelCore }),
  p.obj({ t: p.l('play'), c: PlayTypes.ModelCore })
)
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
  MsgCmdOut: SpaceClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgEvtIn: SpaceClientEvt
}>

export type ServerModule = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: SpaceServerCtx
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  Deps: {
    builder: Awaited<ReturnType<(typeof BuilderServer)['deps']>>
    play: Awaited<ReturnType<(typeof PlayServer)['deps']>>
  }
}>
