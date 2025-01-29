import { NotAsked, Ok } from '~/@/result'
import { APP_SOUND, playSound, sendToBackend, showToast } from '~/app/@/frontend/cmd'
import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { SurfaceConfirmation } from '~/app/@/ui/surface/confirmation/surface-confirmation'
import type { FrontendModule, ModelFrontend, MsgFrontend } from '../types'

//
//
//
//
//
//
//

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'logout-drawer-clicked-confirm': {
      return {
        model: {
          ...input.model,
          currentUser: {
            t: 'logged-out',
          },
        },
        msgCmd: [
          sendToBackend({ t: 'user-clicked-confirm-logout-button' }),
          showToast(input.ctx.t('auth.current-user-logged-out')),
          playSound(APP_SOUND.navBackwardMin),
        ],
        msgEvt: [
          {
            t: 'auth-evt.unauthenticated',
          },
        ],
      }
    }

    case 'logout-drawer-closed':
    case 'logout-drawer-clicked-cancel': {
      const currentUserId = input.model.currentUser.t === 'logged-in' ? input.model.currentUser.account.userId : null

      if (!currentUserId) {
        return {
          model: input.model,
        }
      }

      return {
        model: {
          ...input.model,
          logout: NotAsked,
          opened: null,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
  }

  switch (input.msgCmd?.c.t) {
    case 'logout': {
      return {
        model: {
          ...input.model,
          opened: 'logged-out',
        },
        msgCmd: [playSound(APP_SOUND.alertErrorSm)],
      }
    }
  }

  switch (input.msgEvt?.t) {
    case 'auth-evt.unauthenticated': {
      return {
        model: {
          ...input.model,
          logout: Ok(null),
          opened: null,
        },
      }
    }
  }

  return { model: input.model }
}

//
//
//
//
//
//
//

const View = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: BaseFrontendCtx
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  return (
    <SurfaceConfirmation
      ctx={ctx}
      ariaLabel={ctx.t('auth.logout-of-gamezilla.app')}
      open={model.opened === 'logged-out'}
      title={ctx.t('auth.logout-of-gamezilla.app')}
      body={ctx.t('auth.logout-of-gamezilla.app-body')}
      confirmText={ctx.t('auth.logout')}
      cancelText={ctx.t('app.cancel')}
      id='logout'
      confirmLoading={model.logout.t === 'loading'}
      position='bottom'
      onClose={() =>
        dispatch({
          t: 'logout-drawer-closed',
        })
      }
      onCancel={() =>
        dispatch({
          t: 'logout-drawer-clicked-cancel',
        })
      }
      onConfirm={() =>
        dispatch({
          t: 'logout-drawer-clicked-confirm',
        })
      }
    />
  )
}

export const LogoutFrontend = {
  View,
  update,
}
