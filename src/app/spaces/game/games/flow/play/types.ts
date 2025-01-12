import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import type { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import type { GameCoreModule } from '~/app/spaces/game/games/@/architecture/game-core'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { GameMainMenu } from '../../@/ui/game-main-menu'
import { FlowClientCmd } from '../@/client/cmd'
import type { FlowClientCtx } from '../@/client/ctx'
import { FlowClientEvtIn } from '../@/client/evt'
import { FlowCoreCtx } from '../@/core/ctx'
import { FlowCoreEvent } from '../@/core/event'
import { Pack } from '../@/pack/pack'
import type { PackPuzzlesGridTypes } from '../@/pack/pack-puzzles-grid'
import { PuzzleResult } from '../@/puzzle/puzzle-result'
import { FlowBackendCtx } from '../@/backend/ctx'
import { ScreenPuzzleTypes } from './screen-play-puzzle'

//
//
//
//
//
//

export type ModelClient = null

export const ModelBackend = p.obj({})
export type ModelBackend = p.Infer<typeof ModelBackend>

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

export type MsgBackend = {
  t: 'noop'
}

export type MsgToBackend = {
  t: 'noop'
}

export type MsgToClient = {
  t: 'noop'
}

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-clicked-exit-play-mode-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-clicked-select-pack-back-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-clicked-open-pack-list-item'),
    pack: Pack,
  }),
  p.obj({
    t: p.l('user-clicked-exit-pack-button'),
  }),
  p.obj({
    t: p.l('user-clicked-open-puzzle-grid-item'),
    flowPuzzle: PuzzleResult,
    puzzleIndex: p.num,
  }),
  p.obj({
    t: p.l('user-changed-slides'),
    slideIndex: p.num,
    userId: UserId,
  }),
  ScreenPuzzleTypes.MsgCore,
)

export type MsgCore = p.Infer<typeof MsgCore>

const Screen = p.or(
  p.obj({
    t: p.l('screen-select-pack'),
  }),
  p.obj({
    t: p.l('screen-select-puzzle'),
    flowPack: Pack,
    slideIndex: p.num,
  }),
  ScreenPuzzleTypes.ModelCore,
)

export const ModelCore = p.obj({
  screen: Screen,
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
  MsgToBackend: MsgToBackend
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowClientCtx
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut: FlowClientCmd<{
    MsgToBackend: MsgToBackend
    MsgClient: MsgClient
  }>
  MsgCmdIn: PackPuzzlesGridTypes.MsgInCmdClient
}>

export type BackendModule = GameBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
}>

export type CoreModule = GameCoreModule<{
  Ctx: FlowCoreCtx
  ModelCore: ModelCore
  MsgCore: MsgCore
  EventCore: FlowCoreEvent
}>
