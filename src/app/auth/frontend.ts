import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { IconMobilePhone, IconUserCircle } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { sx } from '~/@/vdom/style/sx'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { UserProfile } from '../@/data/user-profile'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { PushScreenCmd } from '../@/frontend/push-screen-cmd.$msg'
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
  const guestSessionMappingDb = GuestSessionMappingDb({
    logger: input.ctx.logger,
    t: 'sql',
    sqlDb: input.ctx.sqlDb,
    migrationPolicy: input.ctx.migrationPolicy,
  })

  const userSessionDb = await UserSessionDb({
    t: 'sql',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })

  const userAccountDb = UserAccountDb({
    t: 'sql',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })

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
      h(
        Box,
        {
          style: sx({
            flexDirection: 'col',
            width: 'full',
            gap: 8,
          }),
        },
        [
          h(AuthScreenHeaderCta, { ctx: input.ctx }),

          h(Box, { style: sx({ flexDirection: 'col', width: 'full' }) }, [
            h(Button, {
              onPress: () => input.dispatch({ t: 'clicked-login-with-phone' }),
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
                  style: sx({
                    fontSize: 'sm',
                    fontWeight: 'bold',
                  }),
                  text: input.ctx.t('auth.or'),
                }),
              ],
            ),

            h(ContinueAsGuestFrontend.ViewButton, {
              ctx: input.ctx,
              dispatch: (c) => input.dispatch({ t: 'got-login-as-guest-msg', c }),
              model: input.model.continueAsGuest,
            }),
          ]),
        ],
      ),
    ],
  )
}

const ViewCurrentUserMenuItem = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtxBase
  dispatch: (msg: MsgFrontend) => void
}) => {
  const currentUser = toCurrentUserState({ model: input.model.currentUser, ctx: input.ctx })
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
