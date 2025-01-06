import { Result } from '~/@/result'
import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { FlowPlay } from '../../@/flow/flow-play'
import { Pack } from '../../@/pack/pack'
import { PackPuzzlesGridTypes } from '../../@/pack/pack-puzzles-grid'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import { Puzzle } from '../../@/puzzle/puzzle'
import { EditPackNameTypes } from './edit-pack-name'

//
//
//
//
//

export type ModelClient = {
  packBuilder: {
    flowPackPuzzleGrid: PackPuzzlesGridTypes.ModelClient
  }
}

export const initClient: ModelClient = {
  packBuilder: {
    flowPackPuzzleGrid: PackPuzzlesGridTypes.initClient,
  },
}

export type ModelServer = null

export const initServer: ModelServer = null

//
//
//
//

export type MsgClient = {
  t: 'screen-pack-builder.flow-pack-grid'
  c: PackPuzzlesGridTypes.MsgClient
}

export type MsgServer = {
  t: 'screen-pack-builder.flow-pack-grid'
  c: PackPuzzlesGridTypes.MsgServer
}

export type MsgToServer = {
  t: 'screen-pack-builder.flow-pack-grid'
  c: PackPuzzlesGridTypes.MsgToServer
}

export type MsgToClient = {
  t: 'screen-pack-builder.flow-pack-grid'
  c: PackPuzzlesGridTypes.MsgToClient
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
    play: p.maybe(FlowPlay.Model),
    opened: p.maybe(p.l('more')),
  }),
)

type Screen = p.Infer<typeof Screen>

export const ModelCore = p.obj({
  pack: Pack,
  screen: Screen,
  slideIndex: p.num,
  editPackName: EditPackNameTypes.ModelCore,
})

export type ModelCore = {
  pack: Pack
  screen: Screen
  slideIndex: number
  editPackName: EditPackNameTypes.ModelCore
}

export const MsgCore = p.or(
  p.obj({
    t: p.l('got-edit-pack-name-msg'),
    c: EditPackNameTypes.MsgCore,
  }),
  p.obj({
    t: p.l('screen-pack-builder.saved-pack'),
    saved: Result.parser(p.str, Pack),
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-opened-add-puzzle-screen'),
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
    c: FlowPlay.Msg,
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

export type MsgCore = p.Infer<typeof MsgCore>
