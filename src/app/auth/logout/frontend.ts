import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
import { isAnyMsg } from '~/@/msg/msg'
import { NotAsked, RemoteResult } from '~/@/result'
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
import { AuthFrontendCtx } from '../@/frontend/ctx'

export type ModelFrontend = {
  logout_request: RemoteResult<string, null>
  logout_opened: 'logged-out' | null
}

export const init: ModelFrontend = {
  logout_opened: null,
  logout_request: NotAsked,
}

export type Msg =
  | { t: 'logout_clickedLogoutMenuItem' }
  | { t: 'logout_logoutDrawerClosed' }
  | { t: 'logout_drawerClickedCancel' }
  | { t: 'logout_drawerClickedConfirm' }

export const isMsg = (msg: unknown): msg is Msg => {
  return isAnyMsg(msg) && msg.t.startsWith('logout_')
}

export const update = <T extends ModelFrontend>(input: {
  ctx: AuthFrontendCtx
  model: T
  msg?: unknown
}): {
  model: T
  msgOut?: unknown[]
  eff?: Eff<Msg>
} => {
  if (!isMsg(input.msg)) return { model: input.model }

  switch (input.msg?.t) {
    case 'logout_clickedLogoutMenuItem': {
      return {
        model: {
          ...input.model,
          logout_opened: 'logged-out',
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm)],
      }
    }

    case 'logout_drawerClickedConfirm': {
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

    case 'logout_logoutDrawerClosed':
    case 'logout_drawerClickedCancel': {
      return {
        model: {
          ...input.model,
          logout_opened: null,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
      }
    }
  }
}

export const TEST_ID_LOGOUT_CONFIRMATION = 'auth/logout-confirmation'

const ViewConfirmation = (input: { ctx: AppFrontendCtxBase; model: ModelFrontend; dispatch: (msg: Msg) => void }) => {
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
    onClose: () => input.dispatch({ t: 'logout_logoutDrawerClosed' }),
    onCancel: () => input.dispatch({ t: 'logout_drawerClickedCancel' }),
    onConfirm: () => input.dispatch({ t: 'logout_drawerClickedConfirm' }),
  })
}

export const ViewMenuItem = (props: {
  ctx: AppFrontendCtxBase
  model: ModelFrontend
  dispatch: (msg: Msg) => void
}) => {
  const { currentUserState } = props.ctx
  switch (currentUserState.t) {
    case 'loading':
    case 'logged-out': {
      return null
    }
    case 'logged-in': {
      return h(Frag, {}, [
        h(MenuItem, {
          onPress: () => props.dispatch({ t: 'logout_clickedLogoutMenuItem' }),
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
