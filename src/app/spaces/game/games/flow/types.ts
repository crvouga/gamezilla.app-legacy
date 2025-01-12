import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { SpaceBackendCmd } from '~/app/spaces/@/space-server/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-server/evt'
import { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { FlowClientCmd, FlowClientCmdLocal } from './@/client/cmd'
import { FlowClientEvtIn } from './@/client/evt'
import { Pack } from './@/pack/pack'
import type { PackId } from './@/pack/pack-id'
import { PackListTypes } from './@/pack/pack-list'
import { PackPuzzlesGridTypes } from './@/pack/pack-puzzles-grid'
import type { Puzzle } from './@/puzzle/puzzle'
import type { PuzzleId } from './@/puzzle/puzzle-id'
import { PuzzleListTypes } from './@/puzzle/puzzle-list'
import { FlowBackendCtx } from './@/server/ctx'
import { Solutions } from './@/solutions/solutions'
import { BuilderTypes } from './builder'
import { PlayTypes } from './play'

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
  solutions: Solutions
  puzzleList: PuzzleListTypes.ModelClient
  packList: PackListTypes.ModelClient
  packPuzzleGrid: PackPuzzlesGridTypes.ModelClient
  builder: BuilderTypes.ModelClient
  play: PlayTypes.ModelClient
}

export const ModelBackend = p.or(
  p.obj({
    t: p.l('none'),
  }),
  p.obj({
    t: p.l('builder'),
    c: BuilderTypes.ModelBackend,
  }),
  p.obj({
    t: p.l('play'),
    c: PlayTypes.ModelBackend,
  }),
)

export type ModelBackend = p.Infer<typeof ModelBackend>

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
  | { t: 'pack-list'; c: PackListTypes.MsgClient }
  | { t: 'pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgClient }
  | { t: 'puzzle-list'; c: PuzzleListTypes.MsgClient }

export type MsgBackend =
  | { t: 'builder'; c: BuilderTypes.MsgBackend }
  | { t: 'play'; c: PlayTypes.MsgBackend }
  | { t: 'pack-list'; c: PackListTypes.MsgBackend }
  | { t: 'pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgBackend }
  | { t: 'puzzle-list'; c: PuzzleListTypes.MsgBackend }

export type MsgToBackend =
  | { t: 'builder'; c: BuilderTypes.MsgToBackend }
  | { t: 'play'; c: PlayTypes.MsgToBackend }
  | { t: 'pack-list'; c: PackListTypes.MsgToBackend }
  | { t: 'pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgToBackend }
  | { t: 'puzzle-list'; c: PuzzleListTypes.MsgToBackend }

export type MsgToClient =
  | { t: 'builder'; c: BuilderTypes.MsgToClient }
  | { t: 'play'; c: PlayTypes.MsgToClient }
  | { t: 'pack-list'; c: PackListTypes.MsgToClient }
  | { t: 'pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgToClient }
  | { t: 'puzzle-list'; c: PuzzleListTypes.MsgToClient }

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
    userId: UserId,
  }),
  p.obj({
    t: p.l('play'),
    c: PlayTypes.MsgCore,
  }),
  p.obj({
    t: p.l('builder'),
    c: BuilderTypes.MsgCore,
  }),
)
export type MsgCore = p.Infer<typeof MsgCore>

export const ModelCore = p.obj({
  mode: p.or(Mode, p.l('none')),
  play: PlayTypes.ModelCore,
  builder: BuilderTypes.ModelCore,
  solutions: Solutions,
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
  MsgToBackend: MsgToBackend
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: SpaceClientCtx
  MsgCmdOut: FlowClientCmd<{
    MsgToBackend: MsgToBackend
    MsgClient: MsgClient
  }>
  MsgCmdIn: FlowClientCmdLocal
  MsgEvtIn: FlowClientEvtIn
  MsgEvtOut: FlowClientEvtIn
}>

export type BackendModule = GameBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
}>
