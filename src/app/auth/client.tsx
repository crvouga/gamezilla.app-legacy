import { NotAsked } from '~/@/result'
import { Msg } from '~/@/msg/msg'
import { AppClientModule } from '~/app/@/architecture/app-client'
import {
  APP_SOUND,
  AppClientCmd,
  playSound,
  pushRoute,
  replaceRoute,
  showToast,
  type BaseClientCtx
} from '~/app/@/client'
import { Button, IconEnvelope, IconMobilePhone, Typography } from '~/app/@/ui'
import { AuthSMSClient } from './auth-sms/client'
import type { ClientModule, ModelClient, MsgClient } from './types'
import { ContinueAsGuestClient } from './continue-as-guest/client'
import { LogoutClient } from './logout/client'
import { Eff } from '~/@/program/eff'
import { Sub } from '~/@/sub'

//
//
//
// Model
//
//
//

export const init: ClientModule['init'] = (input) => {
  const sms = AuthSMSClient.init(input)

  return {
    model: {
      ...ContinueAsGuestClient.initModel,
      currentUser: {
        t: 'loading'
      },
      loginWithGoogle: NotAsked,
      logout: NotAsked,
      sms: sms.model,
      opened: null
    },
    eff: Eff.batch(Eff.tag('sms', sms.eff)),
    msgEvt: Msg.batch(sms.msgEvt),
    msgCmd: Msg.batch(AppClientCmd.tag('sms', sms.msgCmd))
  }
}

//
//
//
// Update
//
//
//

export const update: ClientModule['update'] = (input) => {
  return AppClientModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model }),
    (model) => ContinueAsGuestClient.update({ ...input, model }),
    (model) => LogoutClient.update({ ...input, model })
  )
}

const updateChild: ClientModule['update'] = (input) => {
  const updated = AuthSMSClient.update({
    ctx: input.ctx,
    model: input.model.sms,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgServer: input.msgServer?.t === 'sms' ? input.msgServer.c : null,
    msg: input.msg?.t === 'sms' ? input.msg.c : null
  })

  return {
    model: {
      ...input.model,
      sms: updated.model
    },
    msgCmd: AppClientCmd.tag('sms', updated.msgCmd),
    eff: Eff.tag('sms', updated.eff),
    msgEvt: updated.msgEvt
  }
}

const updateFromMsg: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'user-clicked-login-with-phone': {
      return {
        model: input.model,
        msgCmd: [
          pushRoute({
            n: 'auth-login',
            t: 'login-sms-request'
          }),
          playSound(APP_SOUND.navForwardMin)
        ]
      }
    }
    case 'user-clicked-login-with-email': {
      return {
        model: input.model,
        msgCmd: [
          pushRoute({
            n: 'auth-login',
            t: 'login-email-send-link'
          }),
          playSound(APP_SOUND.navForwardMin)
        ]
      }
    }

    default: {
      return {
        model: input.model
      }
    }
  }
}

const updateFromServer: ClientModule['update'] = (input) => {
  switch (input.msgServer?.t) {
    case 'client-unauthenticated': {
      return {
        model: {
          ...input.model,
          currentUser: {
            t: 'logged-out'
          }
        },
        msgEvt: [
          {
            t: 'auth/unauthenticated'
          }
        ]
      }
    }

    case 'client-authenticated': {
      return {
        model: {
          ...input.model,
          currentUser: {
            t: 'logged-in',
            account: input.msgServer.account
          }
        },
        msgEvt: [
          {
            ...input.msgServer,
            account: input.msgServer.account,
            t: 'auth/authenticated'
          }
        ]
      }
    }

    default: {
      return {
        model: input.model
      }
    }
  }
}

const updateFromEvent: ClientModule['update'] = (input) => {
  return updateRedirect(input)
}

const updateRedirect: ClientModule['update'] = (input) => {
  if (!input.msgEvt) {
    return { model: input.model }
  }

  switch (input.msgEvt.t) {
    case 'auth/authenticated': {
      if (!input.msgEvt.loggedIn) {
        return {
          model: input.model
        }
      }

      return {
        model: input.model,
        msgCmd: [
          replaceRoute(
            {
              n: 'spaces',
              t: 'space-list'
            },
            false
          ),
          playSound(APP_SOUND.celebration),
          input.msgEvt.account.role === 'guest'
            ? showToast(input.ctx.t('auth.logged-in-as-guest'))
            : showToast(input.ctx.t('auth.logged-in'))
        ]
      }
    }

    case 'routing/route-changed': {
      if (input.model.currentUser.t === 'logged-in' && input.ctx.currentRoute.n === 'auth-login') {
        return {
          model: input.model,
          msgCmd: [
            replaceRoute({ n: 'spaces', t: 'space-list' }),
            showToast(input.ctx.t('auth.current-user-logged-in'))
          ]
        }
      }

      return {
        model: input.model
      }
    }

    default: {
      return {
        model: input.model
      }
    }
  }
}

//
//
//
//
//

export const subscriptions: ClientModule['subscriptions'] = ({ model, ctx }) => {
  return Sub.tag('sms', AuthSMSClient.subscriptions({ model: model.sms, ctx }))
}

//
//
//
// View
//
//
//

export const View: ClientModule['View'] = (input) => {
  switch (input.ctx.currentRoute.n) {
    case 'auth-login': {
      switch (input.ctx.currentRoute.t) {
        case 'login': {
          return <ViewLoginScreen {...input} />
        }
        case 'login-sms-request':
        case 'login-sms-verify': {
          return (
            <AuthSMSClient.View
              ctx={input.ctx}
              dispatch={(c) => input.dispatch({ t: 'sms', c })}
              model={input.model.sms}
            />
          )
        }
        case 'login-email-send-link': {
          return null
          // <AuthEmailClient.View
          //   ctx={input.ctx}
          //   dispatch={(c) => input.dispatch({ t: 'sms', c })}
          //   model={input.model.sms}
          // />
        }
      }
    }
    default: {
      return null
    }
  }
}

const ViewLoginScreen: ClientModule['View'] = (input) => {
  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <div className='flex flex-1 flex-col items-center justify-center gap-8 p-4'>
        <div className='flex w-full flex-col items-start justify-center'>
          <Typography text={input.ctx.t('auth.sign-in-to')} variant='title' />
          <span className='bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text pb-2 text-5xl font-extrabold text-transparent'>
            {input.ctx.t('app.gamezilla-app')}
          </span>
        </div>

        <div className='flex w-full flex-col gap-6'>
          <Button
            onClick={() => input.dispatch({ t: 'user-clicked-login-with-phone' })}
            size='lg'
            className='w-full'
            iconStart={(iconInput) => <IconMobilePhone {...iconInput} />}
            text={input.ctx.t('auth.continue-with-phone')}
          />

          {false && (
            <Button
              onClick={() => input.dispatch({ t: 'user-clicked-login-with-email' })}
              color='default'
              size='lg'
              className='w-full'
              iconStart={(iconInput) => <IconEnvelope {...iconInput} />}
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

          <ContinueAsGuestClient.ViewButton {...input} />
        </div>
      </div>
    </div>
  )
}

export const ViewModals = (input: { ctx: BaseClientCtx; model: ModelClient; dispatch: (msg: MsgClient) => void }) => {
  return <LogoutClient.View {...input} />
}
