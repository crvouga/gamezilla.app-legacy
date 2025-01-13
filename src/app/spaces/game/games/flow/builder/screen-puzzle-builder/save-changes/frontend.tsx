import { withEventId } from '~/@/event-sourced/event'
import type { Translator } from '~/@/l18n/generated'
import { Loading, Result, isErr, isOk } from '~/@/result'
import { APP_SOUND, playSound, sendToBackend, showCreatedSm, showErrSm } from '~/app/@/frontend/cmd'
import { Button, Drawer, IconFloppyDisk, Typography } from '~/app/@/ui'
import { BottomButtons } from '~/app/@/ui/bottom-buttons'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { EditMode } from '../../../@/edit-mode'
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
    (model) => updatePuzzles({ ...input, model }),
  )
}

const updatePuzzles: FrontendModule['update'] = ({ msgSpace, model }) => {
  switch (msgSpace?.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (isErr(msgSpace.saved)) {
        return {
          model,
        }
      }
      const puzzleNew = msgSpace.saved.value

      return {
        model,
        msgCmd: [
          {
            t: 'flow-cmd.add-puzzles',
            puzzles: {
              [puzzleNew.id]: puzzleNew,
            },
            causedBy: { msgSpace },
          },
        ],
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

const updateExitBuilder: FrontendModule['update'] = (input) => {
  const { msg, model, modelSpace, msgSpace } = input

  switch (msg?.t) {
    case 'screen-puzzle-builder.user-clicked-exit-button': {
      if (!modelSpace.screenPuzzleBuilder) {
        return exitBuilderWithSound(input)
      }

      if (
        EditMode.isUnsavedChanges(modelSpace.screenPuzzleBuilder.editMode, modelSpace.screenPuzzleBuilder.puzzle.flow)
      ) {
        return {
          model: {
            ...model,
            puzzleBuilderOpened: 'unsaved-changes',
          },
          msgCmd: [playSound(APP_SOUND.alertErrorSm)],
        }
      }

      return exitBuilderWithSound(input)
    }

    case 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: null,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case 'screen-puzzle-builder.save-changes.user-clicked-discard-and-exit': {
      return exitBuilderWithSound(input)
    }

    case 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit': {
      return saveChanges({
        ...input,
        model: {
          ...model,
          puzzleSaveChangesIsExiting: true,
        },
      })
    }

    default: {
      break
    }
  }

  switch (msgSpace?.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (model.puzzleSaveChangesRequest?.t === 'loading' && model.puzzleSaveChangesIsExiting && isOk(msgSpace.saved)) {
        return exitBuilder({
          ...input,
          model: {
            ...model,
            puzzleSaveChangesIsExiting: false,
            puzzleBuilderOpened: null,
          },
        })
      }
      return {
        model,
      }
    }
    default: {
      break
    }
  }

  return { model }
}

const updateSaveChangesRequest: FrontendModule['update'] = (input) => {
  const { model, msg, ctx, msgSpace } = input

  if (msg?.t === 'screen-puzzle-builder.save-changes.user-clicked-save-button') {
    return saveChanges(input)
  }

  if (msgSpace?.t === 'screen-puzzle-builder.saved-puzzle') {
    return {
      model: {
        ...model,
        puzzleSaveChangesRequest: Result.mapOk(msgSpace.saved, () => null),
      },
      msgCmd:
        msgSpace.userId === ctx.currentUserId
          ? isOk(msgSpace.saved)
            ? showCreatedSm(ctx.t('app.saved-changes'))
            : showErrSm(ctx.t('app.something-went-wrong'))
          : [],
    }
  }
  return { model }
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

const saveChanges: FrontendModule['update'] = ({ model, modelSpace }) => {
  const puzzleBuilder = modelSpace.screenPuzzleBuilder

  if (!puzzleBuilder) {
    return { model }
  }

  const puzzleNew: Puzzle = {
    ...puzzleBuilder.puzzle,
    flow: EditMode.toFlowMemoized({
      model: puzzleBuilder.editMode,
    }),
  }

  return {
    model: {
      ...model,
      puzzleSaveChangesRequest: Loading,
    },
    msgCmd: [
      playSound(APP_SOUND.tap),
      sendToBackend({
        t: 'screen-puzzle-builder.save-changes.user-clicked-save-button',
        puzzle: puzzleNew,
      }),
    ],
  }
}

//
//
//
//
//
//
//

export const ViewBottomButtons = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: {
    t: Translator
  }
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  return (
    <>
      <BottomButtons.Button
        icon={(input) => <IconFloppyDisk {...input} />}
        label={ctx.t('app.save')}
        onClick={() =>
          dispatch({
            t: 'screen-puzzle-builder.save-changes.user-clicked-save-button',
          })
        }
        loading={model.puzzleSaveChangesRequest?.t === 'loading'}
      />
    </>
  )
}

const ViewUnsavedChangesDrawer: FrontendModule['View'] = (input) => {
  return (
    <Drawer
      id='unsaved-changes-drawer'
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
          onClick={() =>
            input.dispatch({
              t: 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit',
            })
          }
        />
        <Button
          className='w-full'
          text={input.ctx.t('app.dont-save')}
          onClick={() =>
            input.dispatch({
              t: 'screen-puzzle-builder.save-changes.user-clicked-discard-and-exit',
            })
          }
        />
        <div className='w-full' />
        <Button
          className='w-full'
          text={input.ctx.t('app.cancel')}
          onClick={() =>
            input.dispatch({
              t: 'screen-puzzle-builder.save-changes.user-clicked-cancel-exit',
            })
          }
        />
      </div>
    </Drawer>
  )
}

export const SaveChangesFrontend = {
  ViewBottomButtons,
  update,
  ViewUnsavedChangesDrawer,
}
