import { NotAsked } from '~/@/result'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { LogoutCmd } from '~/app/@/frontend/logout-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { SurfaceConfirmation } from '~/app/@/ui/surface/confirmation/surface-confirmation'
import type { FrontendModule, ModelFrontend, MsgFrontend } from './types'

const TEST_ID = {
  LOGOUT_CONFIRMATION: 'auth/logout-confirmation',
}

const init: ModelFrontend = {
  opened: null,
  request: NotAsked,
}

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'logout-drawer-clicked-confirm': {
      return {
        model: {
          ...input.model,
          opened: null,
        },
        async eff(_dispatch) {
          await input.ctx.userSessionDb.zapByClientSessionId(input.ctx.clientSessionId)
        },
      }
    }

    case 'logout-drawer-closed':
    case 'logout-drawer-clicked-cancel': {
      return {
        model: {
          ...input.model,
          opened: null,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
      }
    }
  }

  if (LogoutCmd.is(input.msgIn)) {
    return {
      model: {
        ...input.model,
        opened: 'logged-out',
      },
      msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm)],
    }
  }

  return { model: input.model }
}

const View = (input: { ctx: AppFrontendCtxBase; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  return h(SurfaceConfirmation, {
    ctx: input.ctx,
    testId: TEST_ID.LOGOUT_CONFIRMATION,
    ariaLabel: input.ctx.t('auth.logout-of-gamezilla.app'),
    open: input.model.opened === 'logged-out',
    title: input.ctx.t('auth.logout-of-gamezilla.app'),
    body: input.ctx.t('auth.logout-of-gamezilla.app-body'),
    confirmText: input.ctx.t('auth.logout'),
    cancelText: input.ctx.t('app.cancel'),
    id: 'logout',
    position: 'bottom',
    onClose: () => input.dispatch({ t: 'logout-drawer-closed' }),
    onCancel: () => input.dispatch({ t: 'logout-drawer-clicked-cancel' }),
    onConfirm: () => input.dispatch({ t: 'logout-drawer-clicked-confirm' }),
  })
}

export const LogoutFrontend = {
  init,
  View,
  update,
  TEST_ID,
}
