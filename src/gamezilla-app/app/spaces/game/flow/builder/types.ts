import { p } from 'gamezilla-app/@/core/parser'
import type { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import type { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import type { SpaceCtx, SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import type { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import type { FlowClientCtx } from '../@/flow-client-ctx'
import { FlowClientEvtIn } from '../@/flow-client-evt'
import { FlowCoreEvent } from '../@/flow-core-event'
import type { FlowPack } from '../@/pack/pack'
import { FlowPackListTypes } from '../@/pack/pack-list'
import { FlowPackPuzzlesGridTypes } from '../@/pack/pack-puzzles-grid'
import type { FlowPuzzle } from '../@/puzzle/puzzle'
import type { FlowPuzzleId } from '../@/puzzle/puzzle-id'
import { FlowPuzzleListTypes } from '../@/puzzle/puzzle-list'
import { FlowServerCtx } from '../@/flow-server-ctx'
import { ScreenPackBuilderOpenTypes } from './screen-pack-builder-open'
import { ScreenPuzzleBuilderOpenTypes } from './screen-puzzle-builder-open'
import { ScreenPackBuilderTypes } from './screen-pack-builder'
import { ScreenPuzzleBuilderTypes } from './screen-puzzle-builder'
import { ScreenMainMenu } from './screen-main-menu'
import { UserId } from 'gamezilla-app/app/@/data'

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
  MsgCmdOut: SpaceClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgEvtIn: FlowClientEvtIn
  MsgCmdIn: FlowPackPuzzlesGridTypes.MsgInCmdClient
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
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle
  }
  packs: {
    [packId: string]: FlowPack
  }
  flowPuzzleList: FlowPuzzleListTypes.ModelClient
  flowPackList: FlowPackListTypes.ModelClient
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
  flowPuzzleList: FlowPuzzleListTypes.initClient,
  flowPackList: FlowPackListTypes.initClient,
  packs: {},
  puzzles: {}
}

export const ModelServer = p.obj({
  flowPackList: FlowPackListTypes.ModelServer
})
export type ModelServer = p.Infer<typeof ModelServer>

export const initServer: ServerModule['init'] = {
  flowPackList: FlowPackListTypes.initServer
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
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgClient }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgClient }
  | BaseMsgClient
  | ScreenPuzzleBuilderOpenTypes.MsgClient
  | ScreenPuzzleBuilderTypes.MsgClient
  | ScreenMainMenu.MsgClient
  | ScreenPackBuilderTypes.MsgClient
  | ScreenPackBuilderOpenTypes.MsgClient
  | { t: 'got-msg-core'; c: MsgCore }

export type MsgServer =
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgServer }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgServer }
  | ScreenPuzzleBuilderOpenTypes.MsgServer
  | ScreenPuzzleBuilderTypes.MsgServer
  | ScreenPackBuilderTypes.MsgServer
  | ScreenPackBuilderOpenTypes.MsgServer

export type MsgToServer =
  | {
      t: 'flow-pack-list'
      c: FlowPackListTypes.MsgToServer
    }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgToServer }
  | ScreenPuzzleBuilderTypes.MsgToServer
  | ScreenPuzzleBuilderOpenTypes.MsgToServer
  | ScreenPackBuilderTypes.MsgToServer
  | ScreenPackBuilderOpenTypes.MsgToServer

export type MsgToClient =
  | {
      t: 'flow-pack-list'
      c: FlowPackListTypes.MsgToClient
    }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgToClient }
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
