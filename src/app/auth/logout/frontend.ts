import { TranslatedText } from '~/@/l18n'
import { NotAsked } from '~/@/result'
import { UnixMs } from '~/@/time/unix-ms'
import { IconPowerOff } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Frag } from '~/@/vdom/primitives/frag'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { FloatingConfirmation } from '~/app/@/ui/floating/confirmation/floating-confirmation'
import type { FrontendModule, ModelFrontend, MsgFrontend } from './types'

const init: ModelFrontend = {
  logout_opened: null,
  logout_request: NotAsked,
}

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'clicked-logout-menu-item': {
      return {
        model: {
          ...input.model,
          logout_opened: 'logged-out',
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm)],
      }
    }

    case 'logout-drawer-clicked-confirm': {
      return {
        model: {
          ...input.model,
          logout_opened: null,
        },
        async eff(_dispatch) {
          await input.ctx.userSessionDb.update({
            where: { op: '=', column: 'clientSessionId', value: input.ctx.clientSessionId },
            set: { endedAt: UnixMs.now() },
            limit: 1,
            offset: 0,
          })
        },
      }
    }

    case 'logout-drawer-closed':
    case 'logout-drawer-clicked-cancel': {
      return {
        model: {
          ...input.model,
          logout_opened: null,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
      }
    }
  }

  return { model: input.model }
}

export const TEST_ID_LOGOUT_CONFIRMATION = 'auth/logout-confirmation'

const ViewConfirmation = (input: {
  ctx: AppFrontendCtxBase
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  return h(FloatingConfirmation, {
    ctx: input.ctx,
    testId: TEST_ID_LOGOUT_CONFIRMATION,
    ariaLabel: input.ctx.t('auth.logout-of-gamezilla.app'),
    open: input.model.logout_opened === 'logged-out',
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

const ViewMenuItem: FrontendModule['View'] = (props) => {
  const { currentUserState } = props.ctx
  switch (currentUserState.t) {
    case 'loading':
    case 'logged-out': {
      return null
    }
    case 'logged-in': {
      return h(Frag, {}, [
        h(MenuItem, {
          onPress: () => props.dispatch({ t: 'clicked-logout-menu-item' }),
          renderIcon: (iconProps) => h(IconPowerOff, iconProps),
          primary: props.ctx.t('auth.logout'),
          renderEnd: (endProps) =>
            h(Typography, {
              ...endProps,
              variant: 'caption',
              text: TranslatedText.of(currentUserState.userProfile.username),
            }),
        }),
        h(ViewConfirmation, props),
      ])
    }
  }
}

export const LogoutFrontend = {
  init,
  ViewMenuItem,
  update,
}
