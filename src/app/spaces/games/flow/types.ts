import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import { GameServerModule } from '~/app/spaces/games/@/architecture/game-server-v2'
import { SpaceClientCtx } from '../../@/space-client-ctx'
import { SpaceServerCmd } from '../../@/space-server-cmd'
import { SpaceServerEvt } from '../../@/space-server-evt'
import { GameMainMenu } from '../@/game/game-main-menu'
import { FlowClientCmd, FlowClientCmdLocal } from './@/client/cmd'
import { FlowClientEvtIn } from './@/client/evt'
import { FlowServerCtx } from './@/server/ctx'
import { Pack } from './@/pack/pack'
import type { PackId } from './@/pack/pack-id'
import { PackListTypes } from './@/pack/pack-list'
import { PackPuzzlesGridTypes } from './@/pack/pack-puzzles-grid'
import type { Puzzle } from './@/puzzle/puzzle'
import type { PuzzleId } from './@/puzzle/puzzle-id'
import { PuzzleListTypes } from './@/puzzle/puzzle-list'
import { BuilderTypes } from './builder'
import { PlayTypes } from './play'
import { FlowId } from './@/flow/flow/flow-id'
import { Flow } from './@/flow'

//
//
// Model
//
//

export type ModelClient = {
  puzzles: {
    [puzzleId: PuzzleId]: Puzzle
  }
  packs: {
    [packId: PackId]: Pack
  }
  solutions: {
    [flowId: FlowId]: Flow.Model[]
  }
  puzzleList: PuzzleListTypes.ModelClient
  packList: PackListTypes.ModelClient
  packPuzzleGrid: PackPuzzlesGridTypes.ModelClient
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
  | { t: 'flow-pack-list'; c: PackListTypes.MsgClient }
  | { t: 'flow-pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgClient }
  | { t: 'flow-puzzle-list'; c: PuzzleListTypes.MsgClient }

export type MsgServer =
  | { t: 'builder'; c: BuilderTypes.MsgServer }
  | { t: 'play'; c: PlayTypes.MsgServer }
  | { t: 'flow-pack-list'; c: PackListTypes.MsgServer }
  | { t: 'flow-pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgServer }
  | { t: 'flow-puzzle-list'; c: PuzzleListTypes.MsgServer }

export type MsgToServer =
  | { t: 'builder'; c: BuilderTypes.MsgToServer }
  | { t: 'play'; c: PlayTypes.MsgToServer }
  | { t: 'flow-pack-list'; c: PackListTypes.MsgToServer }
  | { t: 'flow-pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgToServer }
  | { t: 'flow-puzzle-list'; c: PuzzleListTypes.MsgToServer }

export type MsgToClient =
  | { t: 'builder'; c: BuilderTypes.MsgToClient }
  | { t: 'play'; c: PlayTypes.MsgToClient }
  | { t: 'flow-pack-list'; c: PackListTypes.MsgToClient }
  | { t: 'flow-pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgToClient }
  | { t: 'flow-puzzle-list'; c: PuzzleListTypes.MsgToClient }

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
