import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { TextField } from '~/@/ui/text-field'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { FrontendModule } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'edit-pack-name.user-clicked-open-drawer-button':
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceOpened)] }
  }
  return { model: input.model }
}

const ViewSurface: FrontendModule['View'] = (input) => {
  const onClose = () => {
    input.dispatch({
      t: 'got-msg-space',
      c: { t: 'edit-pack-name.user-closed-drawer', userId: input.ctx.currentUser.userId },
    })
  }

  return h(SurfaceLayout, {
    ctx: input.ctx,
    ariaLabel: input.ctx.t('app.edit-name'),
    id: 'edit-pack-name',
    open: input.modelSpace.opened === 'edit-pack-name-drawer',
    onClose: onClose,
    drawer: {
      position: 'bottom',
    },
    form: {
      onSubmit: () =>
        input.dispatch({
          t: 'got-msg-space',
          c: { t: 'edit-pack-name.user-submitted-form', userId: input.ctx.currentUser.userId },
        }),
      cancelText: input.ctx.t('app.cancel'),
      submitText: input.ctx.t('app.save'),
      onCancel: onClose,
      submitLoading: false,
      cancelDisabled: false,
      submitDisabled: false,
    },
    header: {
      render: () => h(SurfaceHeader, { ctx: input.ctx, title: input.ctx.t('app.edit-name'), onClose: onClose }),
    },
    body: {
      render: () =>
        h(TextField, {
          id: 'pack-name',
          label: input.ctx.t('app.edit-name'),
          value: input.modelSpace.editPackName_draft,
          onChangeText: (packNameDraft) =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'edit-pack-name.user-inputted-draft-name',
                packNameDraft,
                userId: input.ctx.currentUser.userId,
              },
            }),
        }),
    },
  })
}

export const EditPackNameFrontend = {
  update,
  ViewSurface,
}
