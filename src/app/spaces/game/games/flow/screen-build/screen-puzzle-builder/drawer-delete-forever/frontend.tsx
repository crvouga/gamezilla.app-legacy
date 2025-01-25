import { withEventId } from '~/@/event-sourced/event'
import { Ok, RemoteResult, isLoading } from '~/@/result'
import { APP_SOUND, playSound, showCreatedSm } from '~/app/@/frontend/cmd'
import { ConfirmationFormDrawer, IconDeleteForever, ListItemButton } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { FlowFrontendCmdRoot } from '../../../@/frontend/cmd-root'
import type { FrontendModule } from '../../types'
import { MsgFrontend, MsgToBackend } from './types'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
  )
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'delete-forever.user-clicked-delete-button': {
      return {
        model: { ...input.model, puzzleBuilderOpened: 'delete-forever' },
        msgCmd: [playSound(APP_SOUND.alertErrorSm)],
      }
    }

    case 'delete-forever.user-closed-drawer': {
      return {
        model: { ...input.model, puzzleBuilderOpened: null },
        msgCmd: [playSound(APP_SOUND.drawerClosed)],
      }
    }

    case 'delete-forever.user-clicked-cancel-button': {
      return {
        model: { ...input.model, puzzleBuilderOpened: 'more' },
        msgCmd: [playSound(APP_SOUND.drawerClosed)],
      }
    }

    case 'delete-forever.user-clicked-confirm-button': {
      return {
        model: { ...input.model, puzzleDeleteForeverRequest: RemoteResult.Loading },
        msgCmd: [playSound(APP_SOUND.tap)],
        async eff(dispatch) {
          const puzzleId = input.modelSpace.screenPuzzleBuilder?.puzzle.id ?? null
          const deletedByUserId = input.ctx.currentUserId

          const deleted = puzzleId ? await input.ctx.puzzleDb.zap({ deletedByUserId, puzzleId }) : Ok(null)

          dispatch({
            t: 'delete-forever.db-zapped-puzzle',
            deleted,
            puzzleId,
            deletedByUserId,
          })
        },
      }
    }

    case 'delete-forever.db-zapped-puzzle': {
      return {
        model: { ...input.model, puzzleDeleteForeverRequest: input.msg.deleted },
        msgSpace: [withEventId({ ...input.msg, t: 'user-deleted-puzzle' })],
      }
    }

    default: {
      return { model: input.model }
    }
  }
}

type WireTypes = { MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }

const updateFromMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-deleted-puzzle': {
      return {
        model: {
          ...input.model,
          puzzleDeleteForeverRequest: input.msgSpace.deleted,
          puzzleBuilderOpened: null,
        },
        msgCmd: [
          FlowFrontendCmdRoot.removePuzzles(
            input.msgSpace.puzzleId ? { [input.msgSpace.puzzleId]: input.msgSpace.puzzleId } : {},
            input,
          ),
          ...showCreatedSm<WireTypes>(input.ctx.t('flow.puzzle-deleted')),
        ],
      }
    }

    default: {
      return { model: input.model }
    }
  }
}

const View: FrontendModule['View'] = (input) => {
  return (
    <>
      <ListItemButton
        icon={(input) => <IconDeleteForever {...input} />}
        label={input.ctx.t('flow.delete-forever')}
        color='danger'
        onClick={() => input.dispatch({ t: 'delete-forever.user-clicked-delete-button' })}
      />

      <ConfirmationFormDrawer
        ctx={input.ctx}
        ariaLabel={input.ctx.t('flow.delete-puzzle-forever?')}
        id='delete-forever-drawer'
        open={input.model.puzzleBuilderOpened === 'delete-forever' || isLoading(input.model.puzzleDeleteForeverRequest)}
        onClose={() => input.dispatch({ t: 'delete-forever.user-closed-drawer' })}
        variant='danger'
        position='bottom'
        title={input.ctx.t('flow.delete-puzzle-forever?')}
        body={input.ctx.t('app.this-action-cannot-be-undone')}
        confirmLoading={isLoading(input.model.puzzleDeleteForeverRequest)}
        confirmText={input.ctx.t('app.delete')}
        cancelText={input.ctx.t('app.cancel')}
        onConfirm={() => input.dispatch({ t: 'delete-forever.user-clicked-confirm-button' })}
        cancelDisabled={isLoading(input.model.puzzleDeleteForeverRequest)}
        onCancel={() => input.dispatch({ t: 'delete-forever.user-clicked-cancel-button' })}
      />
    </>
  )
}

export const DeleteForeverFrontend = {
  update,
  View,
}
