import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import { Eff } from '~/@/eff'
import { Translator } from '~/@/l18n/generated'
import { TranslatedText } from '~/@/l18n/translations'
import { isAnyMsg } from '~/@/msg/msg'
import { PhoneNumber } from '~/@/phone-number'
import { isErr, NotAsked, Remote, RemoteResult } from '~/@/result'
import { RPC } from '~/@/rpc'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { IconMobilePhone } from '~/@/ui/icon'
import { TextField } from '~/@/ui/text-field'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Frag } from '~/@/vdom/primitives/frag'
import { sx } from '~/@/vdom/style/sx'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { showErrorSmall } from '~/app/@/frontend/show-error-small'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { showToast } from '~/app/@/frontend/toaster-cmd'
import { pushScreen, replaceScreen } from '~/app/frontend/current-screen/current-screen-cmd'
import { focus } from '~/app/frontend/focus/focus-cmd'
import { SendCodeProblem } from '../@/backend/verify-sms/send-code-problem'
import { VerifyCodeProblem } from '../@/backend/verify-sms/verify-code-problem'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { AuthScreenFormLayout } from '../@/frontend/ui/auth-screen-form-layout'
import { rpcContract, Sent, Verified } from './types'

export type Model = {
  loginWithSms_phone?: string
  loginWithSms_phoneError?: TranslatedText | null
  loginWithSms_countryCode?: Iso3166Alpha2Code
  loginWithSms_code?: string
  loginWithSms_codeError?: TranslatedText | null
  loginWithSms_sent?: Remote | Sent
  loginWithSms_sentCodeAt?: UnixMs | null
  loginWithSms_verified?: Remote | Verified
  loginWithSms_verifiedAt?: UnixMs | null
}

export const init = (_input: {}): { model: Model; eff?: Eff<MsgFrontend> } => {
  return {
    model: {
      loginWithSms_phone: undefined,
      loginWithSms_phoneError: undefined,
      loginWithSms_countryCode: undefined,
    },
  }
}

const toSendErrorMessage = (input: { model: Model; ctx: { t: Translator } }): TranslatedText | null => {
  const send = input.model.loginWithSms_sent ?? NotAsked

  if (send.t === 'loading' || send.t === 'not-asked') {
    return null
  }

  if (send.t === 'err') {
    return input.ctx.t('app.something-went-wrong')
  }

  if (send.value.t === 'err') {
    return SendCodeProblem.toString({ problem: send.value.error, t: input.ctx.t })
  }

  return null
}

const toVerifyErrorMessage = (input: { model: Model; ctx: { t: Translator } }): TranslatedText | null => {
  const verified = input.model.loginWithSms_verified ?? NotAsked

  if (verified.t === 'loading' || verified.t === 'not-asked') {
    return null
  }

  if (verified.t === 'err') {
    return input.ctx.t('app.something-went-wrong')
  }

  if (verified.value.t === 'err') {
    return VerifyCodeProblem.toString({ problem: verified.value.error, t: input.ctx.t })
  }

  return null
}

export type MsgFrontend =
  | { n: 'loginWithSms'; t: 'loginWithSms_clickedBackButton' }
  | { n: 'loginWithSms'; t: 'loginWithSms_inputtedPhoneNumber'; phone: string }
  | { n: 'loginWithSms'; t: 'loginWithSms_inputtedCountryCode'; countryCode: Iso3166Alpha2Code }
  | { n: 'loginWithSms'; t: 'loginWithSms_clickedPhoneNumberClear' }
  | { n: 'loginWithSms'; t: 'loginWithSms_clickedSendCodeButton' }
  | { n: 'loginWithSms'; t: 'loginWithSms_inputtedCode'; code: string }
  | { n: 'loginWithSms'; t: 'loginWithSms_clickedCodeClear' }
  | { n: 'loginWithSms'; t: 'loginWithSms_clickedVerifyCodeButton'; phone: PhoneNumber; code: string }
  | { n: 'loginWithSms'; t: 'loginWithSms_sentCode'; sent: Sent }
  | { n: 'loginWithSms'; t: 'loginWithSms_verifiedCode'; verified: Verified }

