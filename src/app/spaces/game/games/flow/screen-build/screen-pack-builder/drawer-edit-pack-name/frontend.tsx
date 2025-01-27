import { Button, Drawer, DrawerHeader, TextField } from '~/app/@/ui'
import { FrontendModule } from '../types'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'edit-pack-name.user-clicked-open-drawer-button':
      return { model: input.model, msgCmd: [playSound(APP_SOUND.drawerOpened)] }
  }
  return { model: input.model }
}

const ViewDrawer: FrontendModule['View'] = (input) => {
  const onClose = () => {
    input.dispatch({
      t: 'got-msg-space',
      c: { t: 'edit-pack-name.user-closed-drawer', userId: input.ctx.currentUserId },
    })
  }

  return (
    <Drawer
      ctx={input.ctx}
      ariaLabel={input.ctx.t('app.edit-name')}
      id='edit-pack-name'
      open={input.modelSpace.opened === 'edit-pack-name-drawer'}
      onClose={onClose}
      position='bottom'
    >
      <DrawerHeader title={input.ctx.t('app.edit-name')} ctx={input.ctx} onClose={onClose} />
      <TextField
        id='pack-name'
        label={input.ctx.t('app.edit-name')}
        value={input.modelSpace.editPackName_draft}
        onChange={(packNameDraft) =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'edit-pack-name.user-inputted-draft-name',
              packNameDraft,
              userId: input.ctx.currentUserId,
            },
          })
        }
      />
      <div>
        <Button text={input.ctx.t('app.cancel')} onClick={onClose} />
        <Button
          text={input.ctx.t('app.save')}
          onClick={() =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'edit-pack-name.user-submitted-form',
                userId: input.ctx.currentUserId,
              },
            })
          }
        />
      </div>
    </Drawer>
  )
}

export const DrawerEditPackNameFrontend = {
  update,
  ViewDrawer,
}
