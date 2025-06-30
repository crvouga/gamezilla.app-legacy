import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { IconUserCircle } from '~/@/ui/icon'
import { IconMobilePhone } from '~/@/ui/icon/icon-mobile-phone'
import { IconPowerOff } from '~/@/ui/icon/icon-power-off'
import { ListItemButton } from '~/@/ui/list-item-button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { UserProfile } from '../@/data/user-profile'
import { CloseStatusBarCmd } from '../@/frontend/close-status-bar-cmd.$msg'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { LogoutCmd } from '../@/frontend/logout-cmd.$msg'
import { PushScreenCmd } from '../@/frontend/push-screen-cmd.$msg'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { AuthScreenHeaderCta } from './@/frontend/ui/auth-screen-header-cta'
import { AuthScreenLayout } from './@/frontend/ui/auth-screen-layout'
import { CurrentUserFrontend, toCurrentUserState } from './current-user/frontend'
import { ContinueAsGuestFrontend } from './login-as-guest/frontend'
import { LoginWithSMSFrontend } from './login-with-sms/frontend'
import { LogoutFrontend } from './logout/frontend'
import { FrontendCtxModule, FrontendModule, ModelFrontend, MsgFrontend, rpcContract } from './types'

//
//
//
// Model
//
//
//

const initCtx = async (input: {
  ctx: AppFrontendCtxBase
  rpc: RPC.Client<typeof rpcContract>
}): Promise<FrontendCtxModule> => {
  const ctx = await AuthFrontendCtx.init({ ctx: input.ctx })
  return {
    ...input.ctx,
    ...ctx,
    rpc: input.rpc,
  }
}

const init: FrontendModule['init'] = () => {
  const model: ModelFrontend = {
    logout: LogoutFrontend.init,
    currentUser: CurrentUserFrontend.init,
    continueWithSms: LoginWithSMSFrontend.init,
    continueAsGuest: ContinueAsGuestFrontend.init,
  }
  return {
    model,
  }
}

//
//
//
// Update
//
//
//

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateSMS({ ...input, model }),
    (model) => updateCurrentUser({ ...input, model }),
    (model) => updateContinueAsGuest({ ...input, model }),
    (model) => updateLogout({ ...input, model }),
  )
}