const isMsg = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('loginWithSms_')
}

type Ctx = AuthFrontendCtx & {
  rpc: RPC.Client<typeof rpcContract>
}

const CODE_INPUT_VIEW_ID = 'codeInput'

const PHONE_NUMBER_INPUT_VIEW_ID = 'phoneNumberInput'

export const update = (input: {
  ctx: Ctx
  model: Model
  msg: MsgFrontend
}): {
  model: Model
  eff?: Eff<MsgFrontend>
} => {
  if (!isMsg(input.msg)) return { model: input.model }
  switch (input.msg.t) {
    case 'loginWithSms_clickedBackButton': {
      if (input.ctx.currentScreen.t === 'auth_verifyCode') {
        return {
          model: input.model,
          eff: replaceScreen({ n: 'auth', t: 'auth_sendCode' }, true),
        }
      }

      return {
        model: input.model,
        eff: replaceScreen({ n: 'auth', t: 'auth_login' }, true),
      }
    }

    case 'loginWithSms_inputtedPhoneNumber': {
      return {
        model: {
          ...input.model,
          loginWithSms_phone: input.msg.phone,
          loginWithSms_phoneError: null,
        },
      }
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
          eff: Eff.batch([playSound(APP_SOUND.alertErrorSm), focus(PHONE_NUMBER_INPUT_VIEW_ID)]),
        }
      }

      return {
        model: {
          ...input.model,
          loginWithSms_sent: RemoteResult.Loading,
          loginWithSms_sentCodeAt: input.ctx.now,
        },
        eff: Eff.batch([
          playSound(APP_SOUND.tap),
          async (dispatch) => {
            const sent = await input.ctx.rpc['loginWithSms_sendCode']({
              phoneNumber: phoneNumber.value,
              preferredLanguage: input.ctx.navigatorLanguage,
            })
            dispatch({ n: 'loginWithSms', t: 'loginWithSms_sentCode', sent })
          },
        ]),
      }
    }

    case 'loginWithSms_sentCode': {
      const { sent } = input.msg

      const modelNew: Model = {
        ...input.model,
        loginWithSms_sent: sent,
        loginWithSms_sentCodeAt: input.ctx.now,
      }

      const error = toSendErrorMessage({ model: modelNew, ctx: input.ctx }) ?? input.ctx.t('app.something-went-wrong')

      if (isErr(sent)) {
        return {
          model: modelNew,
          eff: showErrorSmall(error, sent.error.error),
        }
      }

      if (isErr(sent.value)) {
        return {
          model: modelNew,
          eff: showErrorSmall(error),
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
        eff: Eff.batch([
          pushScreen({ n: 'auth', t: 'auth_verifyCode', phoneNumber }),
          showToast(input.ctx.t('auth-sms.sent-code-to', PhoneNumber.format(phoneNumber)), 'info', TimeSpan.seconds(4)),
          focus(CODE_INPUT_VIEW_ID),
          playSound(APP_SOUND.navForwardMin),
        ]),
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
          eff: Eff.batch([playSound(APP_SOUND.alertErrorSm), focus(CODE_INPUT_VIEW_ID)]),
        }
      }

      const phoneNumber = input.msg.phone

      return {
        model: {
          ...input.model,
          loginWithSms_verified: RemoteResult.Loading,
        },
        eff: Eff.batch([
          playSound(APP_SOUND.tap),
          async (dispatch) => {
            const verified = await input.ctx.rpc.loginWithSms_verifyCode({
              phoneNumber,
              code: input.model.loginWithSms_code ?? '',
              preferredLanguage: input.ctx.navigatorLanguage,
            })
            dispatch({ n: 'loginWithSms', t: 'loginWithSms_verifiedCode', verified })
          },
        ]),
      }
    }

    case 'loginWithSms_verifiedCode': {
      const { verified } = input.msg
      const modelNew: Model = { ...input.model, loginWithSms_verified: verified }
      const error = toVerifyErrorMessage({ model: modelNew, ctx: input.ctx }) ?? input.ctx.t('app.something-went-wrong')

      if (isErr(verified) || isErr(verified.value)) {
        return {
          model: modelNew,
          eff: showErrorSmall(error),
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

export const View = (input: { ctx: Ctx; model: Model; dispatch: (msg: MsgFrontend) => void }) => {
  switch (input.ctx.currentScreen.t) {
    case 'auth_sendCode':
      return h(ViewSendCode, input)
    case 'auth_verifyCode':
      return h(ViewVerifyCode, input)
    default:
      return null
  }
}

export const TEST_ID_SEND_CODE_SCREEN = 'auth/send-code-screen'

const ViewSendCode = (input: { ctx: Ctx; model: Model; dispatch: (msg: MsgFrontend) => void }) => {
  return h(AuthScreenFormLayout, {
    testId: TEST_ID_SEND_CODE_SCREEN,
    ctx: input.ctx,
    title: input.ctx.t('auth-sms.send-code'),
    onBack: () => {
      input.dispatch({ n: 'loginWithSms', t: 'loginWithSms_clickedBackButton' })
    },
    submitText: input.ctx.t('auth-sms.send-code'),
    submitLoading: input.model.loginWithSms_sent?.t === 'loading',
    submitDisabled: false,
    onSubmit: () => input.dispatch({ n: 'loginWithSms', t: 'loginWithSms_clickedSendCodeButton' }),
    renderInputs: () =>
      h(Frag, {}, [
        h(TextField, {
          id: 'phoneNumberInput',
          testId: 'phone-number-input',
          label: input.ctx.t('auth-sms.phone-number'),
          showLabel: false,
          type: 'tel',
          startIcon: h(IconMobilePhone, { style: sx({ size: 5 }) }),
          error: typeof input.model.loginWithSms_phoneError === 'string',
          value: input.model.loginWithSms_phone ?? '',
          helperText: input.model.loginWithSms_phoneError,
          onChangeText: (value: string) =>
            input.dispatch({ n: 'loginWithSms', t: 'loginWithSms_inputtedPhoneNumber', phone: value }),
          onClear: () => input.dispatch({ n: 'loginWithSms', t: 'loginWithSms_clickedPhoneNumberClear' }),
        }),
      ]),
  })
}

export const TEST_ID_VERIFY_CODE_SCREEN = 'auth/verify-code-screen'

const ViewVerifyCode = (input: { ctx: Ctx; model: Model; dispatch: (msg: MsgFrontend) => void }) => {
  if (input.ctx.currentScreen.t !== 'auth_verifyCode') return null

  const phoneNumber = input.ctx.currentScreen.phoneNumber

  return h(AuthScreenFormLayout, {
    testId: TEST_ID_VERIFY_CODE_SCREEN,
    ctx: input.ctx,
    title: input.ctx.t('auth-sms.verify-code'),
    onBack: () => {
      input.dispatch({ n: 'loginWithSms', t: 'loginWithSms_clickedBackButton' })
    },
    submitText: input.ctx.t('auth-sms.verify-code'),
    submitLoading: input.model.loginWithSms_verified?.t === 'loading',
    submitDisabled: false,
    onSubmit: () =>
      input.dispatch({
        n: 'loginWithSms',
        t: 'loginWithSms_clickedVerifyCodeButton',
        phone: phoneNumber,
        code: input.model.loginWithSms_code ?? '',
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
          value: input.model.loginWithSms_code ?? '',
          onChangeText: (value) => input.dispatch({ n: 'loginWithSms', t: 'loginWithSms_inputtedCode', code: value }),
          onClear: () => input.dispatch({ n: 'loginWithSms', t: 'loginWithSms_clickedCodeClear' }),
        }),
      ]),
  })
}
