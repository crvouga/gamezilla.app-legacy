import { p } from '~/@/parser'
import { Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { Pack } from '../../@/pack/pack'
import { PackPuzzlesGridTypes } from '../../@/pack/pack-puzzles-grid'
import { PlayMode } from '../../@/play-mode'
import { Puzzle } from '../../@/puzzle/puzzle'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import { EditPackNameTypes } from './edit-pack-name'
import { PuzzleListTypes } from '../../@/puzzle/puzzle-list'

//
//
//
//
//

export type ModelFrontend = {
  packBuilder: {
    flowPackPuzzleGrid: PackPuzzlesGridTypes.ModelFrontend
  }
}

export const initFrontend: ModelFrontend = {
  packBuilder: {
    flowPackPuzzleGrid: PackPuzzlesGridTypes.initFrontend,
  },
}

//
//
//
//

export type MsgFrontend =
  | {
      t: 'screen-pack-builder.flow-pack-grid'
      c: PackPuzzlesGridTypes.MsgFrontend
    }
  | {
      t: 'screen-pack-builder.screen-add.puzzle.got-puzzle-list-msg'
      c: PuzzleListTypes.MsgFrontend
    }

export type MsgBackend = {
  t: 'screen-pack-builder.flow-pack-grid'
  c: PackPuzzlesGridTypes.MsgBackend
}

export type MsgToBackend = {
  t: 'screen-pack-builder.flow-pack-grid'
  c: PackPuzzlesGridTypes.MsgToBackend
}

export type MsgToFrontend = {
  t: 'screen-pack-builder.flow-pack-grid'
  c: PackPuzzlesGridTypes.MsgToFrontend
}

//
//
//
//
//

export const Screen = p.or(
  p.obj({
    t: p.l('screen-add-puzzle'),
  }),
  p.obj({
    t: p.l('screen-puzzle-grid'),
  }),
  p.obj({
    t: p.l('screen-puzzle'),
    puzzleIndex: p.num,
    puzzleResult: PuzzleResult,
    play: p.maybe(PlayMode.Model),
    opened: p.maybe(p.l('more')),
  }),
)

type Screen = p.Infer<typeof Screen>

export const ModelSpace = p.obj({
  pack: Pack,
  screen: Screen,
  slideIndex: p.num,
  editPackName: EditPackNameTypes.ModelSpace,
})

export type ModelSpace = {
  pack: Pack
  screen: Screen
  slideIndex: number
  editPackName: EditPackNameTypes.ModelSpace
}

export const MsgSpace = p.or(
  p.obj({
    t: p.l('got-edit-pack-name-msg'),
    c: EditPackNameTypes.MsgSpace,
  }),
  p.obj({
    t: p.l('screen-pack-builder.saved-pack'),
    saved: Result.parser(p.str, Pack),
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-clicked-open-add-puzzle-screen-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-closed-add-puzzle-screen'),
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-clicked-add-puzzle-item'),
    puzzle: Puzzle,
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-clicked-pack-item'),
    puzzleResult: PuzzleResult,
    puzzleIndex: p.num,
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-changed-slide'),
    newSlideIndex: p.num,
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.got-flow-play-msg'),
    c: PlayMode.Msg,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-next-puzzle'),
    userId: UserId,
    nextPuzzleResult: PuzzleResult,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button'),
    userId: UserId,
    previousPuzzleResult: PuzzleResult,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-more-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-closed-more-drawer'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('remove-puzzle-from-pack.user-clicked-remove-from-pack-button'),
    puzzleIndex: p.num,
    userId: UserId,
  }),
)

export type MsgSpace = p.Infer<typeof MsgSpace>
