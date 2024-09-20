import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import type { GameClientModule } from 'gamezilla-app/app/spaces/@/architecture/game-client-v2'
import type { GameCoreModule } from 'gamezilla-app/app/spaces/@/architecture/game-core'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import type { SpaceCtx, SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import type { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import type { FlowClientCtx } from '../@/flow-client-ctx'
import { FlowClientEvtIn } from '../@/flow-client-evt'
import { FlowCoreEvent } from '../@/flow-core-event'
import { FlowPack, type FlowPackListTypes } from '../@/flow-pack'
import type { FlowPackId } from '../@/flow-pack/flow-pack-id'
import type { FlowPackPuzzlesGridTypes } from '../@/flow-pack/flow-pack-puzzles-grid'
import { FlowPuzzle } from '../@/flow-puzzle'
import type { FlowPuzzleId } from '../@/flow-puzzle/flow-puzzle-id'
import { FlowServerCtx } from '../@/flow-server-ctx'
import { FlowPuzzleResult } from './@/puzzle-result'
import { ScreenPuzzleTypes } from './screen-play-puzzle'

//
//
//
//
//
//

export type ModelClient = {
  flowPuzzles: { [flowPuzzleId: FlowPuzzleId]: FlowPuzzle }
  flowPacks: { [flowPackId: FlowPackId]: FlowPack }
  flowPackPuzzleGrid: FlowPackPuzzlesGridTypes.ModelClient
  // flowPackList: FlowPackListTypes.ModelClient
}

export const ModelServer = p.obj({})
export type ModelServer = p.Infer<typeof ModelServer>

//
//
//
//
//
//

export type MsgClient =
  | MsgCore
  | {
      t: 'flow-pack-list'
      c: FlowPackListTypes.MsgClient
    }
  | {
      t: 'flow-pack-grid'
      c: FlowPackPuzzlesGridTypes.MsgClient
    }

export type MsgServer =
  | {
      t: 'flow-pack-list'
      c: FlowPackListTypes.MsgServer
    }
  | {
      t: 'flow-pack-grid'
      c: FlowPackPuzzlesGridTypes.MsgServer
    }

export type MsgToServer =
  | {
      t: 'flow-pack-list'
      c: FlowPackListTypes.MsgToServer
    }
  | {
      t: 'flow-pack-grid'
      c: FlowPackPuzzlesGridTypes.MsgToServer
    }

export type MsgToClient =
  | {
      t: 'flow-pack-list'
      c: FlowPackListTypes.MsgToClient
    }
  | {
      t: 'flow-pack-grid'
      c: FlowPackPuzzlesGridTypes.MsgToClient
    }

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-clicked-exit-play-mode-button'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-clicked-select-pack-back-button'),
    userId: UserId
  }),
  p.obj({
    t: p.l('user-clicked-open-pack-list-item'),
    pack: FlowPack
  }),
  p.obj({
    t: p.l('user-clicked-exit-pack-button')
  }),
  p.obj({
    t: p.l('user-clicked-open-puzzle-grid-item'),
    flowPuzzle: FlowPuzzleResult,
    puzzleIndex: p.num
  }),
  p.obj({
    t: p.l('user-changed-slides'),
    slideIndex: p.num,
    userId: UserId
  }),
  ScreenPuzzleTypes.MsgCore
)

export type MsgCore = p.Infer<typeof MsgCore>

const Screen = p.or(
  p.obj({
    t: p.l('screen-select-pack')
  }),
  p.obj({
    t: p.l('screen-select-puzzle'),
    flowPack: FlowPack,
    slideIndex: p.num
  }),
  ScreenPuzzleTypes.ModelCore
)

export const ModelCore = p.obj({
  screen: Screen
})
export type ModelCore = p.Infer<typeof ModelCore>

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
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut:
    | SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
    | FlowPackPuzzlesGridTypes.MsgInCmdClient
    | FlowPackListTypes.MsgInCmdClient
  MsgCmdIn: FlowPackPuzzlesGridTypes.MsgInCmdClient
}>

export type ServerModule = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowServerCtx
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
}>

export type CoreModule = GameCoreModule<{
  Ctx: SpaceCtx
  ModelCore: ModelCore
  MsgCore: MsgCore
  EventCore: FlowCoreEvent
}>
