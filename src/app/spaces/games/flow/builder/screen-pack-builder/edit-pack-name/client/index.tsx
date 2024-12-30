import { withEventId } from '~/@/event-sourced/event'
import { isErr } from '~/@/result'
import { showErrSm } from '~/app/@/client/client-cmd'
import { AppClientCtx } from '~/app/@/client/client-ctx'
import { Button, Drawer, DrawerHeader, TextField } from '~/app/@/ui'
import type { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import type { ModelCore, MsgClient, MsgCore } from '../types'

type ClientModule = GameClientModule<{
  Ctx: AppClientCtx
  ModelCore: ModelCore
  MsgCore: MsgCore
  Msg: MsgClient
  ViewEmit: {
    close: null
    cancel: null
  }
}>

const update: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'edit-pack-name.user-clicked-save-button':
    case 'edit-pack-name.user-closed-drawer':
    case 'edit-pack-name.user-inputted-draft-name': {
      return {
        model: input.model,
        msgCore: [withEventId(input.msg)]
      }
    }
  }

  switch (input.msgCore?.t) {
    case 'edit-pack-name.server-persisted-pack': {
      if (isErr(input.msgCore.result)) {
        return {
          model: input.model,
          msgCmd: showErrSm(input.ctx.t('app.something-went-wrong'))
        }
      }
      return {
        model: input.model
      }
    }
  }

  return { model: input.model }
}

const ViewDrawer: ClientModule['View'] = (input) => {
  return (
    <Drawer id='edit-pack-name' open={false} onClose={() => input.emits?.close(null)} position='bottom'>
      <DrawerHeader onClose={() => input.emits?.close(null)} />
      <TextField
        id='pack-name'
        label={input.ctx.t('flow.edit-pack-name.pack-name')}
        value={input.modelCore.draft}
        onChange={(packNameDraft) =>
          input.dispatch({
            t: 'edit-pack-name.user-inputted-draft-name',
            packNameDraft,
            userId: input.ctx.currentUserId
          })
        }
      />
      <div>
        <Button text={input.ctx.t('app.cancel')} onClick={() => input.emits?.cancel(null)} />
        <Button
          text={input.ctx.t('app.save')}
          onClick={() =>
            input.dispatch({
              t: 'edit-pack-name.user-clicked-save-button',
              userId: input.ctx.currentUserId
            })
          }
        />
      </div>
    </Drawer>
  )
}

export const EditPackNameClient = {
  update,
  ViewDrawer
}
