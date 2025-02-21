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
import type { PackId } from './@/pack/pack-id'
import { PackLoaderTypes } from './@/pack/pack-loader'
import type { Puzzle } from './@/puzzle/puzzle'
import type { PuzzleId } from './@/puzzle/puzzle-id'
import { PuzzleLoaderTypes } from './@/puzzle/puzzle-loader'
import { Solutions } from './@/solutions/solutions'
import { BuildTypes } from './screen-build'
import { PlayTypes } from './screen-play'

//
//
// Model
//
//

export type ModelFrontend = {
  puzzles: { [puzzleId: PuzzleId]: Puzzle }
  packs: { [packId: PackId]: Pack }
  solutions: Solutions
  puzzleLoader: PuzzleLoaderTypes.ModelFrontend
  packLoader: PackLoaderTypes.ModelFrontend
  screenBuild: BuildTypes.ModelFrontend
  screenPlay: PlayTypes.ModelFrontend
}

export const ModelBackend = p.obj({ t: p.l('noop') })
export type ModelBackend = p.Infer<typeof ModelBackend>

//
//
// Msg
//
//

export type MsgFrontend =
  | GameMainMenu.Msg
  | { t: 'got-msg-space'; c: MsgSpace }
  | { t: 'got-msg-build'; c: BuildTypes.MsgFrontend }
  | { t: 'got-msg-play'; c: PlayTypes.MsgFrontend }
  | { t: 'got-pack-loader-msg'; c: PackLoaderTypes.MsgFrontend }
  | { t: 'got-puzzle-loader-msg'; c: PuzzleLoaderTypes.MsgFrontend }

export type MsgBackend =
  | { t: 'got-msg-build'; c: BuildTypes.MsgBackend }
  | { t: 'got-msg-play'; c: PlayTypes.MsgBackend }
  | { t: 'got-pack-loader-msg'; c: PackLoaderTypes.MsgBackend }
  | { t: 'got-puzzle-loader-msg'; c: PuzzleLoaderTypes.MsgBackend }

export type MsgToBackend =
  | { t: 'got-msg-build'; c: BuildTypes.MsgToBackend }
  | { t: 'got-msg-play'; c: PlayTypes.MsgToBackend }
  | { t: 'got-pack-loader-msg'; c: PackLoaderTypes.MsgToBackend }
  | { t: 'got-puzzle-loader-msg'; c: PuzzleLoaderTypes.MsgToBackend }

export type MsgToFrontend =
  | { t: 'got-msg-build'; c: BuildTypes.MsgToFrontend }
  | { t: 'got-msg-play'; c: PlayTypes.MsgToFrontend }
  | { t: 'got-pack-loader-msg'; c: PackLoaderTypes.MsgToFrontend }
  | { t: 'got-puzzle-loader-msg'; c: PuzzleLoaderTypes.MsgToFrontend }

const MODE = ['build', 'play'] as const
export const Mode = p.enumeration(MODE)
export type Mode = p.Infer<typeof Mode>

//
//
//
// Space
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
    t: p.l('got-msg-play'),
    c: PlayTypes.MsgSpace,
  }),
  p.obj({
    t: p.l('got-msg-build'),
    c: BuildTypes.MsgSpace,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>

export const ModelSpace = p.obj({
  mode: p.or(Mode, p.l('none')),
  screenPlay: PlayTypes.ModelSpace,
  screenBuild: BuildTypes.ModelSpace,
})
export type ModelSpace = p.Infer<typeof ModelSpace>

//
//
//
// Module
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
