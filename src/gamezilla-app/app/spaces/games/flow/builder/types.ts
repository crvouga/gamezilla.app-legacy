import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import type { GameClientModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-client-v2'
import type { GameServerModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-server-v2'
import { FlowClientCmd } from '../@/flow-client-cmd'
import type { FlowClientCtx } from '../@/flow-client-ctx'
import { FlowClientEvtIn } from '../@/flow-client-evt'
import { FlowCoreEvent } from '../@/flow-core-event'
import { FlowServerCtx } from '../@/flow-server-ctx'
import { PackListTypes } from '../@/pack/pack-list'
import { PackPuzzlesGridTypes } from '../@/pack/pack-puzzles-grid'
import { ScreenMainMenu } from './screen-main-menu'
import { ScreenPackBuilderTypes } from './screen-pack-builder'
import { ScreenPackBuilderOpenTypes } from './screen-pack-builder-open'
import { ScreenPuzzleBuilderTypes } from './screen-puzzle-builder'
import { ScreenPuzzleBuilderOpenTypes } from './screen-puzzle-builder-open'
import { SpaceCtx } from 'gamezilla-app/app/spaces/@/space-ctx'
import { SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space-server-evt'

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
  MsgToServer: MsgToServer
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowClientCtx
  MsgCmdOut: FlowClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgEvtIn: FlowClientEvtIn
  MsgCmdIn: PackPuzzlesGridTypes.MsgInCmdClient
}>

export type ServerModule = GameServerModule<{
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowServerCtx
  MsgEvtIn: SpaceServerEvt
  Model: ModelServer
  Msg: MsgServer
  MsgCmdOut: SpaceServerCmd<MsgToClient>
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
  ...ScreenPackBuilderOpenTypes.initClient
}

export const ModelServer = p.obj({
  flowPackList: PackListTypes.ModelServer
})
export type ModelServer = p.Infer<typeof ModelServer>

export const initServer: ServerModule['init'] = {
  flowPackList: PackListTypes.initServer
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

export type MsgServer =
  | ScreenPuzzleBuilderOpenTypes.MsgServer
  | ScreenPuzzleBuilderTypes.MsgServer
  | ScreenPackBuilderTypes.MsgServer
  | ScreenPackBuilderOpenTypes.MsgServer

export type MsgToServer =
  | ScreenPuzzleBuilderTypes.MsgToServer
  | ScreenPuzzleBuilderOpenTypes.MsgToServer
  | ScreenPackBuilderTypes.MsgToServer
  | ScreenPackBuilderOpenTypes.MsgToServer

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
    userId: UserId
  })
)
export type MsgCore = p.Infer<typeof MsgCore>

export const Screen = p.or(
  p.obj({
    t: p.l('screen-main-menu')
  }),
  p.obj({
    t: p.l('screen-puzzle-builder-open')
  }),
  p.obj({
    t: p.l('screen-pack-builder-open')
  }),
  p.obj({
    t: p.l('screen-puzzle-builder')
  }),
  p.obj({
    t: p.l('screen-pack-builder')
  })
)
export type Screen = p.Infer<typeof Screen>

export const ModelCore = p.obj({
  screen: Screen,
  screenPuzzleBuilder: p.maybe(ScreenPuzzleBuilderTypes.ModelCore),
  screenPuzzleBuilderOpen: p.maybe(ScreenPuzzleBuilderOpenTypes.ModelCore),
  screenPackBuilder: p.maybe(ScreenPackBuilderTypes.ModelCore),
  screenPackBuilderOpen: p.maybe(ScreenPackBuilderOpenTypes.ModelCore)
})

export type ModelCore = p.Infer<typeof ModelCore>

export type UpdateCore = (input: {
  ctx: SpaceCtx
  msgCore: MsgCore
  modelCore: ModelCore
}) => ModelCore & { event?: FlowCoreEvent }
