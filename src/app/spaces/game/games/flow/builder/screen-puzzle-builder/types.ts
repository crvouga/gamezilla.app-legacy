import { p } from '~/@/parser'
import { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../../@/puzzle/puzzle'
import { EditMode } from '../../@/edit-mode'
import { PlayMode } from '../../@/play-mode'
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
  | { t: 'screen-puzzle-builder.got-edit-msg'; c: EditMode.Msg }
  | { t: 'screen-puzzle-builder.got-play-msg'; c: PlayMode.Msg }
  | { t: 'screen-puzzle-builder.user-clicked-more-button' }
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
  playMode: PlayMode.Model,
  editMode: EditMode.Model,
})
export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  SaveChangesTypes.MsgSpace,
  DeleteForeverTypes.MsgSpace,
  EditPuzzleNameTypes.MsgSpace,
  p.obj({
    t: p.l('screen-puzzle-builder.got-play-msg'),
    c: PlayMode.Msg,
  }),
  p.obj({
    t: p.l('screen-puzzle-builder.got-edit-msg'),
    c: EditMode.Msg,
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
