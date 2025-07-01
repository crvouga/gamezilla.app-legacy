import { h } from '~/@/vdom/h'
import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import { PhoneNumber } from '~/@/phone-number'
import { NotAsked, RemoteResult, isErr } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { IconMobilePhone } from '~/@/ui/icon'
import { Select } from '~/@/ui/select'
import { TextField } from '~/@/ui/text-field'
import { Typography } from '~/@/ui/typography'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { FocusViewCmd } from '~/app/@/frontend/focus-view-cmd.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ReplaceScreenCmd } from '~/app/@/frontend/replace-screen-cmd.$msg'
import { ShowErrorSmall } from '~/app/@/frontend/show-error-small'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { AuthScreenFormLayout } from '../@/frontend/ui/auth-screen-form-layout'
import { FrontendModule, ModelFrontend, toSendErrorMessage, toVerifyErrorMessage } from './types'
import { Frag } from '~/@/ui/frag'

const init: ModelFrontend = {
  code: '',
  codeError: null,
  phone: '',
  countryCode: Iso3166Alpha2Code.of('US'),
  phoneError: null,
  sent: NotAsked,
  verified: NotAsked,
}

const CODE_INPUT_VIEW_ID = 'codeInput'

const PHONE_NUMBER_INPUT_VIEW_ID = 'phoneNumberInput'

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen({ model: input.model }, (model) => updateFromMsg({ ...input, model }))
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  if (!input.msg) return { model: input.model }

  switch (input.msg.t) {
    case 'clicked-back-button': {
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

    case 'inputted-phone-number': {
      return { model: { ...input.model, phone: input.msg.phone, phoneError: null } }
    }

    case 'clicked-phone-number-clear': {
      return { model: { ...input.model, phone: '', phoneError: null } }
    }

    case 'inputted-country-code': {
      return { model: { ...input.model, countryCode: input.msg.countryCode } }
    }

    case 'user-clicked-send-code-button': {
      const phoneNumber = PhoneNumber.fromString(input.model.phone, input.model.countryCode)

      if (isErr(phoneNumber)) {
        return {
          model: { ...input.model, phoneError: input.ctx.t('auth-sms.invalid-phone-number') },
          msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm), FocusViewCmd.init(PHONE_NUMBER_INPUT_VIEW_ID)],
        }
      }

      return {
        model: {
          ...input.model,
          sent: RemoteResult.Loading,
          sentCodeAt: input.ctx.now,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          const sent = await input.ctx.rpc['auth/login-with-sms/send-code']({
            phoneNumber: phoneNumber.value,
            preferredLanguage: input.ctx.navigatorLanguage,
          })
          dispatch({ t: 'sent-code', sent })
        },
      }
    }

    case 'sent-code': {
      const { sent } = input.msg

      const modelNew: ModelFrontend = { ...input.model, sent }

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
          sent,
          verified: NotAsked,
          code: '',
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

    case 'inputted-code': {
      return { model: { ...input.model, code: input.msg.code, codeError: null } }
    }

    case 'clicked-code-clear': {
      return { model: { ...input.model, code: '', codeError: null } }
    }

    case 'user-clicked-verify-code-button': {
      if (input.model.code === '') {
        return {
          model: {
            ...input.model,
            codeError: input.ctx.t('auth-sms.please-enter-code'),
          },
          msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm), FocusViewCmd.init(CODE_INPUT_VIEW_ID)],
        }
      }

      const phoneNumber = input.msg.phone

      return {
        model: {
          ...input.model,
          verified: RemoteResult.Loading,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          const verified = await input.ctx.rpc['auth/login-with-sms/verify-code']({
            phoneNumber,
            code: input.model.code,
            preferredLanguage: input.ctx.navigatorLanguage,
          })
          dispatch({ t: 'verified-code', verified })
        },
      }
    }

    case 'verified-code': {
      const { verified } = input.msg
      const modelNew: ModelFrontend = { ...input.model, verified }
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
          await Promise.all([input.ctx.userSessionDb.upsert(userSession), input.ctx.userAccountDb.upsert(userAccount)])
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

const ViewSendCode: FrontendModule['View'] = (input) => {
  return h(AuthScreenFormLayout, {
    dataTestId: 'auth/send-code-screen',
    ctx: input.ctx,
    title: input.ctx.t('auth-sms.send-code'),
    onBack: () => {
      input.dispatch({ t: 'clicked-back-button' })
    },
    submitText: input.ctx.t('auth-sms.send-code'),
    submitLoading: input.model.sent.t === 'loading',
    submitDisabled: false,
    onSubmit: () => input.dispatch({ t: 'user-clicked-send-code-button' }),
    renderInputs: () =>
      h(Frag, {}, [
        h(Select<Iso3166Alpha2Code>, {
          id: 'countryCode',
          label: input.ctx.t('auth-sms.country'),
          onChange: (countryCode) => input.dispatch({ t: 'inputted-country-code', countryCode }),
          value: input.model.countryCode,
          options: Iso3166Alpha2Code.all,
          toKey: (countryCode) => countryCode,
          toName: (countryCode) => Iso3166Alpha2Code.toNameWithEmoji(countryCode),
        }),

        h(TextField, {
          id: 'phoneNumberInput',
          dataTestId: 'phone-number-input',
          label: input.ctx.t('auth-sms.phone-number'),
          type: 'tel',
          startIcon: h(IconMobilePhone, { class: 'h-5 w-5' }),
          error: typeof input.model.phoneError === 'string',
          value: input.model.phone,
          helperText: input.model.phoneError,
          onChange: (value: string) => input.dispatch({ t: 'inputted-phone-number', phone: value }),
          onClear: () => input.dispatch({ t: 'clicked-phone-number-clear' }),
        }),
      ]),
  })
}

const ViewVerifyCode: FrontendModule['View'] = (input) => {
  if (input.ctx.currentScreen.t !== 'verify-code') return null

  const phoneNumber = input.ctx.currentScreen.phoneNumber

  return h(AuthScreenFormLayout, {
    dataTestId: 'auth/verify-code-screen',
    ctx: input.ctx,
    title: input.ctx.t('auth-sms.verify-code'),
    onBack: () => {
      input.dispatch({ t: 'clicked-back-button' })
    },
    submitText: input.ctx.t('auth-sms.verify-code'),
    submitLoading: input.model.verified.t === 'loading',
    submitDisabled: false,
    onSubmit: () =>
      input.dispatch({
        t: 'user-clicked-verify-code-button',
        phone: phoneNumber,
        code: input.model.code,
      }),
    renderInputs: () =>
      h(Frag, {}, [
        h(Typography, {
          role: 'status',
          class: 'text-lg',
          variant: 'body',
          text: input.ctx.t('auth-sms.enter-code-sent-to', PhoneNumber.format(phoneNumber)),
        }),

        h(TextField, {
          id: CODE_INPUT_VIEW_ID,
          label: input.ctx.t('auth-sms.code'),
          error: typeof input.model.codeError === 'string',
          helperText: typeof input.model.codeError === 'string' ? input.model.codeError : null,
          autoFocus: true,
          type: 'tel',
          value: input.model.code,
          onChange: (value) => input.dispatch({ t: 'inputted-code', code: value }),
          onClear: () => input.dispatch({ t: 'clicked-code-clear' }),
        }),
      ]),
  })
}

export const LoginWithSMSFrontend = {
  init,
  update,
  View,
}
