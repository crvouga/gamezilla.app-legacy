import { RemoteResult, isLoading } from '~/@/result'
import { APP_SOUND, playSound, sendToBackend, showCreatedSm } from '~/app/@/frontend/cmd'
import { ConfirmationDrawer, IconDeleteForever, ListItemButton } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { FrontendModule } from '../../types'
import { MsgFrontend, MsgToBackend } from './types'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) =>
      updateFromMsg({
        ...input,
        model,
      }),
    (model) =>
      updateFromMsgCore({
        ...input,
        model,
      }),
  )
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  const { msg, model } = input

  switch (msg?.t) {
    case 'delete-forever.user-clicked-delete-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'delete-forever',
        },
        msgCmd: [playSound(APP_SOUND.alertErrorSm)],
      }
    }

    case 'delete-forever.user-closed-drawer': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: null,
        },
      }
    }

    case 'delete-forever.user-clicked-cancel-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'more',
        },
      }
    }

    case 'delete-forever.user-clicked-confirm-button': {
      return {
        model: {
          ...model,
          puzzleDeleteForeverRequest: RemoteResult.Loading,
        },
        msgCmd: [
          sendToBackend({
            t: 'delete-forever.user-confirmed',
          }),
          playSound(APP_SOUND.tap),
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

const updateFromMsgCore: FrontendModule['update'] = (input) => {
  const { msgCore, model } = input

  switch (msgCore?.t) {
    case 'user-deleted-puzzle': {
      return {
        model: {
          ...model,
          puzzleDeleteForeverRequest: msgCore.deleted,
          puzzleBuilderOpened: null,
        },
        msgCmd: [
          ...showCreatedSm<{
            MsgFrontend: MsgFrontend
            MsgToBackend: MsgToBackend
          }>(input.ctx.t('flow.puzzle-deleted')),
          {
            t: 'flow-cmd.remove-puzzles',
            puzzles: {
              [msgCore.flowPuzzleId]: msgCore.flowPuzzleId,
            },
            causedBy: input,
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

const View: FrontendModule['View'] = (input) => {
  const { model, dispatch } = input
  return (
    <>
      <ListItemButton
        icon={(input) => <IconDeleteForever {...input} />}
        label={input.ctx.t('flow.delete-forever')}
        color='danger'
        onClick={() =>
          dispatch({
            t: 'delete-forever.user-clicked-delete-button',
          })
        }
      />

      <ConfirmationDrawer
        id='delete-forever-drawer'
        open={input.model.puzzleBuilderOpened === 'delete-forever' || isLoading(model.puzzleDeleteForeverRequest)}
        onClose={() =>
          dispatch({
            t: 'delete-forever.user-closed-drawer',
          })
        }
        variant='danger'
        position='bottom'
        title={input.ctx.t('flow.delete-puzzle-forever?')}
        body={input.ctx.t('app.this-action-cannot-be-undone')}
        //
        confirmLoading={isLoading(model.puzzleDeleteForeverRequest)}
        confirmText={input.ctx.t('app.delete')}
        cancelText={input.ctx.t('app.cancel')}
        onConfirm={() =>
          dispatch({
            t: 'delete-forever.user-clicked-confirm-button',
          })
        }
        //
        cancelDisabled={isLoading(model.puzzleDeleteForeverRequest)}
        onCancel={() =>
          dispatch({
            t: 'delete-forever.user-clicked-cancel-button',
          })
        }
      />
    </>
  )
}

export const DeleteForeverFrontend: Pick<FrontendModule, 'update' | 'View'> = {
  update,
  View,
}
