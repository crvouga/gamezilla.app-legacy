import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import type { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { FlowFrontendCmd } from '../@/frontend/cmd'
import type { FlowFrontendCtx } from '../@/frontend/ctx'
import { FlowFrontendEvtIn } from '../@/frontend/evt'
import { FlowCoreCtx } from '../@/core/ctx'
import { FlowCoreEvent } from '../@/core/event'
import { PackListTypes } from '../@/pack/pack-list'
import { PackPuzzlesGridTypes } from '../@/pack/pack-puzzles-grid'
import { FlowBackendCtx } from '../@/backend/ctx'
import { ScreenMainMenu } from './screen-main-menu'
import { ScreenPackBuilderTypes } from './screen-pack-builder'
import { ScreenPackBuilderOpenTypes } from './screen-pack-builder-open'
import { ScreenPuzzleBuilderTypes } from './screen-puzzle-builder'
import { ScreenPuzzleBuilderOpenTypes } from './screen-puzzle-builder-open'

//
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
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowFrontendCtx
  MsgCmdOut: FlowFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdIn: PackPuzzlesGridTypes.MsgInCmdFrontend
}>

export type BackendModule = GameBackendModule<{
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
  Model: ModelBackend
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  Deps: null
}>

//
//
//
// Model
//
//
//

type BaseModelFrontend = {
  puzzleBuilderOpened?: 'more' | 'edit-name' | 'delete-forever' | 'unsaved-changes' | null
}

export type ModelFrontend = BaseModelFrontend &
  ScreenPuzzleBuilderOpenTypes.ModelFrontend &
  ScreenPuzzleBuilderTypes.ModelFrontend &
  ScreenPackBuilderTypes.ModelFrontend &
  ScreenPackBuilderOpenTypes.ModelFrontend

export const initFrontend: FrontendModule['init'] = {
  ...ScreenPuzzleBuilderOpenTypes.initFrontend,
  ...ScreenPuzzleBuilderTypes.initFrontend,
  ...ScreenPackBuilderTypes.initFrontend,
  ...ScreenPackBuilderOpenTypes.initFrontend,
}

export const ModelBackend = p.obj({
  flowPackList: PackListTypes.ModelBackend,
})
export type ModelBackend = p.Infer<typeof ModelBackend>

export const initBackend: BackendModule['init'] = {
  flowPackList: PackListTypes.initBackend,
}

//
//
//
// Msg
//
//
//

type BaseMsgFrontend = { t: 'time-passed' }

//

export type MsgFrontend =
  | BaseMsgFrontend
  | ScreenPuzzleBuilderOpenTypes.MsgFrontend
  | ScreenPuzzleBuilderTypes.MsgFrontend
  | ScreenMainMenu.MsgFrontend
  | ScreenPackBuilderTypes.MsgFrontend
  | ScreenPackBuilderOpenTypes.MsgFrontend
  | { t: 'got-msg-core'; c: MsgCore }

export type MsgBackend =
  | ScreenPuzzleBuilderOpenTypes.MsgBackend
  | ScreenPuzzleBuilderTypes.MsgBackend
  | ScreenPackBuilderTypes.MsgBackend
  | ScreenPackBuilderOpenTypes.MsgBackend

export type MsgToBackend =
  | ScreenPuzzleBuilderTypes.MsgToBackend
  | ScreenPuzzleBuilderOpenTypes.MsgToBackend
  | ScreenPackBuilderTypes.MsgToBackend
  | ScreenPackBuilderOpenTypes.MsgToBackend

export type MsgToFrontend =
  | ScreenPuzzleBuilderTypes.MsgToFrontend
  | ScreenPuzzleBuilderOpenTypes.MsgToFrontend
  | ScreenPackBuilderTypes.MsgToFrontend
  | ScreenPackBuilderOpenTypes.MsgToFrontend

//
//
//
//
//
//
//

export const MsgCore = p.or(
  ScreenMainMenu.MsgCore,
  ScreenPuzzleBuilderTypes.MsgCore,
  ScreenPuzzleBuilderOpenTypes.MsgCore,
  ScreenPackBuilderTypes.MsgCore,
  ScreenPackBuilderOpenTypes.MsgCore,
  p.obj({
    t: p.l('user-clicked-back-button'),
    userId: UserId,
  }),
)
export type MsgCore = p.Infer<typeof MsgCore>

export const Screen = p.or(
  p.obj({
    t: p.l('screen-main-menu'),
  }),
  p.obj({
    t: p.l('screen-puzzle-builder-open'),
  }),
  p.obj({
    t: p.l('screen-pack-builder-open'),
  }),
  p.obj({
    t: p.l('screen-puzzle-builder'),
  }),
  p.obj({
    t: p.l('screen-pack-builder'),
  }),
)
export type Screen = p.Infer<typeof Screen>

export const ModelCore = p.obj({
  screen: Screen,
  screenPuzzleBuilder: p.maybe(ScreenPuzzleBuilderTypes.ModelCore),
  screenPuzzleBuilderOpen: p.maybe(ScreenPuzzleBuilderOpenTypes.ModelCore),
  screenPackBuilder: p.maybe(ScreenPackBuilderTypes.ModelCore),
  screenPackBuilderOpen: p.maybe(ScreenPackBuilderOpenTypes.ModelCore),
})

export type ModelCore = p.Infer<typeof ModelCore>

export type UpdateCore = (input: {
  ctx: FlowCoreCtx
  msgCore: MsgCore
  modelCore: ModelCore
}) => ModelCore & { event?: FlowCoreEvent }
