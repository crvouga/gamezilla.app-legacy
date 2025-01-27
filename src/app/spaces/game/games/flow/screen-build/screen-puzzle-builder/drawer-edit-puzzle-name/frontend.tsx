import { withEventId } from '~/@/event-sourced/event'
import { Err, isErr, isLoading, isOk, Loading } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND, playSound, showCreatedSm, showErrSm } from '~/app/@/frontend/cmd'
import { Drawer, DrawerHeader, TextField } from '~/app/@/ui'
import { ViewForm } from '~/app/@/screen/form'
import { FormBottomButtons } from '~/app/@/screen/form-button-buttons'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { FlowFrontendCmd } from '../../../@/frontend/cmd'
import { FlowFrontendCmdRoot } from '../../../@/frontend/cmd-root'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { IPuzzleDb } from '../../../@/puzzle/puzzle-db'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'
import { PuzzleName } from '../../../@/puzzle/puzzle-name'
import type { FrontendModule } from '../../types'
import { editNameValidationErrorToString, MsgFrontend, MsgToBackend } from './types'

const update: FrontendModule['update'] = (input) => {
  const { model } = input
  return GameFrontendModule.andThen(
    { model },
    (model) => updateDraftNameInput({ ...input, model }),
    (model) => updateDrawer({ ...input, model }),
    (model) => updateFormButtons({ ...input, model }),
  )
}

const View: FrontendModule['View'] = (input) => {
  return (
    <Drawer
      ctx={input.ctx}
      ariaLabel={input.ctx.t('app.edit-name')}
      id='edit-name-drawer'
      open={input.model.puzzleBuilderOpened === 'edit-name'}
      onClose={() => input.dispatch({ t: 'puzzle.edit-name.user-closed-drawer' })}
      position='bottom'
    >
      <ViewForm
        name={input.ctx.t('app.edit-name')}
        onSubmit={() => {
          input.dispatch({ t: 'puzzle.edit-name.user-clicked-save-button' })
        }}
      >
        <DrawerHeader
          ctx={input.ctx}
          title={input.ctx.t('app.edit-name')}
          onClose={() => input.dispatch({ t: 'puzzle.edit-name.user-closed-drawer' })}
        />
        <div className='w-full p-4'>
          <TextField
            id='edit-name-input'
            label={input.ctx.t('flow.edit-puzzle-name.name')}
            value={input.model.puzzleEditNameDraft}
            onChange={(draftName) =>
              input.dispatch({
                t: 'puzzle.edit-name.user-inputted-draft-name',
                draftName,
              })
            }
            error={Boolean(input.model.puzzleEditNameValidationError)}
            helperText={editNameValidationErrorToString(input.ctx.t, input.model.puzzleEditNameValidationError)}
          />
        </div>
        <FormBottomButtons
          onCancel={() => input.dispatch({ t: 'puzzle.edit-name.user-clicked-cancel-button' })}
          cancelText={input.ctx.t('app.cancel')}
          submitText={input.ctx.t('app.save')}
          submitLoading={isLoading(input.model.puzzleEditNameRequest)}
          submitDisabled={input.model.puzzleEditNameDraft === input.modelSpace.screenPuzzleBuilder?.puzzle.name}
        />
      </ViewForm>
    </Drawer>
  )
}

