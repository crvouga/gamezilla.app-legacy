import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import { PhoneNumber } from '~/@/phone-number'
import { NotAsked, RemoteResult, isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { IconMobilePhone, Select, TextField, Typography } from '~/@/ui'
import { Uuid } from '~/@/uuid/uuid'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import {
  APP_SOUND,
  focusView,
  playSound,
  pushScreen,
  replaceScreen,
  sendToBackend,
  showToast,
  type AppFrontendCmd,
} from '~/app/@/frontend/cmd'
import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'
import { AuthScreenFormLayout } from '../@/frontend/ui/auth-screen-form-layout'
import type { ModelFrontend, MsgFrontend, MsgToBackend, MsgToFrontend } from './types'
import { sendCodeProblemToString, verifyCodeProblemToString } from './verify-sms/interface'

//
//
//
//
//
//
//

type Module = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: BaseFrontendCtx
  MsgCmdIn: null
  MsgEvtIn: AppFrontendEvt
  MsgCmdOut: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
  MsgEvtOut: AppFrontendEvt
}>

//
//
//
//
//
//
//

const init: Module['init'] = () => {
  return {
    model: {
      inputtedCode: '',
      inputtedCodeError: null,
      //
      inputtedPhoneNumber: '',
      countryCodeInput: Iso3166Alpha2Code.of('US'),
      phoneNumberError: null,
      //

      sentCodeAt: null,
      sendCode: NotAsked,

      verifiedCodeAt: null,
      verifyCode: RemoteResult.NotAsked,
    },
  }
}

//
//
//
//
//
//
//

const CODE_INPUT_VIEW_ID = 'codeInput'

const PHONE_NUMBER_INPUT_VIEW_ID = 'phoneNumberInput'

//
//
//
//
//
//
//

const update: Module['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromBackend({ ...input, model }),
    (model) => updateAutoFocus({ ...input, model }),
  )
}

const updateAutoFocus: Module['update'] = (input) => {
  switch (input.msgEvt?.t) {
    case 'screen-evt.screen-changed': {
      switch (input.msgEvt.screen.t) {
        case 'login-sms-request': {
          return { model: input.model, msgCmd: [focusView(PHONE_NUMBER_INPUT_VIEW_ID)] }
        }

        case 'login-sms-verify': {
          return { model: input.model, msgCmd: [focusView(CODE_INPUT_VIEW_ID)] }
        }

        default: {
          return { model: input.model }
        }
      }
    }
  }
  return { model: input.model }
}

