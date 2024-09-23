import { p } from 'gamezilla-app/@/core/parser'
import type { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import type { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import type { SpaceCtx, SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import type { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import type { FlowClientCtx } from '../@/flow-client-ctx'
import { FlowClientEvtIn } from '../@/flow-client-evt'
import { FlowCoreEvent } from '../@/flow-core-event'
import type { FlowPack } from '../@/flow-pack/flow-pack'
import { FlowPackListTypes } from '../@/flow-pack/flow-pack-list'
import { FlowPackPuzzlesGridTypes } from '../@/flow-pack/flow-pack-puzzles-grid'
import type { FlowPuzzle } from '../@/flow-puzzle/flow-puzzle'
import type { FlowPuzzleId } from '../@/flow-puzzle/flow-puzzle-id'
import { FlowPuzzleListTypes } from '../@/flow-puzzle/flow-puzzle-list'
import { FlowServerCtx } from '../@/flow-server-ctx'
import { ListTabs } from './list-tabs'
import { ScreenOpenPackTypes } from './screen-open-pack'
import { ScreenOpenPuzzleTypes } from './screen-open-puzzle'
import { ScreenPackBuilderTypes } from './screen-pack-builder'
import { ScreenPuzzleBuilderTypes } from './screen-puzzle-builder'

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
  ScreenOpenPuzzleTypes.ModelClient &
  ScreenPuzzleBuilderTypes.ModelClient &
  ScreenPackBuilderTypes.ModelClient &
  ScreenOpenPackTypes.ModelClient

export const initClient: ClientModule['init'] = {
  ...ScreenOpenPuzzleTypes.initClient,
  ...ScreenPuzzleBuilderTypes.initClient,
  ...ScreenPackBuilderTypes.initClient,
  ...ScreenOpenPackTypes.initClient,
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
  | ScreenOpenPuzzleTypes.MsgClient
  | ScreenPuzzleBuilderTypes.MsgClient
  | ListTabs.MsgClient
  | ScreenPackBuilderTypes.MsgClient
  | ScreenOpenPackTypes.MsgClient

export type MsgServer =
  | { t: 'flow-pack-list'; c: FlowPackListTypes.MsgServer }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgServer }
  | ScreenOpenPuzzleTypes.MsgServer
  | ScreenPuzzleBuilderTypes.MsgServer
  | ScreenPackBuilderTypes.MsgServer
  | ScreenOpenPackTypes.MsgServer

export type MsgToServer =
  | {
      t: 'flow-pack-list'
      c: FlowPackListTypes.MsgToServer
    }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgToServer }
  | ScreenPuzzleBuilderTypes.MsgToServer
  | ScreenOpenPuzzleTypes.MsgToServer
  | ScreenPackBuilderTypes.MsgToServer
  | ScreenOpenPackTypes.MsgToServer

export type MsgToClient =
  | {
      t: 'flow-pack-list'
      c: FlowPackListTypes.MsgToClient
    }
  | { t: 'flow-puzzle-list'; c: FlowPuzzleListTypes.MsgToClient }
  | ScreenPuzzleBuilderTypes.MsgToClient
  | ScreenOpenPuzzleTypes.MsgToClient
  | ScreenPackBuilderTypes.MsgToClient
  | ScreenOpenPackTypes.MsgToClient

//
//
//
//
//
//
//

export const MsgCore = p.or(
  ListTabs.MsgCore,
  ScreenPuzzleBuilderTypes.MsgCore,
  ScreenOpenPuzzleTypes.MsgCore,
  ScreenPackBuilderTypes.MsgCore,
  ScreenOpenPackTypes.MsgCore
)
export type MsgCore = p.Infer<typeof MsgCore>

const Open = p.or(p.obj({ t: p.l('list') }), p.obj({ t: p.l('puzzle-builder') }), p.obj({ t: p.l('pack-builder') }))
type Open = p.Infer<typeof Open>

export const BaseModelCore = p.obj({
  opened: Open,
  puzzleBuilder: p.maybe(ScreenPuzzleBuilderTypes.ModelCore),
  openPuzzle: p.maybe(ScreenOpenPuzzleTypes.ModelCore),
  packBuilder: p.maybe(ScreenPackBuilderTypes.ModelCore),
  openPack: p.maybe(ScreenOpenPackTypes.ModelCore)
})
type BaseModelCore = p.Infer<typeof BaseModelCore>

export const ModelCore = p.and(BaseModelCore, ListTabs.ModelCore)
export type ModelCore = p.Infer<typeof ModelCore>

export type UpdateCore = (input: {
  ctx: SpaceCtx
  msgCore: MsgCore
  modelCore: ModelCore
}) => ModelCore & { event?: FlowCoreEvent }