const updateFormButtons: FrontendModule['update'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder

  if (!puzzleBuilder) {
    return { model: input.model }
  }

  switch (input.msg?.t) {
    case 'puzzle.edit-name.user-clicked-cancel-button': {
      return {
        model: { ...input.model, puzzleBuilderOpened: 'more', puzzleEditNameValidationError: null },
        msgCmd: [playSound(APP_SOUND.drawerClosed)],
      }
    }

    case 'puzzle.edit-name.user-clicked-save-button': {
      const newName = input.model.puzzleEditNameDraft ?? ''

      if (newName.length === 0) {
        return {
          model: {
            ...input.model,
            puzzleEditNameValidationError: 'name-cannot-be-empty',
          },
          msgCmd: [playSound(APP_SOUND.alertErrorSm)],
        }
      }

      return {
        model: {
          ...input.model,
          puzzleEditNameRequest: Loading,
          puzzleEditNameValidationError: null,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
        async eff(dispatch) {
          const result = await patchName({
            puzzleId: puzzleBuilder.puzzle.id,
            newName,
            userId: input.ctx.currentUserId,
            puzzleDb: input.ctx.puzzleDb,
          })
          dispatch({ t: 'puzzle.edit-name.db-updated', result })
        },
      }
    }

    case 'puzzle.edit-name.db-updated': {
      return {
        model: {
          ...input.model,
          puzzleEditNameRequest: input.msg.result,
        },

        msgCmd: [playSound(APP_SOUND.refreshFeed)],
        msgSpace: [
          withEventId({
            t: 'user-edited-puzzle-name',
            edited: input.msg.result,
            puzzleId: puzzleBuilder.puzzle.id,
            newName: input.model.puzzleEditNameDraft,
            userId: input.ctx.currentUserId,
          }),
        ],
      }
    }
  }

  switch (input.msgSpace?.t) {
    case 'user-edited-puzzle-name': {
      const puzzlesNew = {
        ...input.ctx.puzzles,
      }
      const puzzle = puzzlesNew[input.msgSpace.puzzleId]

      if (puzzle && PuzzleName.is(input.msgSpace.newName)) {
        puzzlesNew[input.msgSpace.puzzleId] = {
          ...puzzle,
          name: input.msgSpace.newName,
        }
      }

      type WireTypes = { MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }

      const msgCmd: FlowFrontendCmd<WireTypes>[] = [
        FlowFrontendCmdRoot.addPuzzles(puzzlesNew, input),
        ...(isOk(input.msgSpace.edited)
          ? showCreatedSm<WireTypes>(input.ctx.t('flow.saved-name'))
          : showErrSm<WireTypes>(input.ctx.t('app.something-went-wrong'))),
      ]

      return {
        model: {
          ...input.model,
          puzzleEditNameRequest: input.msgSpace.edited,
          puzzleBuilderOpened: null,
        },
        msgCmd,
      }
    }
  }

  return { model: input.model }
}

const patchName = async (input: { puzzleId: PuzzleId; newName: string; userId: UserId; puzzleDb: IPuzzleDb }) => {
  const result = await input.puzzleDb.get(input.puzzleId)

  if (isErr(result)) return result

  const puzzle = result.value

  if (!puzzle) return Err('Failed to find puzzle')

  if (puzzle.createdBy !== input.userId) return Err('You must be the creator of this puzzle to edit it.')

  const newNameFinal = typeof input.newName === 'string' && input.newName.length > 0 ? input.newName : puzzle.name

  if (!PuzzleName.is(newNameFinal)) return Err('Invalid name')

  const patched: Puzzle = {
    ...puzzle,
    name: newNameFinal,
    lastUpdatedAt: Posix.now(),
    lastUpdatedBy: input.userId,
  }

  const put = await input.puzzleDb.put(patched)

  return put
}

const updateDrawer: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'puzzle.edit-name.user-clicked-button': {
      return {
        model: {
          ...input.model,
          puzzleBuilderOpened: 'edit-name',
          puzzleEditNameDraft: input.modelSpace.screenPuzzleBuilder?.puzzle.name ?? '',
        },
        msgCmd: [playSound(APP_SOUND.drawerOpened)],
      }
    }

    case 'puzzle.edit-name.user-closed-drawer': {
      return {
        model: { ...input.model, puzzleBuilderOpened: null },
        msgCmd: [playSound(APP_SOUND.drawerClosed)],
      }
    }

    default: {
      return { model: input.model }
    }
  }
}

const updateDraftNameInput: FrontendModule['update'] = ({ model, msg }) => {
  switch (msg?.t) {
    case 'puzzle.edit-name.user-inputted-draft-name': {
      return {
        model: {
          ...model,
          puzzleEditNameDraft: msg.draftName,
          puzzleEditNameValidationError: null,
        },
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

export const EditPuzzleNameFrontend = {
  update,
  View,
}