const updateFromMsg: Module['update'] = (input) => {
  switch (input.msg?.t) {
    case 'clicked-back-button': {
      if (input.ctx.currentScreen.t === 'login-sms-verify') {
        return {
          model: input.model,
          msgCmd: [
            replaceScreen({
              n: 'auth-login',
              t: 'login-sms-request',
            }),
          ],
        }
      }

      return {
        model: input.model,
        msgCmd: [
          replaceScreen({
            n: 'auth-login',
            t: 'login',
          }),
        ],
      }
    }

    case 'inputted-phone-number': {
      return {
        model: {
          ...input.model,
          inputtedPhoneNumber: input.msg.phoneNumber,
          phoneNumberError: null,
        },
      }
    }

    case 'clicked-phone-number-clear': {
      return {
        model: {
          ...input.model,
          inputtedPhoneNumber: '',
          phoneNumberError: null,
        },
      }
    }

    case 'inputted-country-code': {
      return {
        model: {
          ...input.model,
          countryCodeInput: input.msg.countryCode,
        },
      }
    }

    case 'user-clicked-send-code-button': {
      const phoneNumber = PhoneNumber.fromString(input.model.inputtedPhoneNumber, input.model.countryCodeInput)

      if (isErr(phoneNumber)) {
        return {
          model: {
            ...input.model,
            phoneNumberError: input.ctx.t('auth-sms.invalid-phone-number'),
          },
          msgCmd: [playSound(APP_SOUND.alertErrorSm), focusView(PHONE_NUMBER_INPUT_VIEW_ID)],
        }
      }

      return {
        model: {
          ...input.model,
          sendCode: RemoteResult.Loading,
          sentCodeAt: input.ctx.now,
        },
        msgCmd: [
          sendToBackend({
            t: 'user-clicked-send-code-button',
            phoneNumber: phoneNumber.value,
            preferredLanguage: input.ctx.navigatorLanguage,
          }),
          playSound(APP_SOUND.tap),
        ],
      }
    }

    case 'inputted-code': {
      return {
        model: {
          ...input.model,
          inputtedCode: input.msg.inputtedCode,
          inputtedCodeError: null,
        },
      }
    }

    case 'clicked-code-clear': {
      return {
        model: {
          ...input.model,
          inputtedCode: '',
          inputtedCodeError: null,
        },
      }
    }

    case 'user-clicked-verify-code-button': {
      if (input.model.inputtedCode === '') {
        return {
          model: {
            ...input.model,
            inputtedCodeError: input.ctx.t('auth-sms.please-enter-code'),
          },
          msgCmd: [playSound(APP_SOUND.alertErrorSm), focusView(CODE_INPUT_VIEW_ID)],
        }
      }

      return {
        model: {
          ...input.model,
          verifyCode: RemoteResult.Loading,
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToBackend({
            t: 'user-clicked-verify-code-button',
            inputtedCode: input.model.inputtedCode,
            phoneNumber: input.msg.phoneNumber,
          }),
        ],
        async eff(_dispatch) {
          // const sent = await input.ctx.rpc.sendCode({})
        },
      }
    }

    case 'time-passed': {
      return AppFrontendModule.andThen(
        {
          model: input.model,
        },
        (model) => {
          if (
            model.sentCodeAt &&
            model.sendCode.t === 'loading' &&
            TimeSpan.gte(Posix.diff(input.ctx.now, model.sentCodeAt), TimeSpan.seconds(30))
          ) {
            return {
              model: {
                ...model,
                sendCode: RemoteResult.Err({
                  t: 'database-error',
                  error: input.ctx.t('app.something-went-wrong'),
                }),
              },
              msgCmd: [playSound(APP_SOUND.alertErrorMd)],
            }
          }
          return {
            model,
          }
        },
        (model) => {
          if (
            model.verifiedCodeAt &&
            model.verifyCode.t === 'loading' &&
            TimeSpan.gte(Posix.diff(input.ctx.now, model.verifiedCodeAt), TimeSpan.seconds(30))
          ) {
            return {
              model: {
                ...model,
                verifyCode: RemoteResult.Err({
                  t: 'database-error',
                  error: 'Timed out. Backend took too long to response',
                }),
              },
              msgCmd: [playSound(APP_SOUND.alertErrorMd)],
            }
          }

          return {
            model,
          }
        },
      )
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const updateFromBackend: Module['update'] = (input) => {
  const { model, msgBackend } = input

  switch (msgBackend?.t) {
    case 'sent-code': {
      if (isErr(msgBackend.sent)) {
        return {
          model: {
            ...model,
            sendCode: msgBackend.sent,
          },
          msgCmd: [playSound(APP_SOUND.alertErrorMd)],
        }
      }

      input.ctx.t('auth-sms.sent-code-to', PhoneNumber.format(msgBackend.phoneNumber))

      return {
        model: {
          ...model,
          sendCode: msgBackend.sent,
          verifyCode: RemoteResult.NotAsked,
          inputtedCode: '',
        },
        msgCmd: [
          pushScreen({
            n: 'auth-login',
            t: 'login-sms-verify',
            phoneNumber: msgBackend.phoneNumber,
          }),
          showToast(
            input.ctx.t('auth-sms.sent-code-to', PhoneNumber.format(msgBackend.phoneNumber)),
            'info',
            TimeSpan.seconds(4),
          ),
          focusView(CODE_INPUT_VIEW_ID),
          playSound(APP_SOUND.navForwardMin),
        ],
      }
    }

    case 'verified-code': {
      if (isErr(msgBackend.verified)) {
        return {
          model: {
            ...model,
            verifyCode: msgBackend.verified,
          },
          msgCmd: [playSound(APP_SOUND.alertErrorMd)],
        }
      }
      return {
        model: {
          ...model,
          verifyCode: msgBackend.verified,
        },
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

//
//
//
//
//
//
//

const INTERVAL_ID = Uuid.generate()

const subscriptions: Module['subscriptions'] = (input) => {
  if (input.model.sendCode.t === 'loading' || input.model.verifyCode.t === 'loading') {
    return Time.interval(INTERVAL_ID, TimeSpan.milliseconds(1000), (now) => ({
      t: 'time-passed',
      now,
    }))
  }

  return Sub.None
}

//
//
//
//
//
//
//
//
//

const View: Module['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'auth-login': {
      switch (input.ctx.currentScreen.t) {
        case 'login-sms-request': {
          return <ViewSendCode {...input} />
        }
        case 'login-sms-verify': {
          return <ViewVerifyCode {...input} />
        }
        default: {
          return null
        }
      }
    }
    default: {
      return null
    }
  }
}

const ViewSendCode: Module['View'] = (input) => {
  return (
    <AuthScreenFormLayout
      ctx={input.ctx}
      title={input.ctx.t('auth-sms.send-code')}
      onBack={() => input.dispatch({ t: 'clicked-back-button' })}
      submitText={input.ctx.t('auth-sms.send-code')}
      submitLoading={input.model.sendCode.t === 'loading'}
      submitDisabled={false}
      error={
        isErr(input.model.sendCode)
          ? sendCodeProblemToString({
              problem: input.model.sendCode.error,
              t: input.ctx.t,
            })
          : null
      }
      onSubmit={() => input.dispatch({ t: 'user-clicked-send-code-button' })}
      renderInputs={() => (
        <>
          <Select
            id='countryCode'
            label={input.ctx.t('auth-sms.country')}
            onChange={(countryCode) => input.dispatch({ t: 'inputted-country-code', countryCode })}
            value={input.model.countryCodeInput}
            options={Iso3166Alpha2Code.all}
            toKey={(countryCode) => countryCode}
            toName={(countryCode) => Iso3166Alpha2Code.toNameWithEmoji(countryCode)}
          />

          <TextField
            id='phoneNumberInput'
            label={input.ctx.t('auth-sms.phone-number')}
            type='tel'
            startIcon={<IconMobilePhone className='h-5 w-5' />}
            error={typeof input.model.phoneNumberError === 'string'}
            value={input.model.inputtedPhoneNumber}
            helperText={input.model.phoneNumberError}
            onChange={(value) => input.dispatch({ t: 'inputted-phone-number', phoneNumber: value })}
            onClear={() => input.dispatch({ t: 'clicked-phone-number-clear' })}
          />
        </>
      )}
    />
  )
}

const ViewVerifyCode: Module['View'] = (input) => {
  if (input.ctx.currentScreen.t !== 'login-sms-verify') return null

  const phoneNumber = input.ctx.currentScreen.phoneNumber

  return (
    <AuthScreenFormLayout
      ctx={input.ctx}
      title={input.ctx.t('auth-sms.verify-code')}
      onBack={() => input.dispatch({ t: 'clicked-back-button' })}
      submitText={input.ctx.t('auth-sms.verify-code')}
      submitLoading={input.model.verifyCode.t === 'loading' || input.model.verifyCode.t === 'ok'}
      submitDisabled={false}
      error={
        isErr(input.model.verifyCode)
          ? verifyCodeProblemToString({
              problem: input.model.verifyCode.error,
              t: input.ctx.t,
            })
          : null
      }
      onSubmit={() =>
        input.dispatch({
          t: 'user-clicked-verify-code-button',
          phoneNumber,
          inputtedCode: input.model.inputtedCode,
        })
      }
      renderInputs={() => (
        <>
          <Typography
            role='status'
            className='text-lg'
            variant='body'
            text={input.ctx.t('auth-sms.enter-code-sent-to', PhoneNumber.format(phoneNumber))}
          />

          <TextField
            id={CODE_INPUT_VIEW_ID}
            label={input.ctx.t('auth-sms.code')}
            error={typeof input.model.inputtedCodeError === 'string'}
            helperText={typeof input.model.inputtedCodeError === 'string' ? input.model.inputtedCodeError : null}
            autoFocus
            type='tel'
            value={input.model.inputtedCode}
            onChange={(value) =>
              input.dispatch({
                t: 'inputted-code',
                inputtedCode: value,
              })
            }
            onClear={() =>
              input.dispatch({
                t: 'clicked-code-clear',
              })
            }
          />
        </>
      )}
    />
  )
}

export const ContinueWithSmsFrontend = {
  init,
  update,
  subscriptions,
  View,
}
