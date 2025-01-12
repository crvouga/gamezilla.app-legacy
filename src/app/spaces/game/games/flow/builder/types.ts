import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-server/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-server/evt'
import type { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import type { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { FlowClientCmd } from '../@/client/cmd'
import type { FlowClientCtx } from '../@/client/ctx'
import { FlowClientEvtIn } from '../@/client/evt'
import { FlowCoreCtx } from '../@/core/ctx'
import { FlowCoreEvent } from '../@/core/event'
import { PackListTypes } from '../@/pack/pack-list'
import { PackPuzzlesGridTypes } from '../@/pack/pack-puzzles-grid'
import { FlowBackendCtx } from '../@/server/ctx'
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

export type ClientModule = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowClientCtx
  MsgCmdOut: FlowClientCmd<{
    MsgToBackend: MsgToBackend
    MsgClient: MsgClient
  }>
  MsgEvtIn: FlowClientEvtIn
  MsgCmdIn: PackPuzzlesGridTypes.MsgInCmdClient
}>

export type BackendModule = GameBackendModule<{
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
  Model: ModelBackend
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
  Deps: null
}>

//
//
//
// Model
//
//
//

type BaseModelClient = {
  puzzleBuilderOpened?: 'more' | 'edit-name' | 'delete-forever' | 'unsaved-changes' | null
}

export type ModelClient = BaseModelClient &
  ScreenPuzzleBuilderOpenTypes.ModelClient &
  ScreenPuzzleBuilderTypes.ModelClient &
  ScreenPackBuilderTypes.ModelClient &
  ScreenPackBuilderOpenTypes.ModelClient

export const initClient: ClientModule['init'] = {
  ...ScreenPuzzleBuilderOpenTypes.initClient,
  ...ScreenPuzzleBuilderTypes.initClient,
  ...ScreenPackBuilderTypes.initClient,
  ...ScreenPackBuilderOpenTypes.initClient,
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

type BaseMsgClient = { t: 'time-passed' }

//

export type MsgClient =
  | BaseMsgClient
  | ScreenPuzzleBuilderOpenTypes.MsgClient
  | ScreenPuzzleBuilderTypes.MsgClient
  | ScreenMainMenu.MsgClient
  | ScreenPackBuilderTypes.MsgClient
  | ScreenPackBuilderOpenTypes.MsgClient
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

export type MsgToClient =
  | ScreenPuzzleBuilderTypes.MsgToClient
  | ScreenPuzzleBuilderOpenTypes.MsgToClient
  | ScreenPackBuilderTypes.MsgToClient
  | ScreenPackBuilderOpenTypes.MsgToClient

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
