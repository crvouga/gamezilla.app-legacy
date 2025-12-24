import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { IconMobilePhone, IconUserCircle } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { UserProfile } from '../@/data/user-profile'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { pushScreen } from '~/app/frontend/current-screen/current-screen-cmd'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { AuthScreenHeaderCta } from './@/frontend/ui/auth-screen-header-cta'
import { AuthScreenLayout } from './@/frontend/ui/auth-screen-layout'
import { GuestSessionMappingDb } from './@/guest-session-mapping/guest-session-mapping-db'
import { GuestSessionMappingDbSync } from './@/guest-session-mapping/guest-session-mapping-sync'
import { UserAccountDb } from './@/user-account/user-account-db'
import { UserAccountDbSync } from './@/user-account/user-account-db-sync'
import { UserSessionDb } from './@/user-session/user-session-db'
import { UserSessionDbSync } from './@/user-session/user-session-db-sync'
import { CurrentUserFrontend } from './current-user'
import { toCurrentUserState } from './current-user/frontend'
import { ContinueAsGuestFrontend } from './login-as-guest'
import { LoginWithSMSFrontend } from './login-with-sms'
import { LogoutFrontend } from './logout'
import { ModelFrontend, MsgFrontend, rpcContract } from './types'

type Ctx = AuthFrontendCtx & {
  rpc: RPC.Client<typeof rpcContract>
}

const initCtx = async (input: { ctx: AppFrontendCtxBase; rpc: RPC.Client<typeof rpcContract> }): Promise<Ctx> => {
  const guestSessionMappingDb = GuestSessionMappingDb({ ...input.ctx, t: 'sql' })
  const userSessionDb = await UserSessionDb.init({ ...input.ctx, t: 'sql' })
  const userAccountDb = await UserAccountDb.init({ ...input.ctx, t: 'sql' })
  input.ctx.syncEngine.registerSync(UserAccountDbSync({ logger: input.ctx.logger, userAccountDb }))
  input.ctx.syncEngine.registerSync(UserSessionDbSync({ logger: input.ctx.logger, userSessionDb }))
  input.ctx.syncEngine.registerSync(GuestSessionMappingDbSync({ logger: input.ctx.logger, guestSessionMappingDb }))

  return {
    ...input.ctx,
    guestSessionMappingDb,
    userSessionDb,
    userAccountDb,
    rpc: input.rpc,
  }
}

export const init = (input: { ctx: Ctx }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const currentUser = CurrentUserFrontend.init(input)
  const logout = LogoutFrontend.init(input)
  const loginWithSms = LoginWithSMSFrontend.init(input)
  const continueAsGuest = ContinueAsGuestFrontend.init(input)
  return {
    model: {
      currentUser: currentUser.model,
      logout: logout.model,
      loginWithSms: loginWithSms.model,
      continueAsGuest: continueAsGuest.model,
    },
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('currentUser', currentUser.eff),
      Eff.tag('logout', logout.eff),
      Eff.tag('loginWithSms', loginWithSms.eff),
      Eff.tag('continueAsGuest', continueAsGuest.eff),
    ]),
  }
}

const update = (input: {
  ctx: Ctx
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'auth_clickedLoginWithPhone': {
      return { model: input.model, eff: pushScreen({ n: 'auth', t: 'auth_sendCode' }, true) }
    }
    case 'loginWithSms': {
      const updated = LoginWithSMSFrontend.update({
        ctx: input.ctx,
        model: input.model.loginWithSms,
        msg: input.msg.c,
      })
      return {
        model: {
          ...input.model,
          loginWithSms: updated.model,
        },
        eff: Eff.tag('loginWithSms', updated.eff),
      }
    }
    case 'logout': {
      const updated = LogoutFrontend.update({
        ctx: input.ctx,
        model: input.model.logout,
        msg: input.msg.c,
      })
      return {
        model: {
          ...input.model,
          logout: updated.model,
        },
        eff: Eff.tag('logout', updated.eff),
      }
    }
    case 'currentUser': {
      const updated = CurrentUserFrontend.update({
        ctx: input.ctx,
        model: input.model.currentUser,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, currentUser: updated.model },
        eff: Eff.tag('currentUser', updated.eff),
      }
    }
    case 'continueAsGuest': {
      const updated = ContinueAsGuestFrontend.update({
        ctx: input.ctx,
        model: input.model.continueAsGuest,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, continueAsGuest: updated.model },
        eff: Eff.tag('continueAsGuest', updated.eff),
      }
    }
    default: {
      return { model: input.model }
    }
  }
}

