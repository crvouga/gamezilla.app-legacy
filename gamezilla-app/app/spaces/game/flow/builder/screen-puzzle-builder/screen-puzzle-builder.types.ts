import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import type { FlowVariant } from '../../@/flow'
import { FlowPuzzle } from '../../@/flow-puzzle/flow-puzzle'
import { FlowEdit } from '../../@/flow/flow-edit'
import { FlowPlay } from '../../@/flow/flow-play'
import { DeleteForeverTypes } from './delete-forever'
import { EditPuzzleNameTypes } from './edit-puzzle-name'
import { SaveChangesTypes } from './save-changes'

export type ModelClient = SaveChangesTypes.ModelClient &
  EditPuzzleNameTypes.ModelClient &
  DeleteForeverTypes.ModelClient

export const initClient: ModelClient = {
  ...EditPuzzleNameTypes.initClient,
  ...DeleteForeverTypes.initClient,
  ...SaveChangesTypes.initClient
}

export type ModelServer = null

export type MsgServer = SaveChangesTypes.MsgServer | DeleteForeverTypes.MsgServer | EditPuzzleNameTypes.MsgServer

export type MsgClient =
  | EditPuzzleNameTypes.MsgClient
  | DeleteForeverTypes.MsgClient
  | SaveChangesTypes.MsgClient
  | {
      t: 'screen-puzzle-builder.flow-ui-edit'
      c: FlowEdit.Msg
    }
  | {
      t: 'screen-puzzle-builder.flow-ui-play'
      c: FlowPlay.Msg
    }
  | { t: 'screen-puzzle-builder.user-clicked-more-button' }
  | { t: 'screen-puzzle-builder.user-closed-more-drawer' }
  | { t: 'screen-puzzle-builder.user-clicked-exit-button' }
  | {
      t: 'screen-puzzle-builder.user-clicked-edit-mode-button'
    }
  | {
      t: 'screen-puzzle-builder.user-clicked-play-mode-button'
    }

export type MsgToClient =
  | SaveChangesTypes.MsgToClient
  | DeleteForeverTypes.MsgToClient
  | EditPuzzleNameTypes.MsgToClient

export type MsgToServer =
  | SaveChangesTypes.MsgToServer
  | DeleteForeverTypes.MsgToServer
  | EditPuzzleNameTypes.MsgToServer

//
//
//
//
//
//

const Mode = p.or(p.obj({ t: p.l('play') }), p.obj({ t: p.l('edit') }))
type Mode = p.Infer<typeof Mode>

export const ModelCore = p.obj({
  t: p.l('puzzle-builder'),
  puzzle: FlowPuzzle,
  mode: Mode,
  play: FlowPlay.Model,
  edit: FlowEdit.Model
})
export type ModelCore = p.Infer<typeof ModelCore>

export const toFlow = (modelCore: ModelCore): FlowVariant.Model => {
  switch (modelCore.mode.t) {
    case 'edit': {
      return FlowEdit.toFlow({
        model: modelCore.edit
      })
    }

    case 'play': {
      return FlowPlay.toFlow({
        flow: FlowEdit.toFlow({
          model: modelCore.edit
        }),
        model: modelCore.play
      })
    }
  }
}

export const MsgCore = p.or(
  SaveChangesTypes.MsgCore,
  DeleteForeverTypes.MsgCore,
  EditPuzzleNameTypes.MsgCore,
  p.obj({
    t: p.l('screen-puzzle-builder.flow-ui-play'),
    c: FlowPlay.Msg
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.flow-ui-edit'),
    c: FlowEdit.Msg
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.user-clicked-edit-mode-button'),
    userId: UserId
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.user-clicked-play-mode-button'),
    userId: UserId
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.user-clicked-exit-button'),
    userId: UserId
  })
)

export type MsgCore = p.Infer<typeof MsgCore>
