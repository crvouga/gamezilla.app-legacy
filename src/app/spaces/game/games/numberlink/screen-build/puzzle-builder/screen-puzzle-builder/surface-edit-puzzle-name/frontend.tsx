import { Err, isErr, isLoading, isOk, Loading } from '~/@/result'
import { UnixMs } from '~/@/time/unix-ms'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { IconPen } from '~/@/ui/icon/icon-pen'
import { SurfaceBody } from '~/@/ui/surface/surface-body'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { TextField } from '~/@/ui/text-field'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ShowErrorSmall } from '~/app/@/frontend/show-error-small'
import { ShowOkSmall } from '~/app/@/frontend/show-ok-small'
import { ScreenAction, ScreenActionLocation } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { AddPuzzlesCmd } from '../../../../@/frontend/add-puzzles-cmd'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { IPuzzleDb } from '../../../../@/puzzle/puzzle-db'
import { PuzzleId } from '../../../../@/puzzle/puzzle-id'
import { PuzzleName } from '../../../../@/puzzle/puzzle-name'
import type { FrontendModule } from '../../../types'
import { editNameValidationErrorToString } from './types'

const update: FrontendModule['update'] = (input) => {
  const { model } = input
  return GameFrontendModule.andThen(
    { model },
    (model) => updateDraftNameInput({ ...input, model }),
    (model) => updateDrawer({ ...input, model }),
    (model) => updateFormButtons({ ...input, model }),
  )
}

const updateFormButtons: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'puzzle.edit-name.user-clicked-cancel-button': {
      return {
        model: {
          ...input.model,
          puzzleBuilderOpened: input.msg.screenActionLocation === 'more-drawer' ? 'more' : null,
          puzzleEditNameValidationError: null,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)],
      }
    }

    case 'puzzle.edit-name.user-clicked-save-button': {
      const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
      if (!puzzleBuilder) return { model: input.model }
      const newName = input.model.puzzleEditNameDraft ?? ''

      if (newName.length === 0) {
        return {
          model: {
            ...input.model,
            puzzleEditNameValidationError: 'name-cannot-be-empty',
          },
          msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm)],
        }
      }

      return {
        model: {
          ...input.model,
          puzzleEditNameRequest: Loading,
          puzzleEditNameValidationError: null,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          const result = await patchName({
            puzzleId: puzzleBuilder.puzzle.id,
            newName,
            userId: input.ctx.currentUser.userId,
            puzzleDb: input.ctx.puzzleDb,
          })
          dispatch({ t: 'puzzle.edit-name.db-updated', result })
        },
      }
    }

    case 'puzzle.edit-name.db-updated': {
      const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
      if (!puzzleBuilder) return { model: input.model }
      return {
        model: {
          ...input.model,
          puzzleEditNameRequest: input.msg.result,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.refreshFeed)],
        msgSpace: [
          {
            t: 'user-edited-puzzle-name',
            edited: input.msg.result,
            puzzleId: puzzleBuilder.puzzle.id,
            newName: input.model.puzzleEditNameDraft,
            userId: input.ctx.currentUser.userId,
          },
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

      return {
        model: {
          ...input.model,
          puzzleEditNameRequest: input.msgSpace.edited,
          puzzleBuilderOpened: null,
        },
        msgOut: [
          AddPuzzlesCmd.init(puzzlesNew, input),
          isOk(input.msgSpace.edited)
            ? ShowOkSmall.init(input.ctx.t('game.numberlink.saved-name'))
            : ShowErrorSmall.init(input.ctx.t('app.something-went-wrong')),
        ],
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
    lastUpdatedAt: UnixMs.now(),
    lastUpdatedBy: input.userId,
  }

  const put = await input.puzzleDb.put(patched)

  return put
}

const updateDrawer: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'puzzle.edit-name.user-clicked-button': {
      const isOpen = input.model.puzzleBuilderOpened === 'edit-name'
      if (isOpen) {
        return {
          model: {
            ...input.model,
            puzzleBuilderOpened: null,
          },
          msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)],
        }
      }
      return {
        model: {
          ...input.model,
          puzzleBuilderOpened: 'edit-name',
          puzzleEditNameDraft: input.modelSpace.screenPuzzleBuilder?.puzzle.name ?? '',
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceOpened)],
      }
    }

    case 'puzzle.edit-name.user-closed-drawer': {
      return {
        model: { ...input.model, puzzleBuilderOpened: null },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)],
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

const viewActions = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  return [
    {
      id: input.ctx.t('app.edit-name'),
      icon: (input) => <IconPen {...input} />,
      label: input.ctx.t('app.edit-name'),
      onClick: () => input.dispatch({ t: 'puzzle.edit-name.user-clicked-button' }),
      renderSurface: ({ dropDown, screenActionLocation }) => (
        <ViewSurface {...input} ctx={input.ctx} dropDown={dropDown} screenActionLocation={screenActionLocation} />
      ),
    },
  ]
}

const ViewSurface = (
  input: Parameters<FrontendModule['View']>[0] & {
    dropDown: DropDownConfig
    screenActionLocation: ScreenActionLocation
  },
) => {
  return (
    <SurfaceLayout
      id='edit-name-drawer'
      ctx={input.ctx}
      ariaLabel={input.ctx.t('app.edit-name')}
      open={input.model.puzzleBuilderOpened === 'edit-name'}
      onClose={() => input.dispatch({ t: 'puzzle.edit-name.user-closed-drawer' })}
      header={{
        render: () => (
          <SurfaceHeader
            ctx={input.ctx}
            title={input.ctx.t('app.edit-name')}
            onClose={() => input.dispatch({ t: 'puzzle.edit-name.user-closed-drawer' })}
          />
        ),
      }}
      form={{
        onSubmit: () => input.dispatch({ t: 'puzzle.edit-name.user-clicked-save-button' }),
        onCancel: () =>
          input.dispatch({
            t: 'puzzle.edit-name.user-clicked-cancel-button',
            screenActionLocation: input.screenActionLocation,
          }),
        cancelDisabled: false,
        cancelText: input.ctx.t('app.cancel'),
        submitText: input.ctx.t('app.save'),
        submitLoading: isLoading(input.model.puzzleEditNameRequest),
        submitDisabled: input.model.puzzleEditNameDraft === input.modelSpace.screenPuzzleBuilder?.puzzle.name,
      }}
      dropDown={input.dropDown}
      body={{
        render: () => (
          <SurfaceBody>
            <TextField
              id='game-numberlink-edit-puzzle-name-input'
              label={input.ctx.t('game.numberlink.edit-puzzle-name.name')}
              value={input.model.puzzleEditNameDraft}
              onChange={(draftName) => input.dispatch({ t: 'puzzle.edit-name.user-inputted-draft-name', draftName })}
              error={Boolean(input.model.puzzleEditNameValidationError)}
              helperText={editNameValidationErrorToString(input.ctx.t, input.model.puzzleEditNameValidationError)}
            />
          </SurfaceBody>
        ),
      }}
    />
  )
}

export const EditPuzzleNameFrontend = {
  update,
  viewActions,
}
