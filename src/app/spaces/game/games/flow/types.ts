import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { FlowBackendCtx } from './@/backend/ctx'
import { FlowFrontendCmd, FlowFrontendCmdLocal } from './@/frontend/cmd'
import { FlowFrontendEvtIn } from './@/frontend/evt'
import { Pack } from './@/pack/pack'
import { PackDbQueryTypes } from './@/pack/pack-db-query'
import type { PackId } from './@/pack/pack-id'
import type { Puzzle } from './@/puzzle/puzzle'
import { PuzzleDbQueryTypes } from './@/puzzle/puzzle-db-query'
import type { PuzzleId } from './@/puzzle/puzzle-id'
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
  puzzleDbQuery: PuzzleDbQueryTypes.ModelFrontend
  packDbQuery: PackDbQueryTypes.ModelFrontend
  builder: BuilderTypes.ModelFrontend
  play: PlayTypes.ModelFrontend
}

export const ModelBackend = p.obj({
  t: p.l('noop'),
})
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
  | { t: 'pack-db-query'; c: PackDbQueryTypes.MsgFrontend }
  | { t: 'puzzle-db-query'; c: PuzzleDbQueryTypes.MsgFrontend }

export type MsgBackend =
  | { t: 'builder'; c: BuilderTypes.MsgBackend }
  | { t: 'play'; c: PlayTypes.MsgBackend }
  | { t: 'pack-db-query'; c: PackDbQueryTypes.MsgBackend }
  | { t: 'puzzle-db-query'; c: PuzzleDbQueryTypes.MsgBackend }

export type MsgToBackend =
  | { t: 'builder'; c: BuilderTypes.MsgToBackend }
  | { t: 'play'; c: PlayTypes.MsgToBackend }
  | { t: 'pack-db-query'; c: PackDbQueryTypes.MsgToBackend }
  | { t: 'puzzle-db-query'; c: PuzzleDbQueryTypes.MsgToBackend }

export type MsgToFrontend =
  | { t: 'builder'; c: BuilderTypes.MsgToFrontend }
  | { t: 'play'; c: PlayTypes.MsgToFrontend }
  | { t: 'pack-db-query'; c: PackDbQueryTypes.MsgToFrontend }
  | { t: 'puzzle-db-query'; c: PuzzleDbQueryTypes.MsgToFrontend }

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
