import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import { PhoneNumber } from '~/@/phone-number'
import { NotAsked, RemoteResult, isErr } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { IconMobilePhone } from '~/@/ui/icon'
import { TextField } from '~/@/ui/text-field'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Frag } from '~/@/vdom/primitives/frag'
import { Text } from '~/@/vdom/primitives/text'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { FocusViewCmd } from '~/app/@/frontend/focus-view-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ReplaceScreenCmd } from '~/app/@/frontend/replace-screen-cmd.$msg'
import { ShowErrorSmall } from '~/app/@/frontend/show-error-small'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { AuthScreenFormLayout } from '../@/frontend/ui/auth-screen-form-layout'
import { FrontendModule, ModelFrontend, toSendErrorMessage, toVerifyErrorMessage } from './types'
import { sx } from '~/@/vdom/style/sx'

const init: ModelFrontend = {
  loginWithSms_code: '',
  loginWithSms_codeError: null,
  loginWithSms_phone: '',
  loginWithSms_countryCode: Iso3166Alpha2Code.of('US'),
  loginWithSms_phoneError: null,
  loginWithSms_sent: NotAsked,
  loginWithSms_verified: NotAsked,
}

const CODE_INPUT_VIEW_ID = 'codeInput'

const PHONE_NUMBER_INPUT_VIEW_ID = 'phoneNumberInput'

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen({ model: input.model }, (model) => updateFromMsg({ ...input, model }))
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  if (!input.msg) return { model: input.model }

  switch (input.msg.t) {
    case 'loginWithSms_clickedBackButton': {
      if (input.ctx.currentScreen.t === 'verify-code') {
        return {
          model: input.model,
          msgOut: [ReplaceScreenCmd.init({ n: 'auth', t: 'send-code' }, true)],
        }
      }

      return {
        model: input.model,
        msgOut: [ReplaceScreenCmd.init({ n: 'auth', t: 'login' }, true)],
      }
    }

    case 'loginWithSms_inputtedPhoneNumber': {
      return { model: { ...input.model, loginWithSms_phone: input.msg.phone, loginWithSms_phoneError: null } }
    }

    case 'loginWithSms_clickedPhoneNumberClear': {
      return { model: { ...input.model, loginWithSms_phone: '', loginWithSms_phoneError: null } }
    }

    case 'loginWithSms_inputtedCountryCode': {
      return { model: { ...input.model, loginWithSms_countryCode: input.msg.countryCode } }
    }

    case 'loginWithSms_clickedSendCodeButton': {
      const phoneNumber = PhoneNumber.fromString(input.model.loginWithSms_phone, input.model.loginWithSms_countryCode)

      if (isErr(phoneNumber)) {
        return {
          model: { ...input.model, loginWithSms_phoneError: input.ctx.t('auth-sms.invalid-phone-number') },
          msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm), FocusViewCmd.init(PHONE_NUMBER_INPUT_VIEW_ID)],
        }
      }

      return {
        model: {
          ...input.model,
          loginWithSms_sent: RemoteResult.Loading,
          sentCodeAt: input.ctx.now,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          const sent = await input.ctx.rpc['loginWithSms_sendCode']({
            phoneNumber: phoneNumber.value,
            preferredLanguage: input.ctx.navigatorLanguage,
          })
          dispatch({ t: 'loginWithSms_sentCode', sent })
        },
      }
    }

    case 'loginWithSms_sentCode': {
      const { sent } = input.msg

      const modelNew: ModelFrontend = { ...input.model, loginWithSms_sent: sent }

      const error = toSendErrorMessage({ model: modelNew, ctx: input.ctx }) ?? input.ctx.t('app.something-went-wrong')

      if (isErr(sent)) {
        return {
          model: modelNew,
          msgOut: ShowErrorSmall.init(error, sent.error.error),
        }
      }

      if (isErr(sent.value)) {
        return {
          model: modelNew,
          msgOut: ShowErrorSmall.init(error),
        }
      }

      const phoneNumber = sent.value.value.phoneNumber

      return {
        model: {
          ...input.model,
          loginWithSms_sent: sent,
          loginWithSms_verified: NotAsked,
          loginWithSms_code: '',
        },
        msgOut: [
          PushScreenCmd.init({ n: 'auth', t: 'verify-code', phoneNumber }),
          ShowToastCmd.init(input.ctx.t('auth-sms.sent-code-to', PhoneNumber.format(phoneNumber)), {
            duration: TimeSpan.seconds(4),
          }),
          FocusViewCmd.init(CODE_INPUT_VIEW_ID),
          PlaySoundCmd.init(APP_SOUND.navForwardMin),
        ],
      }
    }

    case 'loginWithSms_inputtedCode': {
      return { model: { ...input.model, loginWithSms_code: input.msg.code, loginWithSms_codeError: null } }
    }

    case 'loginWithSms_clickedCodeClear': {
      return { model: { ...input.model, loginWithSms_code: '', loginWithSms_codeError: null } }
    }

    case 'loginWithSms_clickedVerifyCodeButton': {
      if (input.model.loginWithSms_code === '') {
        return {
          model: {
            ...input.model,
            loginWithSms_codeError: input.ctx.t('auth-sms.please-enter-code'),
          },
          msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm), FocusViewCmd.init(CODE_INPUT_VIEW_ID)],
        }
      }

      const phoneNumber = input.msg.phone

      return {
        model: {
          ...input.model,
          loginWithSms_verified: RemoteResult.Loading,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          const verified = await input.ctx.rpc.loginWithSms_verifyCode({
            phoneNumber,
            code: input.model.loginWithSms_code,
            preferredLanguage: input.ctx.navigatorLanguage,
          })
          dispatch({ t: 'loginWithSms_verifiedCode', verified })
        },
      }
    }

    case 'loginWithSms_verifiedCode': {
      const { verified } = input.msg
      const modelNew: ModelFrontend = { ...input.model, loginWithSms_verified: verified }
      const error = toVerifyErrorMessage({ model: modelNew, ctx: input.ctx }) ?? input.ctx.t('app.something-went-wrong')

      if (isErr(verified) || isErr(verified.value)) {
        return {
          model: modelNew,
          msgOut: ShowErrorSmall.init(error),
        }
      }

      const { userSession, userAccount } = verified.value.value

      return {
        model: modelNew,
        async eff(_dispatch) {
          await Promise.all([
            input.ctx.userSessionDb.upsert({ entities: [userSession] }),
            input.ctx.userAccountDb.upsert({ entities: [userAccount] }),
          ])
        },
      }
    }
  }
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'auth': {
      switch (input.ctx.currentScreen.t) {
        case 'send-code': {
          return h(ViewSendCode, input)
        }
        case 'verify-code': {
          return h(ViewVerifyCode, input)
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

export const TEST_ID_SEND_CODE_SCREEN = 'auth/send-code-screen'

const ViewSendCode: FrontendModule['View'] = (input) => {
  return h(AuthScreenFormLayout, {
    testId: TEST_ID_SEND_CODE_SCREEN,
    ctx: input.ctx,
    title: input.ctx.t('auth-sms.send-code'),
    onBack: () => {
      input.dispatch({ t: 'loginWithSms_clickedBackButton' })
    },
    submitText: input.ctx.t('auth-sms.send-code'),
    submitLoading: input.model.loginWithSms_sent.t === 'loading',
    submitDisabled: false,
    onSubmit: () => input.dispatch({ t: 'loginWithSms_clickedSendCodeButton' }),
    renderInputs: () =>
      h(Frag, {}, [
        h(Text, { style: sx({ textColor: 'white' }), text: input.model.loginWithSms_phone }),
        h(TextField, {
          id: 'phoneNumberInput',
          testId: 'phone-number-input',
          label: input.ctx.t('auth-sms.phone-number'),
          type: 'tel',
          startIcon: h(IconMobilePhone, { style: sx({ size: 5 }) }),
          error: typeof input.model.loginWithSms_phoneError === 'string',
          value: input.model.loginWithSms_phone,
          helperText: input.model.loginWithSms_phoneError,
          onChangeText: (value: string) => input.dispatch({ t: 'loginWithSms_inputtedPhoneNumber', phone: value }),
          onClear: () => input.dispatch({ t: 'loginWithSms_clickedPhoneNumberClear' }),
        }),
      ]),
  })
}

export const TEST_ID_VERIFY_CODE_SCREEN = 'auth/verify-code-screen'

const ViewVerifyCode: FrontendModule['View'] = (input) => {
  if (input.ctx.currentScreen.t !== 'verify-code') return null

  const phoneNumber = input.ctx.currentScreen.phoneNumber

  return h(AuthScreenFormLayout, {
    testId: TEST_ID_VERIFY_CODE_SCREEN,
    ctx: input.ctx,
    title: input.ctx.t('auth-sms.verify-code'),
    onBack: () => {
      input.dispatch({ t: 'loginWithSms_clickedBackButton' })
    },
    submitText: input.ctx.t('auth-sms.verify-code'),
    submitLoading: input.model.loginWithSms_verified.t === 'loading',
    submitDisabled: false,
    onSubmit: () =>
      input.dispatch({
        t: 'loginWithSms_clickedVerifyCodeButton',
        phone: phoneNumber,
        code: input.model.loginWithSms_code,
      }),
    renderInputs: () =>
      h(Frag, {}, [
        h(Typography, {
          role: 'status',
          style: sx({ fontSize: 'lg' }),
          variant: 'body',
          text: input.ctx.t('auth-sms.enter-code-sent-to', PhoneNumber.format(phoneNumber)),
        }),

        h(TextField, {
          id: CODE_INPUT_VIEW_ID,
          label: input.ctx.t('auth-sms.code'),
          error: typeof input.model.loginWithSms_codeError === 'string',
          helperText:
            typeof input.model.loginWithSms_codeError === 'string' ? input.model.loginWithSms_codeError : null,
          autoFocus: true,
          type: 'tel',
          value: input.model.loginWithSms_code,
          onChangeText: (value) => input.dispatch({ t: 'loginWithSms_inputtedCode', code: value }),
          onClear: () => input.dispatch({ t: 'loginWithSms_clickedCodeClear' }),
        }),
      ]),
  })
}

export const LoginWithSMSFrontend = {
  init,
  update,
  View,
}
