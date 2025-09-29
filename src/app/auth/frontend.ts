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
import { andThen } from '../@/frontend/and-then'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { PushScreenCmd } from '../@/frontend/push-screen-cmd.$msg'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { AuthScreenHeaderCta } from './@/frontend/ui/auth-screen-header-cta'
import { AuthScreenLayout } from './@/frontend/ui/auth-screen-layout'
import { GuestSessionMappingDb } from './@/guest-session-mapping/guest-session-mapping-db'
import { GuestSessionMappingDbSync } from './@/guest-session-mapping/guest-session-mapping-sync'
import { UserAccountDb } from './@/user-account/user-account-db'
import { UserAccountDbSync } from './@/user-account/user-account-db-sync'
import { UserSessionDb } from './@/user-session/user-session-db'
import { UserSessionDbSync } from './@/user-session/user-session-db-sync'
import { CurrentUserFrontend, toCurrentUserState } from './current-user/frontend'
import { ContinueAsGuestFrontend } from './login-as-guest/frontend'
import { LoginWithSMSFrontend } from './login-with-sms'
import { LogoutFrontend } from './logout'
import { FrontendCtxModule, FrontendModule, isMsgBase, ModelFrontend, MsgFrontend, rpcContract } from './types'

const initCtx = async (input: {
  ctx: AppFrontendCtxBase
  rpc: RPC.Client<typeof rpcContract>
}): Promise<FrontendCtxModule> => {
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

const init: FrontendModule['init'] = () => {
  const model: ModelFrontend = {
    ...LogoutFrontend.init,
    ...CurrentUserFrontend.init,
    ...LoginWithSMSFrontend.init,
    ...ContinueAsGuestFrontend.init,
  }
  return {
    model,
  }
}

type Ctx = AuthFrontendCtx & {
  rpc: RPC.Client<typeof rpcContract>
}

const update = <T extends ModelFrontend>(input: {
  ctx: Ctx
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => LoginWithSMSFrontend.update({ ...input, model }),
    (model) => CurrentUserFrontend.update({ ...input, model }),
    (model) => ContinueAsGuestFrontend.update({ ...input, model }),
    (model) => LogoutFrontend.update({ ...input, model }),
  )
}

const updateFromMsg: typeof update = (input) => {
  const { msg } = input
  if (!isMsgBase(msg)) return { model: input.model }
  switch (msg?.t) {
    case 'auth_clickedLoginWithPhone': {
      return {
        model: input.model,
        msgOut: [PushScreenCmd.init({ n: 'auth', t: 'send-code' }, true)],
      }
    }
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch<MsgFrontend>([CurrentUserFrontend.subscriptions(input)])
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'auth': {
      switch (input.ctx.currentScreen.t) {
        case 'login':
          return h(ViewLoginScreen, input)
        case 'send-code':
        case 'verify-code':
          return h(LoginWithSMSFrontend.View, input)
      }
    }
    default: {
      return null
    }
  }
}

export const TEST_ID_LOGIN_SCREEN = 'auth/login-screen'

const ViewLoginScreen: FrontendModule['View'] = (input) => {
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
            onPress: () => input.dispatch({ t: 'auth_clickedLoginWithPhone' }),
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
          h(ContinueAsGuestFrontend.ViewButton, input),
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
  const currentUser = toCurrentUserState({ model: input.model, ctx: input.ctx })
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
