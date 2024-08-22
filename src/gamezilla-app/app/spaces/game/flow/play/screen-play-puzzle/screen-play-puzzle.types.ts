import { p } from 'gamezilla-app/@/core/parser'
import type { GameCoreModule } from 'gamezilla-app/app/spaces/@/architecture/game-core'
import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import { FlowPack } from '../../@/flow-pack'
import { FlowPlay } from '../../@/flow/flow-play'
import { FlowGroupId } from '../../@/flow/flow/flow-group-id'
import { FlowPuzzleResult } from '../@/puzzle-result'
import { CopyPuzzleTypes } from './copy-puzzle'
import { UserId } from 'gamezilla-app/app/@/data'
import { FlowPackId } from '../../@/flow-pack/flow-pack-id'

export const MsgCore = p.or(
  CopyPuzzleTypes.MsgCore,
  p.obj({
    t: p.l('got-flow-play-msg'),
    c: FlowPlay.Msg,
    userId: UserId
  }),
  p.obj({
    t: p.l('user-clicked-exit-puzzle')
  }),
  p.obj({
    t: p.l('user-clicked-next-puzzle'),
    nextPuzzle: FlowPuzzleResult,
    nextPuzzleIndex: p.num
  }),
  p.obj({
    t: p.l('user-clicked-prev-puzzle'),
    prevPuzzle: FlowPuzzleResult,
    prevPuzzleIndex: p.num
  }),
  p.obj({
    t: p.l('user-closed-puzzle-complete-dialog')
  }),
  p.obj({
    t: p.l('user-clicked-select-next-pack')
  }),
  p.obj({
    t: p.l('user-clicked-reset-puzzle')
  }),
  p.obj({
    t: p.l('user-clicked-hint')
  }),
  p.obj({
    t: p.l('user-toggled-action-buttons-drawer')
  })
)

export type MsgCore = p.Infer<typeof MsgCore>

export const MsgCoreEvt = p.or(
  p.obj({
    t: p.l('user-completed-puzzle'),
    userId: UserId,
    packId: FlowPackId,
    puzzleIndex: p.num
  })
)
export type MsgCoreEvt = p.Infer<typeof MsgCoreEvt>

export const ModelCore = p.obj({
  t: p.l('screen-play-puzzle'),
  flowPack: FlowPack,
  puzzleResult: FlowPuzzleResult,
  flowPlay: p.or(FlowPlay.Model, p.l(null)),
  puzzleIndex: p.num,
  opened: p.or(p.l('puzzle-complete'), p.l('action-drawer'), p.l(null)),
  hints: p.partialDict(FlowGroupId, FlowGroupId)
})

export type ModelCore = p.Infer<typeof ModelCore>

export type CoreModule = GameCoreModule<{
  Ctx: SpaceCtx
  ModelCore: ModelCore
  MsgCore: MsgCore
}>
