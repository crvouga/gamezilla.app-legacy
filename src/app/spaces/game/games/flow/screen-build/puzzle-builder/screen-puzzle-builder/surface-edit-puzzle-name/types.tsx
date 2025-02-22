import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { p } from '~/@/parser'
import { NotAsked, type RemoteResult, Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../../../../@/puzzle/puzzle-id'

export type ModelFrontend = {
  puzzleEditNameRequest: RemoteResult<string, null>
  puzzleEditNameDraft: string
  puzzleEditNameValidationError: EditNameValidationError
}

export const initFrontend: ModelFrontend = {
  puzzleEditNameDraft: '',
  puzzleEditNameRequest: NotAsked,
  puzzleEditNameValidationError: null,
}

export type EditNameValidationError = 'name-cannot-be-empty' | null

export const editNameValidationErrorToString = (
  t: Translator,
  error?: EditNameValidationError,
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

export type MsgFrontend =
  | { t: 'puzzle.edit-name.user-inputted-draft-name'; draftName: string }
  | { t: 'puzzle.edit-name.user-closed-drawer' }
  | { t: 'puzzle.edit-name.user-clicked-button' }
  | { t: 'puzzle.edit-name.user-clicked-save-button' }
  | { t: 'puzzle.edit-name.user-clicked-cancel-button' }
  | { t: 'puzzle.edit-name.db-updated'; result: Result<string, null> }

export type MsgBackend = {
  t: 'noop'
}

export type MsgToBackend = {
  t: 'noop'
}

export type MsgToFrontend = {
  t: 'noop'
}

export const MsgSpace = p.obj({
  t: p.l('user-edited-puzzle-name'),
  edited: Result.parser(p.str, p.l(null)),
  puzzleId: PuzzleId,
  newName: p.str,
  userId: UserId,
})
export type MsgSpace = p.Infer<typeof MsgSpace>