const updateContinueAsGuest: FrontendModule['update'] = (input) => {
  const updated = ContinueAsGuestFrontend.update({
    ...input,
    model: input.model.continueAsGuest,
    msg: input.msg?.t === 'got-login-as-guest-msg' ? input.msg.c : null,
  })
  return {
    model: { ...input.model, continueAsGuest: updated.model },
    eff: Eff.tag('got-login-as-guest-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const updateLogout: FrontendModule['update'] = (input) => {
  const updated = LogoutFrontend.update({
    ...input,
    model: input.model.logout,
    msg: input.msg?.t === 'got-logout-msg' ? input.msg.c : null,
  })
  return {
    model: { ...input.model, logout: updated.model },
    eff: Eff.tag('got-logout-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const updateCurrentUser: FrontendModule['update'] = (input) => {
  const updated = CurrentUserFrontend.update({
    msgIn: input.msgIn,
    ctx: input.ctx,
    model: input.model.currentUser,
    msg: input.msg?.t === 'got-current-user-msg' ? input.msg.c : null,
  })
  return {
    model: { ...input.model, currentUser: updated.model },
    eff: Eff.tag('got-current-user-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const updateSMS: FrontendModule['update'] = (input) => {
  const updated = LoginWithSMSFrontend.update({
    ctx: input.ctx,
    model: input.model.continueWithSms,
    msg: input.msg?.t === 'got-login-with-sms-msg' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  return {
    model: { ...input.model, continueWithSms: updated.model },
    eff: Eff.tag('got-login-with-sms-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  if (!input.msg) return { model: input.model }

  switch (input.msg.t) {
    case 'clicked-login-with-phone': {
      return {
        model: input.model,
        msgOut: [PushScreenCmd.init({ n: 'auth', t: 'send-code' }, true)],
      }
    }
    case 'clicked-logout-list-item': {
      return { model: input.model, msgOut: [LogoutCmd.init(), CloseStatusBarCmd.init()] }
    }
    case 'got-login-as-guest-msg':
    case 'got-login-with-sms-msg':
    case 'got-logout-msg':
    case 'got-current-user-msg': {
      return { model: input.model }
    }
  }
}

//
//
//
//
//

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch<MsgFrontend>([
    Sub.map(
      CurrentUserFrontend.subscriptions({ ...input, ctx: input.ctx, model: input.model.currentUser }),
      (c): MsgFrontend => ({ t: 'got-current-user-msg', c }),
    ),
  ])
}

//
//
//
// View
//
//
//

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'auth': {
      switch (input.ctx.currentScreen.t) {
        case 'login': {
          return h(ViewLoginScreen, input)
        }
        case 'send-code':
        case 'verify-code': {
          return h(LoginWithSMSFrontend.View, {
            ctx: input.ctx,
            dispatch: (c) => input.dispatch({ t: 'got-login-with-sms-msg', c }),
            model: input.model.continueWithSms,
          })
        }
      }
    }
    default: {
      return null
    }
  }
}

const ViewLoginScreen: FrontendModule['View'] = (input) => {
  return h(AuthScreenLayout, {
    dataTestId: 'auth/login-screen',
    ctx: input.ctx,
    center: true,
    children: h(
      'div',
      { className: 'flex w-full flex-1 flex-col gap-6' },
      h(AuthScreenHeaderCta, { ctx: input.ctx }),

      h(Button, {
        onClick: () => input.dispatch({ t: 'clicked-login-with-phone' }),
        size: 'lg',
        dataTestId: 'auth/continue-with-phone-button',
        className: 'w-full',
        renderIconStart: (iconInput) => h(IconMobilePhone, iconInput),
        text: input.ctx.t('auth.continue-with-phone'),
      }),

      h(
        'div',
        { className: 'flex w-full items-center justify-center py-1' },
        h(Typography, {
          variant: 'body',
          className: 'text-base font-bold uppercase',
          color: 'text-secondary',
          text: input.ctx.t('auth.or'),
        }),
      ),

      h(ContinueAsGuestFrontend.ViewButton, {
        ctx: input.ctx,
        dispatch: (c) => input.dispatch({ t: 'got-login-as-guest-msg', c }),
        model: input.model.continueAsGuest,
      }),
    ),
  })
}

const ViewModals = (input: { ctx: AppFrontendCtxBase; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  return h(LogoutFrontend.View, {
    ctx: input.ctx,
    dispatch: (c) => input.dispatch({ t: 'got-logout-msg', c }),
    model: input.model.logout,
  })
}

const ViewCurrentUserListItem = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtxBase
  dispatch: (msg: MsgFrontend) => void
}) => {
  const currentUser = toCurrentUserState({ model: input.model.currentUser, ctx: input.ctx })
  switch (currentUser.t) {
    case 'loading': {
      return h(ListItemButton, {
        icon: (input) => h(IconUserCircle, input),
        label: input.ctx.t('app.add'),
      })
    }
    case 'logged-out': {
      return h(ListItemButton, {
        icon: (input) => h(IconUserCircle, input),
        label: input.ctx.t('app.add'),
      })
    }
    case 'logged-in': {
      return h(ListItemButton, {
        icon: (input) => h(Avatar, { src: UserProfile.toAvatarUrl(currentUser.userProfile), ...input }),
        label: TranslatedText.of(`${input.ctx.t('auth.logged-in-as')} ${currentUser.userProfile.username}`),
      })
    }
  }
}

export const ViewLogoutIcon = (input: { model: ModelFrontend; ctx: AppFrontendCtxBase; className: string }) => {
  const currentUser = toCurrentUserState({ model: input.model.currentUser, ctx: input.ctx })
  switch (currentUser.t) {
    case 'loading':
    case 'logged-out': {
      return null
    }
    case 'logged-in': {
      return h(IconPowerOff, { className: input.className })
    }
  }
}

const ViewLogoutListItem = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtxBase
  dispatch: (msg: MsgFrontend) => void
}) => {
  const currentUser = toCurrentUserState({ model: input.model.currentUser, ctx: input.ctx })

  switch (currentUser.t) {
    case 'loading':
    case 'logged-out': {
      return null
    }
    case 'logged-in': {
      return h(ListItemButton, {
        onClick: () => input.dispatch({ t: 'clicked-logout-list-item' }),
        icon: (input) => h(IconPowerOff, input),
        label: input.ctx.t('auth.logout'),
        end: () =>
          h(Typography, {
            variant: 'caption',
            text: TranslatedText.of(currentUser.userProfile.username),
          }),
      })
    }
  }
}

export const AuthFrontend = {
  init,
  update,
  subscriptions,
  View,
  ViewLogoutListItem,
  ViewModals,
  ViewCurrentUserListItem,
  ViewLogoutIcon,
  initCtx,
}
