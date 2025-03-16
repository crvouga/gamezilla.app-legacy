import { p } from '~/@/parser'
import { Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { GameBackendModule } from '../../../../@/architecture/game-backend-v2'
import { GameFrontendModule } from '../../../../@/architecture/game-frontend-v2'
import { FlowBackendCtx } from '../../../@/backend/ctx'
import { FlowFrontendCmd } from '../../../@/frontend/cmd'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { FlowFrontendEvtIn } from '../../../@/frontend/evt'
import { ModePlay } from '../../../@/mode-play'
import { Pack } from '../../../@/pack/pack'
import { PackLoaderTypes } from '../../../@/pack/pack-loader'
import { PuzzleLoaderTypes } from '../../../@/puzzle/puzzle-loader'
import { PuzzleResult } from '../../../@/puzzle/puzzle-result'
import { HintCalculatorTypes } from '../../../@/solutions/hint-calculator'
import { SolutionsLoaderTypes } from '../../../@/solutions/solutions-loader'
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

export type MsgFrontend =
  | { t: 'got-msg-space'; c: MsgSpace }
  | { t: 'got-pack-loader-msg'; c: PackLoaderTypes.MsgFrontend }
  | { t: 'got-puzzle-loader-msg'; c: PuzzleLoaderTypes.MsgFrontend }
  | { t: 'got-hint-calculator-msg'; c: HintCalculatorTypes.MsgFrontend }
  | { t: 'got-solution-loader-msg'; c: SolutionsLoaderTypes.MsgFrontend }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

//
//
//
//
//

const ScreenPuzzle = p.obj({
  t: p.l('screen-puzzle'),
  puzzleIndex: p.num,
  puzzleResult: PuzzleResult,
  play: p.maybe(ModePlay.Model),
})

export type ScreenPuzzle = p.Infer<typeof ScreenPuzzle>

export const Screen = p.or(
  p.obj({
    t: p.l('screen-add-puzzle'),
  }),
  p.obj({
    t: p.l('screen-puzzle-grid'),
  }),
  ScreenPuzzle,
)

export type Screen = p.Infer<typeof Screen>

export const ModelSpace = p.and(
  ScreenAddPuzzleTypes.ModelSpace,
  EditPackNameTypes.ModelSpace,
  p.obj({
    pack: Pack,
    screen: Screen,
    slideIndex: p.num,
    opened: p.maybe(p.or(p.l('edit-pack-name-drawer'), p.l('more'))),
  }),
)

export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  ScreenAddPuzzleTypes.MsgSpace,
  EditPackNameTypes.MsgSpace,
  p.obj({
    t: p.l('screen-pack-builder.user-clicked-back-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.saved-pack'),
    saved: Result.parser(p.str, Pack),
  }),
  p.obj({
    t: p.l('screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-clicked-pack-item'),
    puzzleResult: PuzzleResult,
    puzzleIndex: p.num,
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-changed-slide'),
    newSlideIndex: p.num,
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.got-flow-play-msg'),
    c: ModePlay.Msg,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-next-puzzle'),
    userId: UserId,
    nextPuzzleResult: PuzzleResult,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button'),
    userId: UserId,
    previousPuzzleResult: PuzzleResult,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-closed-more-drawer'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('remove-puzzle-from-pack.user-clicked-remove-from-pack-button'),
    puzzleIndex: p.num,
    userId: UserId,
  }),
)

export type MsgSpace = p.Infer<typeof MsgSpace>

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
  MsgCmdOut: FlowFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdIn: null
}>

export type BackendModule = GameBackendModule<{
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  Deps: null
}>
