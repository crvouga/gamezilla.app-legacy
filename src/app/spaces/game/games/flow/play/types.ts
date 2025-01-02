import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { SpaceServerCmd } from '~/app/spaces/@/space-server/cmd'
import { SpaceServerEvt } from '~/app/spaces/@/space-server/evt'
import type { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import type { GameCoreModule } from '~/app/spaces/game/games/@/architecture/game-core'
import { GameServerModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { GameMainMenu } from '../../@/game/game-main-menu'
import { FlowClientCmd } from '../@/client/cmd'
import type { FlowClientCtx } from '../@/client/ctx'
import { FlowClientEvtIn } from '../@/client/evt'
import { FlowCoreEvent } from '../@/core/event'
import { FlowServerCtx } from '../@/server/ctx'
import { Pack } from '../@/pack/pack'
import type { PackPuzzlesGridTypes } from '../@/pack/pack-puzzles-grid'
import { PuzzleResult } from '../@/puzzle/puzzle-result'
import { ScreenPuzzleTypes } from './screen-play-puzzle'

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
    pack: Pack
  }),
  p.obj({
    t: p.l('user-clicked-exit-pack-button')
  }),
  p.obj({
    t: p.l('user-clicked-open-puzzle-grid-item'),
    flowPuzzle: PuzzleResult,
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
    flowPack: Pack,
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
