import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../../@/puzzle/puzzle'
import { ModeEdit } from '../../@/mode-edit'
import { ModePlay } from '../../@/mode-play'
import { DeleteForeverTypes } from './drawer-delete-forever'
import { EditPuzzleNameTypes } from './drawer-edit-puzzle-name'
import { SaveChangesTypes } from './drawer-save-changes'

export type ModelFrontend = SaveChangesTypes.ModelFrontend &
  EditPuzzleNameTypes.ModelFrontend &
  DeleteForeverTypes.ModelFrontend

export const initFrontend: ModelFrontend = {
  ...EditPuzzleNameTypes.initFrontend,
  ...DeleteForeverTypes.initFrontend,
  ...SaveChangesTypes.initFrontend,
}

export type ModelBackend = null

export type MsgBackend = SaveChangesTypes.MsgBackend | DeleteForeverTypes.MsgBackend | EditPuzzleNameTypes.MsgBackend

export type MsgFrontend =
  | EditPuzzleNameTypes.MsgFrontend
  | DeleteForeverTypes.MsgFrontend
  | SaveChangesTypes.MsgFrontend
  | { t: 'screen-puzzle-builder.got-edit-msg'; c: ModeEdit.Msg }
  | { t: 'screen-puzzle-builder.got-play-msg'; c: ModePlay.Msg }
  | { t: 'screen-puzzle-builder.user-clicked-open-more-drawer-button' }
  | { t: 'screen-puzzle-builder.user-closed-more-drawer' }
  | { t: 'screen-puzzle-builder.user-clicked-exit-button' }
  | { t: 'screen-puzzle-builder.user-clicked-edit-mode-button' }
  | { t: 'screen-puzzle-builder.user-clicked-play-mode-button' }

export type MsgToFrontend =
  | SaveChangesTypes.MsgToFrontend
  | DeleteForeverTypes.MsgToFrontend
  | EditPuzzleNameTypes.MsgToFrontend

export type MsgToBackend =
  | SaveChangesTypes.MsgToBackend
  | DeleteForeverTypes.MsgToBackend
  | EditPuzzleNameTypes.MsgToBackend

//
//
//
//
//
//

const Mode = p.or(p.obj({ t: p.l('play') }), p.obj({ t: p.l('edit') }))
type Mode = p.Infer<typeof Mode>

export const ModelSpace = p.obj({
  t: p.l('puzzle-builder'),
  puzzle: Puzzle,
  mode: Mode,
  ModePlay: ModePlay.Model,
  ModeEdit: ModeEdit.Model,
})
export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  SaveChangesTypes.MsgSpace,
  DeleteForeverTypes.MsgSpace,
  EditPuzzleNameTypes.MsgSpace,
  p.obj({
    t: p.l('screen-puzzle-builder.got-play-msg'),
    c: ModePlay.Msg,
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.got-edit-msg'),
    c: ModeEdit.Msg,
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.user-clicked-edit-mode-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.user-clicked-play-mode-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.user-clicked-exit-button'),
    userId: UserId,
  }),
)

export type MsgSpace = p.Infer<typeof MsgSpace>
