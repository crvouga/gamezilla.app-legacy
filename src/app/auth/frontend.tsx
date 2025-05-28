import { Eff } from '~/@/eff'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Button } from '~/@/ui/button'
import { IconMobilePhone } from '~/@/ui/icon/icon-mobile-phone'
import { Typography } from '~/@/ui/typography'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { APP_SOUND, AppFrontendCmd, playSound, pushScreen } from '~/app/@/frontend/cmd'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { AuthScreenHeaderCta } from './@/frontend/ui/auth-screen-header-cta'
import { AuthScreenLayout } from './@/frontend/ui/auth-screen-layout'
import { CurrentUserFrontend } from './current-user/frontend'
import { ContinueAsGuestFrontend } from './login-as-guest/frontend'
import { LoginWithSMSFrontend } from './login-with-sms/frontend'
import { LogoutFrontend } from './logout/frontend'
import type { FrontendCtx, FrontendModule, ModelFrontend, MsgFrontend, rpcContract } from './types'

//
//
//
// Model
//
//
//

const initCtx = async (input: {
  ctx: AppFrontendCtxBase & { rpc: { auth: RPC.Client<typeof rpcContract> } }
}): Promise<FrontendCtx> => {
  const authCtx = await AuthFrontendCtx.init({ ctx: input.ctx })
  return {
    ...input.ctx,
    ...authCtx,
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
    msgCmd: AppFrontendCmd.tag('got-login-as-guest-msg', updated.msgCmd),
    eff: Eff.tag('got-login-as-guest-msg', updated.eff),
    msgEvt: [],
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
    msgCmd: AppFrontendCmd.tag('got-logout-msg', updated.msgCmd),
    eff: Eff.tag('got-logout-msg', updated.eff),
    msgEvt: [],
  }
}

const updateCurrentUser: FrontendModule['update'] = (input) => {
  const updated = CurrentUserFrontend.update({
    ctx: { ...input.ctx, rpc: input.ctx.rpc.auth.currentUser },
    model: input.model.currentUser,
    msgCmd: null,
    msgEvt: null,
    msgBackend: null,
    msg: input.msg?.t === 'got-current-user-msg' ? input.msg.c : null,
  })
  return {
    model: { ...input.model, currentUser: updated.model },
    msgCmd: AppFrontendCmd.tag('got-current-user-msg', updated.msgCmd),
    eff: Eff.tag('got-current-user-msg', updated.eff),
    msgEvt: [],
  }
}

const updateSMS: FrontendModule['update'] = (input) => {
  const updated = LoginWithSMSFrontend.update({
    ctx: { ...input.ctx, rpc: input.ctx.rpc.auth.sms },
    model: input.model.continueWithSms,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: null,
    msg: input.msg?.t === 'got-login-with-sms-msg' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, continueWithSms: updated.model },
    msgCmd: AppFrontendCmd.tag('got-login-with-sms-msg', updated.msgCmd),
    eff: Eff.tag('got-login-with-sms-msg', updated.eff),
    msgEvt: updated.msgEvt,
    msgOut: updated.msgOut,
  }
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'user-clicked-login-with-phone': {
      return {
        model: input.model,
        msgCmd: [pushScreen({ n: 'auth-login', t: 'login-sms-request' }), playSound(APP_SOUND.navForwardMin)],
      }
    }

    default: {
      return {
        model: input.model,
      }
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
    Sub.tag(
      'got-current-user-msg',
      CurrentUserFrontend.subscriptions({
        ...input,
        ctx: { ...input.ctx, rpc: input.ctx.rpc.auth.currentUser },
        model: input.model.currentUser,
      }),
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
    case 'auth-login': {
      switch (input.ctx.currentScreen.t) {
        case 'login': {
          return <ViewLoginScreen {...input} />
        }
        case 'login-sms-request':
        case 'login-sms-verify': {
          return (
            <LoginWithSMSFrontend.View
              ctx={{ ...input.ctx, rpc: input.ctx.rpc.auth.sms }}
              dispatch={(c) => input.dispatch({ t: 'got-login-with-sms-msg', c })}
              model={input.model.continueWithSms}
            />
          )
        }
        case 'login-email-send-link': {
          return null
        }
      }
    }
    default: {
      return null
    }
  }
}

const ViewLoginScreen: FrontendModule['View'] = (input) => {
  return (
    <AuthScreenLayout ctx={input.ctx} center={true} navBar={null}>
      <div className='flex w-full flex-1 flex-col gap-6'>
        <AuthScreenHeaderCta ctx={input.ctx} />

        <Button
          onClick={() => input.dispatch({ t: 'user-clicked-login-with-phone' })}
          size='lg'
          className='w-full'
          renderIconStart={(iconInput) => <IconMobilePhone {...iconInput} />}
          text={input.ctx.t('auth.continue-with-phone')}
        />

        <div className='flex w-full items-center justify-center py-1'>
          <Typography
            variant='body'
            className='text-base font-bold uppercase'
            color='text-secondary'
            text={input.ctx.t('auth.or')}
          />
        </div>

        <ContinueAsGuestFrontend.ViewButton
          ctx={input.ctx}
          dispatch={(c) => input.dispatch({ t: 'got-login-as-guest-msg', c })}
          model={input.model.continueAsGuest}
        />
      </div>
    </AuthScreenLayout>
  )
}

const ViewModals = (input: { ctx: AppFrontendCtxBase; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  return (
    <LogoutFrontend.View
      ctx={input.ctx}
      dispatch={(c) => input.dispatch({ t: 'got-logout-msg', c })}
      model={input.model.logout}
    />
  )
}

export const AuthFrontend = {
  init,
  update,
  subscriptions,
  View,
  ViewModals,
  initCtx,
}
