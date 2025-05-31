import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type { GameSpaceModule } from '~/app/spaces/game/games/@/architecture/game-space'
import { GroupId } from '../../@/flow/group-id'
import { ModePlay } from '../../@/mode-play'
import { Pack } from '../../@/pack/pack'
import { PackId } from '../../@/pack/pack-id'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import { CopyPuzzleTypes } from './button-copy-puzzle'

export const MsgSpace = s.or(
  CopyPuzzleTypes.MsgSpace,
  s.obj({
    t: s.l('got-flow-play-msg'),
    c: ModePlay.Msg,
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-clicked-exit-play-puzzle-screen'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-clicked-next-puzzle'),
    nextPuzzle: PuzzleResult,
    nextPuzzleIndex: s.num(),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-clicked-prev-puzzle'),
    prevPuzzle: PuzzleResult,
    prevPuzzleIndex: s.num(),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-closed-puzzle-complete-dialog'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-clicked-select-next-pack'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('user-toggled-action-buttons-drawer'),
    userId: UserId,
  }),
)

export type MsgSpace = s.Infer<typeof MsgSpace>

export const MsgSpaceEvt = s.or(
  s.obj({
    t: s.l('user-completed-puzzle'),
    userId: UserId,
    packId: PackId,
    puzzleIndex: s.num(),
  }),
  s.obj({
    t: s.l('user-used-hint'),
    userId: UserId,
    groupId: GroupId,
  }),
)
export type MsgSpaceEvt = s.Infer<typeof MsgSpaceEvt>

export const ModelSpace = s.obj({
  t: s.l('screen-play-puzzle'),
  pack: Pack,
  puzzleResult: PuzzleResult,
  modePlay: s.or(ModePlay.Model, s.l(null)),
  puzzleIndex: s.num(),
  opened: s.or(s.l('puzzle-complete'), s.l('action-drawer'), s.l(null)),
  hints: s.partialDict(GroupId, GroupId),
})

export type ModelSpace = s.Infer<typeof ModelSpace>

export type SpaceModule = GameSpaceModule<{
  Ctx: SpaceCtx
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
}>
