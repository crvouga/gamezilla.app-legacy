import { withEventId } from '~/@/event-sourced/event'
import type { Translator } from '~/@/l18n/generated'
import { Loading, Result, isErr, isOk } from '~/@/result'
import { APP_SOUND, playSound, sendToBackend, showCreatedSm, showErrSm } from '~/app/@/client/cmd'
import { Button, Drawer, IconFloppyDisk, Typography } from '~/app/@/ui'
import { BottomButtons } from '~/app/@/ui/bottom-buttons'
import { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import { EditMode } from '../../../@/edit-mode'
import type { Puzzle } from '../../../@/puzzle/puzzle'
import type { ClientModule, ModelClient, MsgClient, MsgCore } from '../../types'

//
//
//
//
//

const update: ClientModule['update'] = (input) => {
  const { model } = input
  return GameClientModule.andThen(
    { model },
    (model) => updateExitBuilder({ ...input, model }),
    (model) => updateSaveChangesRequest({ ...input, model }),
    (model) => updatePuzzles({ ...input, model }),
  )
}

const updatePuzzles: ClientModule['update'] = ({ msgCore, model }) => {
  switch (msgCore?.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (isErr(msgCore.saved)) {
        return {
          model,
        }
      }
      const puzzleNew = msgCore.saved.value

      return {
        model,
        msgCmd: [
          {
            t: 'flow-cmd.add-puzzles',
            puzzles: {
              [puzzleNew.id]: puzzleNew,
            },
            causedBy: { msgCore },
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

const updateExitBuilder: ClientModule['update'] = (input) => {
  const { msg, model, modelCore, msgCore } = input

  switch (msg?.t) {
    case 'screen-puzzle-builder.user-clicked-exit-button': {
      if (!modelCore.screenPuzzleBuilder) {
        return exitBuilderWithSound(input)
      }

      if (
        EditMode.isUnsavedChanges(modelCore.screenPuzzleBuilder.editMode, modelCore.screenPuzzleBuilder.puzzle.flow)
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

  switch (msgCore?.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (model.puzzleSaveChangesRequest?.t === 'loading' && model.puzzleSaveChangesIsExiting && isOk(msgCore.saved)) {
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

const updateSaveChangesRequest: ClientModule['update'] = (input) => {
  const { model, msg, ctx, msgCore } = input

  if (msg?.t === 'screen-puzzle-builder.save-changes.user-clicked-save-button') {
    return saveChanges(input)
  }

  if (msgCore?.t === 'screen-puzzle-builder.saved-puzzle') {
    return {
      model: {
        ...model,
        puzzleSaveChangesRequest: Result.mapOk(msgCore.saved, () => null),
      },
      msgCmd:
        msgCore.userId === ctx.currentUserId
          ? isOk(msgCore.saved)
            ? showCreatedSm(ctx.t('app.saved-changes'))
            : showErrSm(ctx.t('app.something-went-wrong'))
          : [],
    }
  }
  return { model }
}

const exitBuilderWithSound: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => exitBuilder({ ...input, model }),
    (model) => ({ model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }),
  )
}

const exitBuilder: ClientModule['update'] = (input) => {
  const msgCore: MsgCore = {
    t: 'screen-puzzle-builder.user-clicked-exit-button',
    userId: input.ctx.currentUserId,
  }

  return {
    model: {
      ...input.model,
      puzzleBuilderOpened: null,
    },
    msgCore: [withEventId(msgCore)],
  }
}

const saveChanges: ClientModule['update'] = ({ model, modelCore }) => {
  const puzzleBuilder = modelCore.screenPuzzleBuilder

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
  model: ModelClient
  dispatch: (msg: MsgClient) => void
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

const ViewUnsavedChangesDrawer: ClientModule['View'] = (input) => {
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

export const SaveChangesClient = {
  ViewBottomButtons,
  update,
  ViewUnsavedChangesDrawer,
}
