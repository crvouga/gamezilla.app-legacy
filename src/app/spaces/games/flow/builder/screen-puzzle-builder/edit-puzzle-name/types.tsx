import { type RemoteResult, Result, NotAsked } from '~/@/result'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'
import { UserId } from '~/app/@/data/user-id'
import { p } from '~/@/parser'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'

//
//
//
//

export type ModelClient = {
  puzzleEditNameRequest: RemoteResult<string, null>
  puzzleEditNameDraft: string
  puzzleEditNameValidationError: EditNameValidationError
}

export const initClient: ModelClient = {
  puzzleEditNameDraft: '',
  puzzleEditNameRequest: NotAsked,
  puzzleEditNameValidationError: null
}

export type EditNameValidationError = 'name-cannot-be-empty' | null

export const editNameValidationErrorToString = (
  t: Translator,
  error?: EditNameValidationError
): TranslatedText | null => {
  switch (error) {
    case 'name-cannot-be-empty': {
      return t('flow.edit-puzzle-name.name-cannot-be-empty')
    }
    default: {
      return null
    }
  }
}

export type ModelServer = {}

//
//
//
//

export type MsgClient =
  | {
      t: 'puzzle.edit-name.user-inputted-draft-name'
      draftName: string
    }
  | { t: 'puzzle.edit-name.user-closed-drawer' }
  | { t: 'puzzle.edit-name.user-clicked-button' }
  | { t: 'puzzle.edit-name.user-clicked-save-button' }
  | { t: 'puzzle.edit-name.user-clicked-cancel-button' }

export type MsgServer = { t: 'noop' }

export type MsgToServer = {
  t: 'puzzle.edit-name.user-clicked-save-button'
  newName: string
  flowPuzzleId: PuzzleId
}

export type MsgToClient = {
  t: 'noop'
}

//
//
//
//
//

export const MsgCore = p.obj({
  t: p.l('user-edited-puzzle-name'),
  edited: Result.parser(p.str, p.l(null)),
  flowPuzzleId: PuzzleId,
  newName: p.str,
  userId: UserId
})
export type MsgCore = p.Infer<typeof MsgCore>
