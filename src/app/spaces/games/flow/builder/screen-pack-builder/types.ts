import { Result } from '~/@/core'
import { p } from '~/@/core/parser'
import { UserId } from '~/app/@/data'
import { FlowPlay } from '../../@/flow/flow-play'
import { FlowPack } from '../../@/pack/pack'
import { PackPuzzlesGridTypes } from '../../@/pack/pack-puzzles-grid'
import { FlowPuzzleResult } from '../../@/puzzle-result'
import { FlowPuzzle } from '../../@/puzzle/puzzle'
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
    flowPackPuzzleGrid: PackPuzzlesGridTypes.initClient
  }
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
    t: p.l('screen-add-puzzle')
  }),
  p.obj({
    t: p.l('screen-puzzle-grid')
  }),
  p.obj({
    t: p.l('screen-puzzle'),
    puzzleIndex: p.num,
    puzzleResult: FlowPuzzleResult,
    play: p.maybe(FlowPlay.Model),
    opened: p.maybe(p.l('more'))
  })
)

type Screen = p.Infer<typeof Screen>

export const ModelCore = p.obj({
  pack: FlowPack,
  screen: Screen,
  slideIndex: p.num,
  editPackName: EditPackNameTypes.ModelCore
})

export type ModelCore = {
  pack: FlowPack
  screen: Screen
  slideIndex: number
  editPackName: EditPackNameTypes.ModelCore
}

export const MsgCore = p.or(
  p.obj({
    t: p.l('got-edit-pack-name-msg'),
    c: EditPackNameTypes.MsgCore
  }),
  p.obj({
    t: p.l('screen-pack-builder.saved-pack'),
    saved: Result.parser(p.str, FlowPack)
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-opened-add-puzzle-screen'),
    userId: UserId
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-closed-add-puzzle-screen')
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-clicked-add-puzzle-item'),
    puzzle: FlowPuzzle,
    userId: UserId
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-clicked-pack-item'),
    puzzleResult: FlowPuzzleResult,
    puzzleIndex: p.num
  }),
  p.obj({
    t: p.l('screen-pack-builder.user-changed-slide'),
    newSlideIndex: p.num,
    userId: UserId
  }),
  p.obj({
    t: p.l('screen-pack-builder.got-flow-play-msg'),
    c: FlowPlay.Msg
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle'),
    userId: UserId
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-next-puzzle'),
    userId: UserId,
    nextPuzzleResult: FlowPuzzleResult
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button'),
    userId: UserId,
    previousPuzzleResult: FlowPuzzleResult
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-clicked-more-button'),
    userId: UserId
  }),
  p.obj({
    t: p.l('screen-pack-builder.puzzle-screen.user-closed-more-drawer'),
    userId: UserId
  }),
  p.obj({
    t: p.l('remove-puzzle-from-pack.user-clicked-remove-from-pack-button'),
    puzzleIndex: p.num,
    userId: UserId
  })
)

export type MsgCore = p.Infer<typeof MsgCore>