const subscriptions = (input: { ctx: Ctx; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([
    //
    Sub.map(CurrentUserFrontend.subscriptions({ ctx: input.ctx, model: input.model.currentUser }), (c) => ({
      t: 'currentUser',
      c,
    })),
  ])
}

const View = (input: { ctx: Ctx; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  switch (input.ctx.currentScreen.t) {
    case 'auth_login':
      return h(ViewLoginScreen, input)
    case 'auth_sendCode':
    case 'auth_verifyCode':
      return h(LoginWithSMSFrontend.View, {
        ctx: input.ctx,
        model: input.model.loginWithSms,
        dispatch: (c) => input.dispatch({ t: 'loginWithSms', c }),
      })
    default:
      return null
  }
}

export const TEST_ID_LOGIN_SCREEN = 'auth/login-screen'

const ViewLoginScreen: typeof View = (input) => {
  return h(
    AuthScreenLayout,
    {
      testId: TEST_ID_LOGIN_SCREEN,
      ctx: input.ctx,
      center: true,
    },
    [
      h(Box, { style: sx({ flexDirection: 'col', width: 'full', gap: 8 }) }, [
        h(AuthScreenHeaderCta, { ctx: input.ctx }),
        h(Box, { style: sx({ flexDirection: 'col', width: 'full' }) }, [
          h(Button, {
            onPress: () => input.dispatch({ n: 'auth', t: 'auth_clickedLoginWithPhone' }),
            size: 'lg',
            width: 'full',
            renderIconStart: (iconInput) => h(IconMobilePhone, iconInput),
            text: input.ctx.t('auth.continue-with-phone'),
          }),

          h(
            Box,
            {
              style: sx({
                flexDirection: 'row',
                width: 'full',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
              }),
            },
            [
              h(Typography, {
                variant: 'body',
                style: sx({ fontSize: 'sm', fontWeight: 'bold' }),
                text: input.ctx.t('auth.or'),
              }),
            ],
          ),
          h(ContinueAsGuestFrontend.ViewButton, {
            ctx: input.ctx,
            model: input.model.continueAsGuest,
            dispatch: (c) => input.dispatch({ t: 'continueAsGuest', c }),
          }),
        ]),
      ]),
    ],
  )
}

const ViewCurrentUserMenuItem = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtxBase
  dispatch: (msg: MsgFrontend) => void
}) => {
  const currentUser = toCurrentUserState({ ctx: input.ctx, model: input.model.currentUser })
  switch (currentUser.t) {
    case 'loading': {
      return h(MenuItem, {
        renderIcon: (input) => h(IconUserCircle, input),
        primary: input.ctx.t('app.add'),
      })
    }
    case 'logged-out': {
      return h(MenuItem, {
        renderIcon: (input) => h(IconUserCircle, input),
        primary: input.ctx.t('app.add'),
      })
    }
    case 'logged-in': {
      return h(MenuItem, {
        renderIcon: (input) => h(Avatar, { src: UserProfile.toAvatarUrl(currentUser.userProfile), ...input }),
        primary: TranslatedText.of(`${input.ctx.t('auth.logged-in-as')} ${currentUser.userProfile.username}`),
      })
    }
  }
}

export const AuthFrontend = {
  init,
  update,
  subscriptions,
  View,
  ViewCurrentUserMenuItem,
  initCtx,
}
