import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { GameClientModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-client-v2'
import { GameServerModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-server-v2'
import { SpaceServerCmd } from '../../@/space-server-cmd'
import { GameMainMenu } from '../@/game/game-main-menu'
import { FlowClientCmd, FlowClientCmdLocal } from './@/flow-client-cmd'
import { FlowClientEvtIn } from './@/flow-client-evt'
import { FlowServerCtx } from './@/flow-server-ctx'
import { FlowPack } from './@/pack/pack'
import type { FlowPackId } from './@/pack/pack-id'
import { FlowPackListTypes } from './@/pack/pack-list'
import { FlowPackPuzzlesGridTypes } from './@/pack/pack-puzzles-grid'
import type { FlowPuzzle } from './@/puzzle/puzzle'
import type { FlowPuzzleId } from './@/puzzle/puzzle-id'
import { FlowPuzzleListTypes } from './@/puzzle/puzzle-list'
import { BuilderTypes } from './builder'
import { PlayTypes } from './play'
import { SpaceServerEvt } from '../../@/space-server-evt'
import { SpaceClientCtx } from '../../@/space-client-ctx'

//
//
// Model
//
//

export type ModelClient = {
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle
  }
  packs: {
    [packId: FlowPackId]: FlowPack
  }
  puzzleList: FlowPuzzleListTypes.ModelClient
  packList: FlowPackListTypes.ModelClient
  packPuzzleGrid: FlowPackPuzzlesGridTypes.ModelClient
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
  | { t: 'got-msg-core'; c: MsgCore }
  | { t: 'builder'; c: BuilderTypes.MsgClient }
  | { t: 'play'; c: PlayTypes.MsgClient }
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgClient }
  | { t: 'flow-pack-puzzles-grid'; c: FlowPackPuzzlesGridTypes.MsgClient }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgClient }

export type MsgServer =
  | { t: 'builder'; c: BuilderTypes.MsgServer }
  | { t: 'play'; c: PlayTypes.MsgServer }
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgServer }
  | { t: 'flow-pack-puzzles-grid'; c: FlowPackPuzzlesGridTypes.MsgServer }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgServer }

export type MsgToServer =
  | { t: 'builder'; c: BuilderTypes.MsgToServer }
  | { t: 'play'; c: PlayTypes.MsgToServer }
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgToServer }
  | { t: 'flow-pack-puzzles-grid'; c: FlowPackPuzzlesGridTypes.MsgToServer }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgToServer }

export type MsgToClient =
  | { t: 'builder'; c: BuilderTypes.MsgToClient }
  | { t: 'play'; c: PlayTypes.MsgToClient }
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgToClient }
  | { t: 'flow-pack-puzzles-grid'; c: FlowPackPuzzlesGridTypes.MsgToClient }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgToClient }

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
    mode: p.or(Mode, p.l('none')),
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
  mode: p.or(Mode, p.l('none')),
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
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: SpaceClientCtx
  MsgCmdOut: FlowClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgCmdIn: FlowClientCmdLocal
  MsgEvtIn: FlowClientEvtIn
  MsgEvtOut: FlowClientEvtIn
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
