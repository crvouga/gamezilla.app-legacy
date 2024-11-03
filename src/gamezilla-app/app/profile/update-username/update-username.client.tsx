import { RequestResponse } from 'gamezilla-app/@/core'
import {
  AnonymousClientCtx,
  ClientCmd,
  AppClientCtx,
  ClientEvt,
  pushRoute,
  sendToServer
} from 'gamezilla-app/app/@/client'
import { Button, TextField, TopBar } from 'gamezilla-app/app/@/ui'
import { ModelClient, MsgClient, MsgToServer } from './update-username.types'

export const init = <TModel extends ModelClient>(input: {
  ctx: AppClientCtx | AnonymousClientCtx
  model: TModel
}): { model: TModel } => {
  return {
    model: {
      ...input.model,
      'profile.update-username.username': input.ctx.currentUserId
        ? input.ctx.profiles[input.ctx.currentUserId]?.username ?? ''
        : ''
    }
  }
}

const isMsgClient = (msg?: { t: string } | null): msg is MsgClient => {
  return Boolean(msg?.t.startsWith('profile.update-username'))
}

export const update = <TModel extends ModelClient, TMsg extends { t: string }>(input: {
  msg?: TMsg | null
  model: TModel
  msgEvt?: ClientEvt | null
  ctx: AppClientCtx | AnonymousClientCtx
}): {
  model: TModel
  msgCmd?: ClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
} => {
  if (isMsgClient(input.msg)) {
    switch (input.msg?.t) {
      case 'profile.update-username.clicked-back': {
        return {
          model: input.model,
          msgCmd: [pushRoute({ t: 'profile-edit', n: 'profile' })]
        }
      }

      case 'profile.update-username.clicked-save': {
        return {
          model: {
            ...input.model,
            'profile-update-username.request': RequestResponse.startedRequest(input.ctx.now)
          },
          msgCmd: [
            sendToServer({
              t: 'profile.update-username.clicked-save',
              username: input.model['profile.update-username.username'] ?? ''
            })
          ]
        }
      }

      case 'profile.update-username.inputted-username': {
        return {
          model: {
            ...input.model,
            'profile.update-username.username': input.msg.username
          }
        }
      }
    }
  }

  switch (input.msgEvt?.t) {
    case 'profile/current-user-profile': {
      return init({ ctx: input.ctx, model: input.model })
    }

    case 'routing/route-changed': {
      if (input.msgEvt.route.t === 'profile-edit-username') {
        return init({ ctx: input.ctx, model: input.model })
      }
      return { model: input.model }
    }
  }

  return { model: input.model }
}

export const View = (input: {
  model: ModelClient
  ctx: AppClientCtx | AnonymousClientCtx
  dispatch: (m: MsgClient) => void
}) => {
  return (
    <div className='flex flex-col'>
      <TopBar
        ctx={input.ctx}
        center
        onBack={() => input.dispatch({ t: 'profile.update-username.clicked-back' })}
        title={input.ctx.t('profile.update-username.update-username')}
      />
      <div className='flex w-full flex-col gap-4 p-4'>
        <TextField
          id='username'
          label={input.ctx.t('username-title')}
          value={input.model['profile.update-username.username']}
          onChange={(username) => input.dispatch({ t: 'profile.update-username.inputted-username', username })}
        />
        <div className='w-full pt-4'>
          <Button
            text={input.ctx.t('app.save')}
            className='w-full'
            loading={input.model['profile-update-username.request']?.t === 'loading'}
            onClick={() => input.dispatch({ t: 'profile.update-username.clicked-save' })}
          />
        </div>
      </div>
    </div>
  )
}
