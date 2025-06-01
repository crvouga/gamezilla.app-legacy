import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import type { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { GameSpaceModule } from '~/app/spaces/game/games/@/architecture/game-space'
import { GameMainMenu } from '../../@/ui/game-main-menu'
import type { FlowFrontendCtx } from '../@/frontend/ctx'
import { Pack } from '../@/pack/pack'
import { PuzzleResult } from '../@/puzzle/puzzle-result'
import { FlowSpaceCtx } from '../@/space/ctx'
import { FlowSpaceEvt } from '../@/space/event'
import { ScreenPuzzleTypes } from './screen-play-puzzle'

export type ModelFrontend = null

export type MsgFrontend = GameMainMenu.Msg | { t: 'got-msg-space'; c: MsgSpace } | { t: 'got-msg-out'; c: unknown }

export const MsgSpace = s.or(
  s.obj({
    t: s.l('user-clicked-exit-play-mode-button'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-clicked-select-pack-back-button'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-clicked-open-pack-puzzle-grid-item'),
    pack: Pack,
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-clicked-exit-screen-open-pack'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-clicked-open-screen-play-puzzle'),
    puzzle: PuzzleResult,
    puzzleIndex: s.num(),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-changed-slides'),
    slideIndex: s.num(),
    userId: UserId,
  }),
  ScreenPuzzleTypes.MsgSpace,
)

export type MsgSpace = s.Infer<typeof MsgSpace>

const Screen = s.or(
  s.obj({
    t: s.l('screen-select-pack'),
  }),
  s.obj({
    t: s.l('screen-select-puzzle'),
    pack: Pack,
    slideIndex: s.num(),
  }),
  ScreenPuzzleTypes.ModelSpace,
)

export const ModelSpace = s.obj({
  screen: Screen,
})
export type ModelSpace = s.Infer<typeof ModelSpace>

//
//
//
//
//
//

export type FrontendModule = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: FlowFrontendCtx
}>

export type SpaceModule = GameSpaceModule<{
  Ctx: FlowSpaceCtx
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  EvtSpace: FlowSpaceEvt
}>
