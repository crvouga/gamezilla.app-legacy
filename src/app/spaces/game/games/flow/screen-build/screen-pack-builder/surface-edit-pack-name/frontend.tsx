import { TextField } from '~/@/ui'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { FrontendModule } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'edit-pack-name.user-clicked-open-drawer-button':
      return { model: input.model, msgCmd: [playSound(APP_SOUND.drawerOpened)] }
  }
  return { model: input.model }
}

const ViewSurface: FrontendModule['View'] = (input) => {
  const onClose = () => {
    input.dispatch({
      t: 'got-msg-space',
      c: { t: 'edit-pack-name.user-closed-drawer', userId: input.ctx.currentUserId },
    })
  }

  return (
    <SurfaceLayout
      ctx={input.ctx}
      ariaLabel={input.ctx.t('app.edit-name')}
      id='edit-pack-name'
      open={input.modelSpace.opened === 'edit-pack-name-drawer'}
      onClose={onClose}
      position='bottom'
      form={{
        onSubmit: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'edit-pack-name.user-submitted-form', userId: input.ctx.currentUserId },
          }),
        cancelText: input.ctx.t('app.cancel'),
        submitText: input.ctx.t('app.save'),
        onCancel: onClose,
        submitLoading: false,
        cancelDisabled: false,
        submitDisabled: false,
      }}
      header={{
        title: input.ctx.t('app.edit-name'),
        onClose: onClose,
      }}
      body={{
        render: () => (
          <TextField
            id='pack-name'
            label={input.ctx.t('app.edit-name')}
            value={input.modelSpace.editPackName_draft}
            onChange={(packNameDraft) =>
              input.dispatch({
                t: 'got-msg-space',
                c: { t: 'edit-pack-name.user-inputted-draft-name', packNameDraft, userId: input.ctx.currentUserId },
              })
            }
          />
        ),
      }}
    />
  )
}

export const EditPackNameFrontend = {
  update,
  ViewSurface,
}
