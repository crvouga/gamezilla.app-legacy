import { withEventId } from '~/@/event-sourced/event'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { Button, Drawer, DrawerHeader, TextField } from '~/app/@/ui'
import type { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { ModelSpace, MsgFrontend, MsgSpace } from '../types'

type FrontendModule = GameFrontendModule<{
  Ctx: AppFrontendCtx
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Msg: MsgFrontend
  ViewEmit: {
    close: null
    cancel: null
  }
}>

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'edit-pack-name.user-clicked-save-button':
    case 'edit-pack-name.user-closed-drawer':
    case 'edit-pack-name.user-inputted-draft-name': {
      return {
        model: input.model,
        msgSpace: [withEventId(input.msg)],
      }
    }
  }

  return { model: input.model }
}

const ViewDrawer: FrontendModule['View'] = (input) => {
  return (
    <Drawer id='edit-pack-name' open={false} onClose={() => input.emits?.close(null)} position='bottom'>
      <DrawerHeader onClose={() => input.emits?.close(null)} />
      <TextField
        id='pack-name'
        label={input.ctx.t('flow.edit-pack-name.pack-name')}
        value={input.modelSpace.draft}
        onChange={(packNameDraft) =>
          input.dispatch({
            t: 'edit-pack-name.user-inputted-draft-name',
            packNameDraft,
            userId: input.ctx.currentUserId,
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
              userId: input.ctx.currentUserId,
            })
          }
        />
      </div>
    </Drawer>
  )
}

export const EditPackNameFrontend = {
  update,
  ViewDrawer,
}
