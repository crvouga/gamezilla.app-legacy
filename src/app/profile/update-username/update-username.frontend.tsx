import { RequestResponse } from '~/@/request-response/request-response'
import { AppFrontendCmd, pushScreen, sendToBackend } from '~/app/@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { FrontendEvt } from '~/app/@/frontend/evt'
import { TextField } from '~/app/@/ui'
import { ScreenLayout } from '~/app/@/ui/screen'
import { ModelFrontend, MsgFrontend, MsgToBackend } from './update-username.types'

export const init = <TModel extends ModelFrontend>(input: {
  ctx: AppFrontendCtx | AnonymousFrontendCtx
  model: TModel
}): { model: TModel } => {
  return {
    model: {
      ...input.model,
      'profile.update-username.username': input.ctx.currentUserId
        ? (input.ctx.profiles[input.ctx.currentUserId]?.username ?? '')
        : '',
    },
  }
}

const isMsgFrontend = (msg?: { t: string } | null): msg is MsgFrontend => {
  return Boolean(msg?.t.startsWith('profile.update-username'))
}

export const update = <TModel extends ModelFrontend, TMsg extends { t: string }>(input: {
  msg?: TMsg | null
  model: TModel
  msgEvt?: FrontendEvt | null
  ctx: AppFrontendCtx | AnonymousFrontendCtx
}): {
  model: TModel
  msgCmd?: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>[]
} => {
  if (isMsgFrontend(input.msg)) {
    switch (input.msg?.t) {
      case 'profile.update-username.clicked-back': {
        return {
          model: input.model,
          msgCmd: [pushScreen({ t: 'profile-edit', n: 'profile' })],
        }
      }

      case 'profile.update-username.clicked-save': {
        return {
          model: {
            ...input.model,
            'profile-update-username.request': RequestResponse.startedRequest(input.ctx.now),
          },
          msgCmd: [
            sendToBackend({
              t: 'profile.update-username.clicked-save',
              username: input.model['profile.update-username.username'] ?? '',
            }),
          ],
        }
      }

      case 'profile.update-username.inputted-username': {
        return {
          model: {
            ...input.model,
            'profile.update-username.username': input.msg.username,
          },
        }
      }
    }
  }

  switch (input.msgEvt?.t) {
    case 'profile-evt.current-user-profile': {
      return init({ ctx: input.ctx, model: input.model })
    }

    case 'screen-evt.screen-changed': {
      if (input.msgEvt.screen.t === 'profile-edit-username') {
        return init({ ctx: input.ctx, model: input.model })
      }
      return { model: input.model }
    }
  }

  return { model: input.model }
}

export const View = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtx | AnonymousFrontendCtx
  dispatch: (m: MsgFrontend) => void
}) => {
  return (
    <ScreenLayout
      id='profile-update-username'
      ctx={input.ctx}
      topBar={{
        title: input.ctx.t('profile.update-username.update-username'),
        onBack: () => input.dispatch({ t: 'profile.update-username.clicked-back' }),
      }}
      form={{
        onSubmit: () => input.dispatch({ t: 'profile.update-username.clicked-save' }),
        submitText: input.ctx.t('app.save'),
        cancelText: input.ctx.t('app.cancel'),
        onCancel: () => input.dispatch({ t: 'profile.update-username.clicked-back' }),
        submitLoading: input.model['profile-update-username.request']?.t === 'loading',
        submitDisabled: false,
        cancelDisabled: false,
      }}
      main={
        <div className='flex w-full flex-col gap-4 p-4'>
          <TextField
            id='username'
            label={input.ctx.t('username-title')}
            value={input.model['profile.update-username.username'] ?? ''}
            onChange={(username) => input.dispatch({ t: 'profile.update-username.inputted-username', username })}
          />
        </div>
      }
    />
  )
}
