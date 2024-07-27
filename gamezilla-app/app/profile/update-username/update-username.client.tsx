import { RequestResponse } from 'gamezilla-app/@/core'
import { AnonymousClientCtx, ClientCmd, ClientCtx, pushRoute, sendToServer } from 'gamezilla-app/app/@/client'
import { Button, TextField, TopBar } from 'gamezilla-app/app/@/ui'
import { isMsgClient, ModelClient, MsgClient, MsgToServer } from './update-username.types'

export const init = (input: { ctx: ClientCtx | AnonymousClientCtx }): { model: ModelClient } => {
  return {
    model: {
      'profile.update-username.username': input.ctx.currentUserId
        ? input.ctx.profiles[input.ctx.currentUserId]?.username ?? ''
        : ''
    }
  }
}

export const update = <TModel extends ModelClient, TMsg>(input: {
  msg: TMsg
  model: TModel
  ctx: ClientCtx | AnonymousClientCtx
}): {
  model: TModel
  msgCmd?: ClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
} => {
  if (!isMsgClient(input.msg)) {
    return { model: input.model }
  }

  switch (input.msg.t) {
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
            username: input.model['profile.update-username.username']
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
}

export const View = (input: {
  model: ModelClient
  ctx: ClientCtx | AnonymousClientCtx
  dispatch: (m: MsgClient) => void
}) => {
  return (
    <div>
      <TopBar
        ctx={input.ctx}
        onBack={() => input.dispatch({ n: 'profile.update-username', t: 'clicked-back' })}
        title={input.ctx.t('profile.update-username.update-username')}
      />
      <TextField
        id='username'
        label={input.ctx.t('username-title')}
        value={input.model['profile.update-username.username']}
        onChange={(username) => input.dispatch({ n: 'profile.update-username', t: 'inputted-username', username })}
      />
      <Button
        text={input.ctx.t('app.save')}
        className='w-full'
        onClick={() => input.dispatch({ n: 'profile.update-username', t: 'clicked-save' })}
      />
    </div>
  )
}
