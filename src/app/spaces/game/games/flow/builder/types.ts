import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import type { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import type { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { FlowBackendCtx } from '../@/backend/ctx'
import { FlowFrontendCmd } from '../@/frontend/cmd'
import type { FlowFrontendCtx } from '../@/frontend/ctx'
import { FlowFrontendEvtIn } from '../@/frontend/evt'
import { PackPuzzlesGridTypes } from '../@/pack/pack-puzzles-grid'
import { FlowSpaceCtx } from '../@/space/ctx'
import { FlowSpaceEvt } from '../@/space/event'
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
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
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
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
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

//
//
//
// Msg
//
//
//

export type MsgFrontend =
  | ScreenPuzzleBuilderOpenTypes.MsgFrontend
  | ScreenPuzzleBuilderTypes.MsgFrontend
  | ScreenMainMenu.MsgFrontend
  | ScreenPackBuilderTypes.MsgFrontend
  | ScreenPackBuilderOpenTypes.MsgFrontend
  | { t: 'got-msg-space'; c: MsgSpace }

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

export const MsgSpace = p.or(
  ScreenMainMenu.MsgSpace,
  ScreenPuzzleBuilderTypes.MsgSpace,
  ScreenPuzzleBuilderOpenTypes.MsgSpace,
  ScreenPackBuilderTypes.MsgSpace,
  ScreenPackBuilderOpenTypes.MsgSpace,
  p.obj({
    t: p.l('user-clicked-back-button'),
    userId: UserId,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>

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

export const ModelSpace = p.obj({
  screen: Screen,
  screenPuzzleBuilder: p.maybe(ScreenPuzzleBuilderTypes.ModelSpace),
  screenPuzzleBuilderOpen: p.maybe(ScreenPuzzleBuilderOpenTypes.ModelSpace),
  screenPackBuilder: p.maybe(ScreenPackBuilderTypes.ModelSpace),
  screenPackBuilderOpen: p.maybe(ScreenPackBuilderOpenTypes.ModelSpace),
})

export type ModelSpace = p.Infer<typeof ModelSpace>

export type UpdateSpace = (input: {
  ctx: FlowSpaceCtx
  msgSpace: MsgSpace
  modelSpace: ModelSpace
}) => ModelSpace & { event?: FlowSpaceEvt }
