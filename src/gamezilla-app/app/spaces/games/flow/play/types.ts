import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import type { GameClientModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-client-v2'
import type { GameCoreModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-core'
import { GameServerModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-server-v2'
import { FlowClientCmd } from '../@/flow-client-cmd'
import type { FlowClientCtx } from '../@/flow-client-ctx'
import { FlowClientEvtIn } from '../@/flow-client-evt'
import { FlowCoreEvent } from '../@/flow-core-event'
import { FlowPack } from '../@/pack/pack'
import type { PackPuzzlesGridTypes } from '../@/pack/pack-puzzles-grid'
import { FlowServerCtx } from '../@/flow-server-ctx'
import { FlowPuzzleResult } from './@/puzzle-result'
import { ScreenPuzzleTypes } from './screen-play-puzzle'
import { SpaceCtx } from 'gamezilla-app/app/spaces/@/space-ctx'
import { SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space-server-evt'
import { GameMainMenu } from '../../@/game/game-main-menu'

//
//
//
//
//
//

export type ModelClient = null

export const ModelServer = p.obj({})
export type ModelServer = p.Infer<typeof ModelServer>

//
//
//
//
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | {
      t: 'got-msg-core'
      c: MsgCore
    }

export type MsgServer = {
  t: 'noop'
}

export type MsgToServer = {
  t: 'noop'
}

export type MsgToClient = {
  t: 'noop'
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
  MsgCmdOut: FlowClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgCmdIn: PackPuzzlesGridTypes.MsgInCmdClient
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
