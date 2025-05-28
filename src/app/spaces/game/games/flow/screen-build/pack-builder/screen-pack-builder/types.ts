import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { GameBackendModule } from '../../../../@/architecture/game-backend-v2'
import { GameFrontendModule } from '../../../../@/architecture/game-frontend-v2'
import { FlowBackendCtx } from '../../../@/backend/ctx'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { ModePlay } from '../../../@/mode-play'
import { Pack } from '../../../@/pack/pack'
import { PuzzleResult } from '../../../@/puzzle/puzzle-result'
import { FlowSpaceCtx } from '../../../@/space/ctx'
import { ScreenAddPuzzleTypes } from './screen-add-puzzle'
import { EditPackNameTypes } from './surface-edit-pack-name'

//
//
//
//
//

export type ModelFrontend = {}

export const initFrontend: ModelFrontend = {}

//
//
//
//

export type MsgFrontend = { t: 'got-msg-space'; c: MsgSpace } | { t: 'got-msg-out'; c: unknown }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

//
//
//
//
//

const ScreenPuzzle = s.obj({
  t: s.l('screen-puzzle'),
  puzzleIndex: s.num,
  puzzleResult: PuzzleResult,
  play: s.maybe(ModePlay.Model),
})

export type ScreenPuzzle = s.Infer<typeof ScreenPuzzle>

export const Screen = s.or(
  s.obj({
    t: s.l('screen-add-puzzle'),
  }),
  s.obj({
    t: s.l('screen-puzzle-grid'),
  }),
  ScreenPuzzle,
)

export type Screen = s.Infer<typeof Screen>

export const ModelSpace = s.and(
  ScreenAddPuzzleTypes.ModelSpace,
  EditPackNameTypes.ModelSpace,
  s.obj({
    pack: Pack,
    screen: Screen,
    slideIndex: s.num,
    opened: s.maybe(s.or(s.l('edit-pack-name-drawer'), s.l('more'))),
  }),
)

export type ModelSpace = s.Infer<typeof ModelSpace>

export const MsgSpace = s.or(
  ScreenAddPuzzleTypes.MsgSpace,
  EditPackNameTypes.MsgSpace,
  s.obj({
    t: s.l('screen-pack-builder.user-clicked-back-button'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.saved-pack'),
    saved: Result.schema(s.str, Pack),
  }),
  s.obj({
    t: s.l('screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.user-clicked-pack-item'),
    puzzleResult: PuzzleResult,
    puzzleIndex: s.num,
  }),
  s.obj({
    t: s.l('screen-pack-builder.user-changed-slide'),
    newSlideIndex: s.num,
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.got-flow-play-msg'),
    c: ModePlay.Msg,
  }),
  s.obj({
    t: s.l('screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.puzzle-screen.user-clicked-next-puzzle'),
    userId: UserId,
    nextPuzzleResult: PuzzleResult,
  }),
  s.obj({
    t: s.l('screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button'),
    userId: UserId,
    previousPuzzleResult: PuzzleResult,
  }),
  s.obj({
    t: s.l('screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('screen-pack-builder.puzzle-screen.user-closed-more-drawer'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('remove-puzzle-from-pack.user-clicked-remove-from-pack-button'),
    puzzleIndex: s.num,
    userId: UserId,
  }),
)

export type MsgSpace = s.Infer<typeof MsgSpace>

type MsgOutSpace = {
  t: 'exit-pack-builder'
}

export type UpdateSpace = (input: {
  ctx: FlowSpaceCtx
  msgSpace: MsgSpace
  modelSpace: ModelSpace
}) => ModelSpace & { msgs?: MsgOutSpace[] }

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
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: FlowBackendCtx
  Msg: MsgBackend
  Deps: null
}>
