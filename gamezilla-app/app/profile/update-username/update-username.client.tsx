import { RequestResponse } from 'gamezilla-app/@/core'
import {
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvt,
  pushRoute,
  sendToServer
} from 'gamezilla-app/app/@/client'
import { Button, TextField, TopBar } from 'gamezilla-app/app/@/ui'
import { ModelClient, MsgClient, MsgToServer } from './update-username.types'

export const init = <TModel extends ModelClient>(input: {
  ctx: ClientCtx | AnonymousClientCtx
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

export const update = <TModel extends ModelClient>(input: {
  msg?: MsgClient | null
  model: TModel
  msgEvt?: ClientEvt | null
  ctx: ClientCtx | AnonymousClientCtx
}): {
  model: TModel
  msgCmd?: ClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
} => {
  switch (input.msg?.t) {
    case 'clicked-back': {
      return {
        model: input.model,
        msgCmd: [pushRoute({ t: 'profile-edit', n: 'profile' })]
      }
    }

    case 'clicked-save': {
      return {
        model: {
          ...input.model,
          'profile-update-username.request': RequestResponse.startedRequest(input.ctx.now)
        },
        msgCmd: [
          sendToServer({
            n: 'profile.update-username',
            t: 'clicked-save',
            username: input.model['profile.update-username.username'] ?? ''
          })
        ]
      }
    }

    case 'inputted-username': {
      return {
        model: {
          ...input.model,
          'profile.update-username.username': input.msg.username
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
  ctx: ClientCtx | AnonymousClientCtx
  dispatch: (m: MsgClient) => void
}) => {
  return (
    <div className='flex flex-col'>
      <TopBar
        ctx={input.ctx}
        center
        onBack={() => input.dispatch({ n: 'profile.update-username', t: 'clicked-back' })}
        title={input.ctx.t('profile.update-username.update-username')}
      />
      <div className='flex w-full flex-col gap-4 p-4'>
        <TextField
          id='username'
          label={input.ctx.t('username-title')}
          value={input.model['profile.update-username.username']}
          onChange={(username) => input.dispatch({ n: 'profile.update-username', t: 'inputted-username', username })}
        />
        <div className='w-full pt-4'>
          <Button
            text={input.ctx.t('app.save')}
            className='w-full'
            loading={input.model['profile-update-username.request']?.t === 'loading'}
            onClick={() => input.dispatch({ n: 'profile.update-username', t: 'clicked-save' })}
          />
        </div>
      </div>
    </div>
  )
}
