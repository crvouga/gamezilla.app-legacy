import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { FlowBackendCtx } from './@/backend/ctx'
import { FlowFrontendCmd, FlowFrontendCmdLocal } from './@/frontend/cmd'
import { FlowFrontendEvtIn } from './@/frontend/evt'
import { Pack } from './@/pack/pack'
import type { PackId } from './@/pack/pack-id'
import { PackListTypes } from './@/pack/pack-list'
import { PackPuzzlesGridTypes } from './@/pack/pack-puzzles-grid'
import type { Puzzle } from './@/puzzle/puzzle'
import type { PuzzleId } from './@/puzzle/puzzle-id'
import { PuzzleListTypes } from './@/puzzle/puzzle-list'
import { Solutions } from './@/solutions/solutions'
import { BuilderTypes } from './builder'
import { PlayTypes } from './play'

//
//
// Model
//
//

export type ModelFrontend = {
  puzzles: {
    [puzzleId: PuzzleId]: Puzzle
  }
  packs: {
    [packId: PackId]: Pack
  }
  solutions: Solutions
  puzzleList: PuzzleListTypes.ModelFrontend
  packList: PackListTypes.ModelFrontend
  packPuzzleGrid: PackPuzzlesGridTypes.ModelFrontend
  builder: BuilderTypes.ModelFrontend
  play: PlayTypes.ModelFrontend
}

export const ModelBackend = p.or(
  p.obj({
    t: p.l('none'),
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

export type MsgFrontend =
  | GameMainMenu.Msg
  | { t: 'got-msg-space'; c: MsgSpace }
  | { t: 'builder'; c: BuilderTypes.MsgFrontend }
  | { t: 'play'; c: PlayTypes.MsgFrontend }
  | { t: 'pack-list'; c: PackListTypes.MsgFrontend }
  | { t: 'pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgFrontend }
  | { t: 'puzzle-list'; c: PuzzleListTypes.MsgFrontend }

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

export type MsgToFrontend =
  | { t: 'builder'; c: BuilderTypes.MsgToFrontend }
  | { t: 'play'; c: PlayTypes.MsgToFrontend }
  | { t: 'pack-list'; c: PackListTypes.MsgToFrontend }
  | { t: 'pack-puzzles-grid'; c: PackPuzzlesGridTypes.MsgToFrontend }
  | { t: 'puzzle-list'; c: PuzzleListTypes.MsgToFrontend }

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

export const MsgSpace = p.or(
  p.obj({
    t: p.l('user-changed-mode'),
    mode: p.or(Mode, p.l('none')),
    userId: UserId,
  }),
  p.obj({
    t: p.l('play'),
    c: PlayTypes.MsgSpace,
  }),
  p.obj({
    t: p.l('builder'),
    c: BuilderTypes.MsgSpace,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>

export const ModelSpace = p.obj({
  mode: p.or(Mode, p.l('none')),
  play: PlayTypes.ModelSpace,
  builder: BuilderTypes.ModelSpace,
  solutions: Solutions,
})
export type ModelSpace = p.Infer<typeof ModelSpace>

//
//
//
//
//
//
//

export type FrontendModule = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: SpaceFrontendCtx
  MsgCmdOut: FlowFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
  MsgCmdIn: FlowFrontendCmdLocal
  MsgEvtIn: FlowFrontendEvtIn
  MsgEvtOut: FlowFrontendEvtIn
}>

export type BackendModule = GameBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
}>
