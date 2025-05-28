import { withEventId } from '~/@/event-sourced/event'
import { Loading, Result, isOk } from '~/@/result'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { IconFloppyDisk } from '~/@/ui/icon/icon-floppy-disk'
import { APP_SOUND, showErrSm, showOkSm } from '~/app/@/frontend/cmd'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SurfaceUnsavedChanges } from '~/app/@/ui/surface/unsaved-changes/surface-unsaved-changes'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { ModeEdit } from '../../../../@/mode-edit'
import type { Puzzle } from '../../../../@/puzzle/puzzle'
import type { FrontendModule, MsgSpace } from '../../../types'

//
//
//
//
//

const update: FrontendModule['update'] = (input) => {
  const { model } = input
  return GameFrontendModule.andThen(
    { model },
    (model) => updateExitBuilder({ ...input, model }),
    (model) => updateSaveChangesRequest({ ...input, model }),
    (model) => updateDbSavedPuzzle({ ...input, model }),
  )
}

const updateExitBuilder: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'screen-puzzle-builder.user-clicked-exit-button': {
      if (!input.modelSpace.screenPuzzleBuilder) {
        return exitBuilderWithSound(input)
      }

      if (
        ModeEdit.isUnsavedChanges(
          input.modelSpace.screenPuzzleBuilder.modeEdit,
          input.modelSpace.screenPuzzleBuilder.puzzle.flow,
        )
      ) {
        return {
          model: {
            ...input.model,
            puzzleBuilderOpened: 'unsaved-changes',
          },
          msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm)],
        }
      }

      return exitBuilderWithSound(input)
    }

    case 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit': {
      return {
        model: { ...input.model, puzzleBuilderOpened: null },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)],
      }
    }

    case 'screen-puzzle-builder.save-changes.user-clicked-discard-and-exit': {
      return exitBuilderWithSound(input)
    }

    case 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit': {
      return GameFrontendModule.andThen(
        { model: input.model },
        (model) => ({ model: { ...model, puzzleSaveChangesIsExiting: true } }),
        (model) => saveChanges({ ...input, model }),
      )
    }

    default: {
      break
    }
  }

  switch (input.msgSpace?.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (
        input.model.puzzleSaveChangesRequest?.t === 'loading' &&
        input.model.puzzleSaveChangesIsExiting &&
        isOk(input.msgSpace.saved)
      ) {
        return exitBuilder({
          ...input,
          model: {
            ...input.model,
            puzzleSaveChangesIsExiting: false,
            puzzleBuilderOpened: null,
          },
        })
      }
      return {
        model: input.model,
      }
    }
    default: {
      break
    }
  }

  return { model: input.model }
}

const updateSaveChangesRequest: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'screen-puzzle-builder.save-changes.user-clicked-save-button': {
      return saveChanges(input)
    }
  }

  switch (input.msgSpace?.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      return {
        model: {
          ...input.model,
          puzzleSaveChangesRequest: Result.mapOk(input.msgSpace.saved, () => null),
        },
        msgCmd:
          input.msgSpace.userId === input.ctx.currentUser.userId
            ? isOk(input.msgSpace.saved)
              ? showOkSm(input.ctx.t('app.saved-changes'))
              : showErrSm(input.ctx.t('app.something-went-wrong'))
            : [],
      }
    }
  }

  return { model: input.model }
}

const exitBuilderWithSound: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => exitBuilder({ ...input, model }),
    (model) => ({ model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] }),
  )
}

const exitBuilder: FrontendModule['update'] = (input) => {
  const msgSpace: MsgSpace = {
    t: 'screen-puzzle-builder.user-clicked-exit-button',
    userId: input.ctx.currentUser.userId,
  }

  return {
    model: {
      ...input.model,
      puzzleBuilderOpened: null,
    },
    msgSpace: [withEventId(msgSpace)],
  }
}

const saveChanges: FrontendModule['update'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder

  if (!puzzleBuilder) {
    return { model: input.model }
  }

  const puzzleNew: Puzzle = {
    ...puzzleBuilder.puzzle,
    lastUpdatedAt: input.ctx.now,
    lastUpdatedBy: input.ctx.currentUser.userId,
    flow: ModeEdit.toFlow(puzzleBuilder.modeEdit),
  }

  return {
    model: {
      ...input.model,
      puzzleSaveChangesRequest: Loading,
    },
    msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
    async eff(dispatch) {
      const put = await input.ctx.puzzleDb.put(puzzleNew)
      dispatch({
        t: 'screen-puzzle-builder.save-changed.db-saved-puzzle',
        saved: Result.mapOk(put, () => puzzleNew),
        userId: input.ctx.currentUser.userId,
      })
    },
  }
}

const updateDbSavedPuzzle: FrontendModule['update'] = (input) => {
  const { msg } = input
  switch (msg?.t) {
    case 'screen-puzzle-builder.save-changed.db-saved-puzzle': {
      return GameFrontendModule.andThen(
        { model: input.model },
        (model) => {
          if (model.puzzleSaveChangesIsExiting) {
            return exitBuilderWithSound({ ...input, model })
          }
          return { model }
        },
        (model) => {
          return {
            model: {
              ...model,
              puzzleSaveChangesRequest: msg.saved,
              puzzleSaveChangesIsExiting: false,
            },
            msgSpace: [
              withEventId({
                t: 'screen-puzzle-builder.saved-puzzle',
                saved: msg.saved,
                userId: msg.userId,
              }),
            ],
          }
        },
      )
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

//
//
//
//
//
//
//

const ViewUnsavedChangesSurface = (input: Parameters<FrontendModule['View']>[0] & { dropDown: DropDownConfig }) => {
  return (
    <SurfaceUnsavedChanges
      dropDown={input.dropDown}
      ctx={input.ctx}
      title={input.ctx.t('app.save-changes?')}
      body={input.ctx.t('unsaved-changes.unsaved-changes-warning')}
      open={input.model.puzzleBuilderOpened === 'unsaved-changes'}
      onClose={() => input.dispatch({ t: 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit' })}
      saveText={input.ctx.t('app.save')}
      onSave={() => input.dispatch({ t: 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit' })}
      saveLoading={input.model.puzzleSaveChangesRequest?.t === 'loading'}
      discardText={input.ctx.t("app.don't-save")}
      onDiscard={() => input.dispatch({ t: 'screen-puzzle-builder.save-changes.user-clicked-discard-and-exit' })}
      cancelText={input.ctx.t('app.cancel')}
      onCancel={() => input.dispatch({ t: 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit' })}
    />
  )
}

const viewActions = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  return [
    {
      id: input.ctx.t('app.save'),
      icon: (input) => <IconFloppyDisk {...input} />,
      label: input.ctx.t('app.save'),
      onClick: () => input.dispatch({ t: 'screen-puzzle-builder.save-changes.user-clicked-save-button' }),
      loading: input.model.puzzleSaveChangesRequest?.t === 'loading',
    },
  ]
}

export const SaveChangesFrontend = {
  viewActions,
  ViewUnsavedChangesSurface,
  update,
}
