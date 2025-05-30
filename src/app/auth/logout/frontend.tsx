import { NotAsked } from '~/@/result'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { LogoutCmd } from '~/app/@/frontend/logout-cmd'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd'
import { SurfaceConfirmation } from '~/app/@/ui/surface/confirmation/surface-confirmation'
import type { FrontendModule, ModelFrontend, MsgFrontend } from './types'

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
        msgOut: [
          ShowToastCmd.init(input.ctx.t('auth.current-user-logged-out')),
          PlaySoundCmd.init(APP_SOUND.navBackwardMin),
        ],
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

const View = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: AppFrontendCtxBase
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
      position='bottom'
      onClose={() => dispatch({ t: 'logout-drawer-closed' })}
      onCancel={() => dispatch({ t: 'logout-drawer-clicked-cancel' })}
      onConfirm={() => dispatch({ t: 'logout-drawer-clicked-confirm' })}
    />
  )
}

export const LogoutFrontend = {
  init,
  View,
  update,
}
