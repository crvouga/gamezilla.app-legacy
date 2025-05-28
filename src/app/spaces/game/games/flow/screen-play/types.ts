import { p } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import type { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { GameSpaceModule } from '~/app/spaces/game/games/@/architecture/game-space'
import { GameMainMenu } from '../../@/ui/game-main-menu'
import { FlowBackendCtx } from '../@/backend/ctx'
import type { FlowFrontendCtx } from '../@/frontend/ctx'
import { Pack } from '../@/pack/pack'
import { PuzzleResult } from '../@/puzzle/puzzle-result'
import { FlowSpaceCtx } from '../@/space/ctx'
import { FlowSpaceEvt } from '../@/space/event'
import { ScreenPuzzleTypes } from './screen-play-puzzle'

export type ModelFrontend = null

export type MsgFrontend = GameMainMenu.Msg | { t: 'got-msg-space'; c: MsgSpace } | { t: 'got-msg-out'; c: unknown }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export const MsgSpace = p.or(
  p.obj({
    t: p.l('user-clicked-exit-play-mode-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-clicked-select-pack-back-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-clicked-open-pack-puzzle-grid-item'),
    pack: Pack,
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-clicked-exit-screen-open-pack'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-clicked-open-screen-play-puzzle'),
    puzzle: PuzzleResult,
    puzzleIndex: p.num,
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-changed-slides'),
    slideIndex: p.num,
    userId: UserId,
  }),
  ScreenPuzzleTypes.MsgSpace,
)

export type MsgSpace = p.Infer<typeof MsgSpace>

const Screen = p.or(
  p.obj({
    t: p.l('screen-select-pack'),
  }),
  p.obj({
    t: p.l('screen-select-puzzle'),
    pack: Pack,
    slideIndex: p.num,
  }),
  ScreenPuzzleTypes.ModelSpace,
)

export const ModelSpace = p.obj({
  screen: Screen,
})
export type ModelSpace = p.Infer<typeof ModelSpace>

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
  Ctx: FlowFrontendCtx
}>

export type BackendModule = GameBackendModule<{
  Msg: MsgBackend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
}>

export type SpaceModule = GameSpaceModule<{
  Ctx: FlowSpaceCtx
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  EvtSpace: FlowSpaceEvt
}>
