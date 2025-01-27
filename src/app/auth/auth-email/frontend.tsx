import { Eff } from '~/@/eff'
import { exhaustive } from '~/@/function/exhaustive'
import { Translator } from '~/@/l18n/generated'
import { type Result, isErr } from '~/@/result'
import { ScreenCmd } from '~/app/@/frontend/cmd'
import { AlertError, AlertSuccess, TextField } from '~/@/ui'
import { ScreenLayout } from '~/app/@/ui/screen-layout'
import { ScreenSize } from '~/app/@/frontend/ctx'

//
//
//
// Model
//
//
//

export type Model = {
  emailAddress: string
  validation?: 'invalid-email' | null
  submission:
    | { type: 'idle' }
    | {
        type: 'loading'
        sentToEmailAddress: string
      }
    | {
        type: 'problem'
        message: string
      }
    | {
        type: 'ok'
        sentToEmailAddress: string
      }
}

export const init: Model = {
  emailAddress: '',
  submission: { type: 'idle' },
}

//
//
//
// Update
//
//
//

export type Msg =
  | { t: 'clicked-back' }
  | { t: 'clicked-send-login-link' }
  | { t: 'inputted-email-address'; emailAddress: string }
  | { t: 'login-done'; result: Result<string, null> }

export const update = ({
  msg,
  model,
}: {
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
  msgCmd?: ScreenCmd[]
} => {
  if (msg.t === 'inputted-email-address') {
    return {
      model: {
        ...model,
        validation: null,
        emailAddress: msg.emailAddress,
      },
    }
  }

  if (msg.t === 'login-done') {
    if (isErr(msg.result)) {
      return {
        model: {
          ...model,
          submission: {
            type: 'problem',
            message: msg.result.error,
          },
        },
      }
    }

    const emailAddress = model.submission.type === 'loading' ? model.submission.sentToEmailAddress : model.emailAddress

    return {
      model: {
        ...model,
        emailAddress: '',
        submission: {
          type: 'ok',
          sentToEmailAddress: emailAddress,
        },
      },
    }
  }

  if (msg.t === 'clicked-send-login-link') {
    if (model.emailAddress.length === 0) {
      return {
        model: {
          ...model,
          validation: 'invalid-email',
        },
      }
    }

    return {
      model: {
        ...model,
        submission: {
          type: 'loading',
          sentToEmailAddress: model.emailAddress,
        },
      },
    }
  }

  if (msg.t === 'clicked-back') {
    return {
      model: model,
      msgCmd: [
        {
          t: 'current-screen',
          c: {
            t: 'back',
          },
        },
      ],
    }
  }

  return exhaustive(msg)
}

//
//
//
// View
//
//
//

export const View = (input: {
  model: Model
  dispatch: (msg: Msg) => void
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
}) => {
  return (
    <ScreenLayout
      id='auth-email'
      ctx={input.ctx}
      nav={{
        title: input.ctx.t('auth-email.login-with-email'),
        onBack: () =>
          input.dispatch({
            t: 'clicked-back',
          }),
      }}
      form={{
        onSubmit: () => {
          input.dispatch({
            t: 'clicked-send-login-link',
          })
        },
        submitText: input.ctx.t('auth-email.send-login-link'),
        submitLoading: input.model.submission.type === 'loading',
        submitDisabled: false,
        cancelText: input.ctx.t('app.cancel'),
        onCancel: () => {
          input.dispatch({
            t: 'clicked-back',
          })
        },
        cancelDisabled: false,
      }}
      renderBody={() => (
        <div className='flex flex-col gap-6 p-4'>
          <TextField
            autoFocus
            id='email-address'
            type='email'
            label={input.ctx.t('auth-email.email-address')}
            value={input.model.emailAddress}
            onChange={(emailAddress) => {
              input.dispatch({
                t: 'inputted-email-address',
                emailAddress,
              })
            }}
            onClear={() =>
              input.dispatch({
                t: 'inputted-email-address',
                emailAddress: '',
              })
            }
            error={input.model.validation === 'invalid-email'}
            helperText={
              input.model.validation === 'invalid-email'
                ? input.ctx.t('auth-email.please-enter-valid-email-address')
                : undefined
            }
          />

          {input.model.submission.type === 'problem' && <AlertError text={input.model.submission.message} />}

          {input.model.submission.type === 'ok' && (
            <AlertSuccess>
              <div className='flex flex-col gap-1'>
                <div className='text-lg'>Check your email</div>
                <div className='font-light'>
                  Login link was send to{' '}
                  <span className='font-semibold text-white'>{input.model.submission.sentToEmailAddress}</span>
                </div>
              </div>
            </AlertSuccess>
          )}
        </div>
      )}
    />
  )
}
