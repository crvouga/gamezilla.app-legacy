import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type { GameCoreModule } from '~/app/spaces/game/games/@/architecture/game-core'
import { GroupId } from '../../@/flow/group-id'
import { Pack } from '../../@/pack/pack'
import { PackId } from '../../@/pack/pack-id'
import { Play } from '../../@/play'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import { CopyPuzzleTypes } from './copy-puzzle'

export const MsgCore = p.or(
  CopyPuzzleTypes.MsgCore,
  p.obj({
    t: p.l('got-flow-play-msg'),
    c: Play.Msg,
    userId: UserId,
  }),
  p.obj({
    t: p.l('user-clicked-exit-puzzle'),
  }),
  p.obj({
    t: p.l('user-clicked-next-puzzle'),
    nextPuzzle: PuzzleResult,
    nextPuzzleIndex: p.num,
  }),
  p.obj({
    t: p.l('user-clicked-prev-puzzle'),
    prevPuzzle: PuzzleResult,
    prevPuzzleIndex: p.num,
  }),
  p.obj({
    t: p.l('user-closed-puzzle-complete-dialog'),
  }),
  p.obj({
    t: p.l('user-clicked-select-next-pack'),
  }),
  p.obj({
    t: p.l('user-clicked-reset-puzzle'),
  }),
  p.obj({
    t: p.l('user-toggled-action-buttons-drawer'),
  }),
)

export type MsgCore = p.Infer<typeof MsgCore>

export const MsgCoreEvt = p.or(
  p.obj({
    t: p.l('user-completed-puzzle'),
    userId: UserId,
    packId: PackId,
    puzzleIndex: p.num,
  }),
  p.obj({
    t: p.l('user-used-hint'),
    userId: UserId,
    groupId: GroupId,
  }),
)
export type MsgCoreEvt = p.Infer<typeof MsgCoreEvt>

export const ModelCore = p.obj({
  t: p.l('screen-play-puzzle'),
  flowPack: Pack,
  puzzleResult: PuzzleResult,
  flowPlay: p.or(Play.Model, p.l(null)),
  puzzleIndex: p.num,
  opened: p.or(p.l('puzzle-complete'), p.l('action-drawer'), p.l(null)),
  hints: p.partialDict(GroupId, GroupId),
})

export type ModelCore = p.Infer<typeof ModelCore>

export type CoreModule = GameCoreModule<{
  Ctx: SpaceCtx
  ModelCore: ModelCore
  MsgCore: MsgCore
}>
