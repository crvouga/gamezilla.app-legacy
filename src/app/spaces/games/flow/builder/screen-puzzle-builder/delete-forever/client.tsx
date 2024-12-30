import { RemoteResult, isLoading } from '~/@/result'
import { APP_SOUND, playSound, sendToServer, showCreatedSm } from '~/app/@/client/client-cmd'
import { ConfirmationDrawer, IconDeleteForever, ListItemButton } from '~/app/@/ui'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import type { ClientModule } from '../../types'
import { MsgClient, MsgToServer } from './types'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) =>
      updateFromMsg({
        ...input,
        model
      }),
    (model) =>
      updateFromMsgCore({
        ...input,
        model
      })
  )
}

const updateFromMsg: ClientModule['update'] = (input) => {
  const { msg, model } = input

  switch (msg?.t) {
    case 'delete-forever.user-clicked-delete-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'delete-forever'
        },
        msgCmd: [playSound(APP_SOUND.alertErrorSm)]
      }
    }

    case 'delete-forever.user-closed-drawer': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: null
        }
      }
    }

    case 'delete-forever.user-clicked-cancel-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'more'
        }
      }
    }

    case 'delete-forever.user-clicked-confirm-button': {
      return {
        model: {
          ...model,
          puzzleDeleteForeverRequest: RemoteResult.Loading
        },
        msgCmd: [
          sendToServer({
            t: 'delete-forever.user-confirmed'
          }),
          playSound(APP_SOUND.tap)
        ]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const updateFromMsgCore: ClientModule['update'] = (input) => {
  const { msgCore, model } = input

  switch (msgCore?.t) {
    case 'user-deleted-puzzle': {
      return {
        model: {
          ...model,
          puzzleDeleteForeverRequest: msgCore.deleted,
          puzzleBuilderOpened: null
        },
        msgCmd: [
          ...showCreatedSm<{
            MsgClient: MsgClient
            MsgToServer: MsgToServer
          }>(input.ctx.t('flow.puzzle-deleted')),
          {
            t: 'flow.remove-puzzles',
            puzzles: {
              [msgCore.flowPuzzleId]: msgCore.flowPuzzleId
            },
            causedBy: input
          }
        ]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const View: ClientModule['View'] = (input) => {
  const { model, dispatch } = input
  return (
    <>
      <ListItemButton
        icon={(input) => <IconDeleteForever {...input} />}
        label={input.ctx.t('flow.delete-forever')}
        color='danger'
        onClick={() =>
          dispatch({
            t: 'delete-forever.user-clicked-delete-button'
          })
        }
      />

      <ConfirmationDrawer
        id='delete-forever-drawer'
        open={input.model.puzzleBuilderOpened === 'delete-forever' || isLoading(model.puzzleDeleteForeverRequest)}
        onClose={() =>
          dispatch({
            t: 'delete-forever.user-closed-drawer'
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
            t: 'delete-forever.user-clicked-confirm-button'
          })
        }
        //
        cancelDisabled={isLoading(model.puzzleDeleteForeverRequest)}
        onCancel={() =>
          dispatch({
            t: 'delete-forever.user-clicked-cancel-button'
          })
        }
      />
    </>
  )
}

export const DeleteForeverClient: Pick<ClientModule, 'update' | 'View'> = {
  update,
  View
}
