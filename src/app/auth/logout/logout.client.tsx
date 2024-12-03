import { Ok, NotAsked } from '@/core'
import { APP_SOUND, type BaseClientCtx, playSound, sendToServer, showToast } from 'app/@/client'
import { ConfirmationDrawer } from 'app/@/ui'
import type { ClientModule, ModelClient, MsgClient } from '../types'

//
//
//
//
//
//
//

const update: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'logout-drawer.clicked-confirm': {
      return {
        model: {
          ...input.model,
          currentUser: {
            t: 'logged-out'
          }
        },
        msgCmd: [
          sendToServer({
            t: 'logout'
          }),
          showToast(input.ctx.t('auth.current-user-logged-out')),
          playSound(APP_SOUND.navBackwardMin)
        ],
        msgEvt: [
          {
            t: 'auth/unauthenticated'
          }
        ]
      }
    }

    case 'logout-drawer.closed':
    case 'logout-drawer.clicked-cancel': {
      const currentUserId = input.model.currentUser.t === 'logged-in' ? input.model.currentUser.account.userId : null

      if (!currentUserId) {
        return {
          model: input.model
        }
      }

      return {
        model: {
          ...input.model,
          logout: NotAsked,
          opened: null
        },
        msgCmd: [playSound(APP_SOUND.tap)]
      }
    }
  }

  switch (input.msgCmd?.c.t) {
    case 'logout': {
      return {
        model: {
          ...input.model,
          opened: 'logged-out'
        },
        msgCmd: [playSound(APP_SOUND.alertErrorSm)]
      }
    }
  }

  switch (input.msgEvt?.t) {
    case 'auth/unauthenticated': {
      return {
        model: {
          ...input.model,
          logout: Ok(null),
          opened: null
        }
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
  ctx
}: {
  ctx: BaseClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  return (
    <ConfirmationDrawer
      open={model.opened === 'logged-out'}
      title={ctx.t('auth.logout-of-gamezill.app')}
      body={ctx.t('auth.logout-of-gamezill.app-body')}
      confirmText={ctx.t('auth.logout')}
      cancelText={ctx.t('app.cancel')}
      id='logout'
      confirmLoading={model.logout.t === 'loading'}
      position='bottom'
      onClose={() =>
        dispatch({
          t: 'logout-drawer.closed'
        })
      }
      onCancel={() =>
        dispatch({
          t: 'logout-drawer.clicked-cancel'
        })
      }
      onConfirm={() =>
        dispatch({
          t: 'logout-drawer.clicked-confirm'
        })
      }
    />
  )
}

export const LogoutClient = {
  View,
  update
}
