import { withEventId } from '~/@/event-sourced/event'
import type { Translator } from '~/@/l18n/generated'
import { Loading, Result, isOk } from '~/@/result'
import { APP_SOUND, playSound, showCreatedSm, showErrSm } from '~/app/@/frontend/cmd'
import { Button, Drawer, IconFloppyDisk, Typography } from '~/app/@/ui'
import { ScreenAction } from '~/app/@/screen/screen-actions'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { ModeEdit } from '../../../@/mode-edit'
import type { Puzzle } from '../../../@/puzzle/puzzle'
import type { FrontendModule, ModelFrontend, MsgFrontend, MsgSpace } from '../../types'

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
          input.modelSpace.screenPuzzleBuilder.ModeEdit,
          input.modelSpace.screenPuzzleBuilder.puzzle.flow,
        )
      ) {
        return {
          model: {
            ...input.model,
            puzzleBuilderOpened: 'unsaved-changes',
          },
          msgCmd: [playSound(APP_SOUND.alertErrorSm)],
        }
      }

      return exitBuilderWithSound(input)
    }

    case 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit': {
      return {
        model: { ...input.model, puzzleBuilderOpened: null },
        msgCmd: [playSound(APP_SOUND.drawerClosed)],
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
          input.msgSpace.userId === input.ctx.currentUserId
            ? isOk(input.msgSpace.saved)
              ? showCreatedSm(input.ctx.t('app.saved-changes'))
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
    (model) => ({ model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }),
  )
}

const exitBuilder: FrontendModule['update'] = (input) => {
  const msgSpace: MsgSpace = {
    t: 'screen-puzzle-builder.user-clicked-exit-button',
    userId: input.ctx.currentUserId,
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
    lastUpdatedBy: input.ctx.currentUserId,
    flow: ModeEdit.toFlowMemoized({
      model: puzzleBuilder.ModeEdit,
    }),
  }

  return {
    model: {
      ...input.model,
      puzzleSaveChangesRequest: Loading,
    },
    msgCmd: [playSound(APP_SOUND.tap)],
    async eff(dispatch) {
      const put = await input.ctx.puzzleDb.put(puzzleNew)
      dispatch({
        t: 'screen-puzzle-builder.save-changed.db-saved-puzzle',
        saved: Result.mapOk(put, () => puzzleNew),
        userId: input.ctx.currentUserId,
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

export const viewBottomButtons = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: {
    t: Translator
  }
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}): ScreenAction[] => {
  return [
    {
      icon: (input) => <IconFloppyDisk {...input} />,
      label: ctx.t('app.save'),
      onClick: () =>
        dispatch({
          t: 'screen-puzzle-builder.save-changes.user-clicked-save-button',
        }),
      loading: model.puzzleSaveChangesRequest?.t === 'loading',
    },
  ]
}

const ViewUnsavedChangesDrawer: FrontendModule['View'] = (input) => {
  return (
    <Drawer
      ctx={input.ctx}
      id='unsaved-changes-drawer'
      ariaLabel={input.ctx.t('app.save-changes?')}
      onClose={() =>
        input.dispatch({
          t: 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit',
        })
      }
      open={input.model.puzzleBuilderOpened === 'unsaved-changes'}
      position='bottom'
    >
      <Typography className='px-4 pt-4 text-3xl font-bold' variant='title' text={input.ctx.t('app.save-changes?')} />
      <Typography className='text-secondary p-4' variant='body' text={input.ctx.t('app.save-changes-warning')} />
      <div className='flex w-full flex-col gap-4 p-4'>
        <Button
          className='w-full'
          text={input.ctx.t('app.save')}
          variant='contained'
          color='primary'
          loading={input.model.puzzleSaveChangesRequest?.t === 'loading'}
          onClick={() => input.dispatch({ t: 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit' })}
        />
        <Button
          className='w-full'
          text={input.ctx.t("app.don't-save")}
          onClick={() => input.dispatch({ t: 'screen-puzzle-builder.save-changes.user-clicked-discard-and-exit' })}
        />
        <div className='w-full' />
        <Button
          className='w-full'
          text={input.ctx.t('app.cancel')}
          onClick={() => input.dispatch({ t: 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit' })}
        />
      </div>
    </Drawer>
  )
}

export const SaveChangesFrontend = {
  viewBottomButtons,
  update,
  ViewUnsavedChangesDrawer,
}
