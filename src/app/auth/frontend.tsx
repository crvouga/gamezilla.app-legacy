import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { Loading, NotAsked } from '~/@/result'
import { Sub } from '~/@/sub'
import { Button, IconEnvelope, IconMobilePhone, Typography } from '~/@/ui'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { APP_SOUND, AppFrontendCmd, playSound, pushScreen, replaceScreen, showToast } from '~/app/@/frontend/cmd'
import { BaseFrontendCtx } from '../@/frontend/ctx'
import { AuthScreenHeaderCta } from './@/frontend/ui/auth-screen-header-cta'
import { AuthScreenLayout } from './@/frontend/ui/auth-screen-layout'
import { ContinueWithSmsFrontend } from './continue-with-sms/frontend'
import { ContinueAsGuestFrontend } from './continue-as-guest/frontend'
import { LogoutFrontend } from './logout/frontend'
import type { FrontendModule, ModelFrontend, MsgFrontend } from './types'

//
//
//
// Model
//
//
//

export const init: FrontendModule['init'] = (input) => {
  const sms = ContinueWithSmsFrontend.init(input)

  return {
    model: {
      ...ContinueAsGuestFrontend.initModel,
      currentUser: Loading,
      loginWithGoogle: NotAsked,
      logout: NotAsked,
      sms: sms.model,
      opened: null,
    },
    eff: Eff.batch(Eff.tag('sms', sms.eff)),
    msgEvt: Msg.batch(sms.msgEvt),
    msgCmd: Msg.batch(AppFrontendCmd.tag('sms', sms.msgCmd)),
  }
}

//
//
//
// Update
//
//
//

export const update: FrontendModule['update'] = (input) => {
  if (!input.msg && !input.msgBackend && !input.msgEvt && !input.msgCmd) {
    return { model: input.model }
  }

  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromBackend({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model }),
    (model) => ContinueAsGuestFrontend.update({ ...input, model }),
    (model) => LogoutFrontend.update({ ...input, model }),
  )
}

const updateChild: FrontendModule['update'] = (input) => {
  const updated = ContinueWithSmsFrontend.update({
    ctx: input.ctx,
    model: input.model.sms,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'sms' ? input.msgBackend.c : null,
    msg: input.msg?.t === 'sms' ? input.msg.c : null,
  })

  return {
    model: {
      ...input.model,
      sms: updated.model,
    },
    msgCmd: AppFrontendCmd.tag('sms', updated.msgCmd),
    eff: Eff.tag('sms', updated.eff),
    msgEvt: updated.msgEvt,
  }
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'user-clicked-login-with-phone': {
      return {
        model: input.model,
        msgCmd: [
          pushScreen({
            n: 'auth-login',
            t: 'login-sms-request',
          }),
          playSound(APP_SOUND.navForwardMin),
        ],
      }
    }
    case 'user-clicked-login-with-email': {
      return {
        model: input.model,
        msgCmd: [
          pushScreen({
            n: 'auth-login',
            t: 'login-email-send-link',
          }),
          playSound(APP_SOUND.navForwardMin),
        ],
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const updateFromBackend: FrontendModule['update'] = (input) => {
  switch (input.msgBackend?.t) {
    case 'client-unauthenticated': {
      return {
        model: {
          ...input.model,
          currentUser: {
            t: 'logged-out',
          },
        },
        msgEvt: [
          {
            t: 'auth-evt.unauthenticated',
          },
        ],
      }
    }

    case 'client-authenticated': {
      return {
        model: {
          ...input.model,
          currentUser: {
            t: 'logged-in',
            account: input.msgBackend.account,
          },
        },
        msgEvt: [
          {
            ...input.msgBackend,
            account: input.msgBackend.account,
            t: 'auth-evt.authenticated',
          },
        ],
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const updateFromEvent: FrontendModule['update'] = (input) => {
  return updateRedirect(input)
}

const updateRedirect: FrontendModule['update'] = (input) => {
  if (!input.msgEvt) {
    return { model: input.model }
  }

  switch (input.msgEvt.t) {
    case 'auth-evt.authenticated': {
      if (!input.msgEvt.loggedIn) {
        return {
          model: input.model,
        }
      }

      return {
        model: input.model,
        msgCmd: [
          replaceScreen({ n: 'spaces', t: 'space-list' }, false),
          playSound(APP_SOUND.celebration),
          input.msgEvt.account.role === 'guest'
            ? showToast(input.ctx.t('auth.logged-in-as-guest'))
            : showToast(input.ctx.t('auth.logged-in')),
        ],
      }
    }

    case 'screen-evt.screen-changed': {
      if (input.model.currentUser.t === 'logged-in' && input.ctx.currentScreen.n === 'auth-login') {
        return {
          model: input.model,
          msgCmd: [
            replaceScreen({ n: 'spaces', t: 'space-list' }),
            showToast(input.ctx.t('auth.current-user-logged-in')),
          ],
        }
      }

      return {
        model: input.model,
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

export const subscriptions: FrontendModule['subscriptions'] = ({ model, ctx }) => {
  return Sub.tag('sms', ContinueWithSmsFrontend.subscriptions({ model: model.sms, ctx }))
}

//
//
//
// View
//
//
//

export const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'auth-login': {
      switch (input.ctx.currentScreen.t) {
        case 'login': {
          return <ViewLoginScreen {...input} />
        }
        case 'login-sms-request':
        case 'login-sms-verify': {
          return (
            <ContinueWithSmsFrontend.View
              ctx={input.ctx}
              dispatch={(c) => input.dispatch({ t: 'sms', c })}
              model={input.model.sms}
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

        {false && (
          <Button
            onClick={() => input.dispatch({ t: 'user-clicked-login-with-email' })}
            color='default'
            size='lg'
            className='w-full'
            renderIconStart={(iconInput) => <IconEnvelope {...iconInput} />}
            text={input.ctx.t('auth.continue-with-email')}
          />
        )}

        <div className='flex w-full items-center justify-center py-1'>
          <Typography
            variant='body'
            className='text-secondary text-base font-bold uppercase'
            text={input.ctx.t('auth.or')}
          />
        </div>

        <ContinueAsGuestFrontend.ViewButton {...input} />
      </div>
    </AuthScreenLayout>
  )
}

export const ViewModals = (input: {
  ctx: BaseFrontendCtx
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  return <LogoutFrontend.View {...input} />
}
