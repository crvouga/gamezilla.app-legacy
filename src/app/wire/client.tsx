import { andThen } from '~/@/update/and-then'
import { Translator } from '~/@/l18n/generated'
import { ListItemButton, Typography, cn } from '../@/ui'
import { ServerInstanceClient } from './server-instance/client'
import type { IClientTransport } from './transport/client'
import type { ClientCtx, ModelClient, MsgClient, MsgToClient } from './types'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { AppClientCmd, showToast } from '../@/client/cmd'
import { ClientEvt } from '../@/client/evt'

//
//
//
// Model
//
//
//

export const init = (input: { ctx: ClientCtx; stored: Record<string, unknown> | null }): { model: ModelClient } => {
  const serverInstance = ServerInstanceClient.init({
    ctx: { ...input.ctx, rpc: input.ctx.rpc.serverInstance },
  })
  return {
    model: {
      state: {
        t: 'server-connecting',
      },
      serverTime: null,
      serverInstance: serverInstance.model,
    },
  }
}

//
//
//
//  Update
//
//
//

type Output = {
  model: ModelClient
  msgEvt?: ClientEvt[]
  eff?: Eff<MsgClient>
}

export const update = <TMsgToClient extends Record<string, unknown>, TMsgToServer extends Record<string, unknown>>({
  msg,
  msgServer,
  msgCmd,
  model,
  ctx,
  transport,
}: {
  ctx: {
    t: Translator
  }
  msg?: MsgClient | null
  msgServer?: MsgToClient | null
  msgCmd?: AppClientCmd<{
    MsgClient: MsgClient
    MsgToServer: TMsgToServer
  }> | null
  model: ModelClient
  transport: IClientTransport<{
    MsgToServer: TMsgToServer
    MsgToClient: TMsgToClient
  }>
}): Output => {
  return andThen<ModelClient, Output>(
    { model },
    (model) => updateFromMsg({ ctx, msg, model, transport }),
    (model) => updateFromServer({ ctx, model, msgServer, transport }),
    (model) => updateFromCmd({ ctx, msgCmd, model, transport }),
  )
}

const updateFromMsg: typeof update = ({ msg, model, transport }) => {
  if (!msg) {
    return { model }
  }

  switch (msg.t) {
    case 'got-server-instance-msg': {
      return { model }
    }

    case 'server-connect-error': {
      return {
        model: {
          ...model,
          state: {
            t: 'server-connect-error',
            errorCount: model.state.t === 'server-connect-error' ? model.state.errorCount + 1 : 1,
          },
        },
      }
    }

    case 'server-connected': {
      return {
        model: {
          ...model,
          state: {
            t: 'server-connected',
          },
        },
        msgEvt: [
          {
            t: 'wire-evt.server-connected',
          },
        ],
      }
    }

    case 'server-disconnected': {
      return {
        model: {
          ...model,
          state: {
            t: msg.t,
          },
        },
      }
    }

    case 'clicked-try-reconnect': {
      return {
        model: {
          ...model,
          state: {
            t: 'server-connecting',
          },
        },
        eff: () => {
          transport.msgCmd.pub({
            t: 'try-reconnect',
          })
        },
      }
    }

    case 'got-bad-msgs': {
      switch (msg.reason) {
        case 'codebase-version-mismatch': {
          return {
            model,
          }
        }
      }
    }

    case 'sent-to-server': {
      return { model }
    }
  }
}

const updateFromServer: typeof update = ({ ctx, model, msgServer }) => {
  if (!msgServer) {
    return { model }
  }

  switch (msgServer.t) {
    case 'got-server-instance-msg': {
      return { model }
    }
    case 'server-restarted': {
      return {
        model,
        msgCmd: [showToast(ctx.t('wire.server-restarted'))],
      }
    }
  }
}

const updateFromCmd: typeof update = ({ msgCmd, model, transport }) => {
  if (!msgCmd) {
    return { model }
  }

  const wireCmd = msgCmd.c

  switch (wireCmd.t) {
    case 'send-to-server': {
      return {
        model,
        eff(dispatch) {
          if (wireCmd.toServer) {
            transport.toServer.pub([wireCmd.toServer])
            dispatch({
              t: 'sent-to-server',
              toServer: wireCmd.toServer,
            })
          }
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
// View
//
//
//

export const ViewStatusBar = (input: { model: ModelClient; ctx: { t: Translator } }) => {
  switch (input.model.state.t) {
    case 'server-connected': {
      return <span className='h-2 w-2 rounded-full bg-green-500' />
    }

    case 'server-connecting':
    case 'server-connect-error': {
      return (
        <div className='flex animate-pulse items-center gap-1'>
          <span className='h-2 w-2 rounded-full bg-orange-500' />
          <Typography className='text-orange-500' variant='caption' text={input.ctx.t('wire.connecting...')} />
        </div>
      )
    }

    case 'server-disconnected': {
      return (
        <div className='flex items-center gap-1'>
          <span className='h-2 w-2 rounded-full bg-red-500' />

          <Typography className='text-orange-500' variant='caption' text={input.ctx.t('wire.offline')} />
        </div>
      )
    }
  }
}

export const ViewStatusBarDrawer = (input: {
  model: ModelClient
  dispatch: (m: MsgClient) => void
  ctx: {
    t: Translator
  }
}) => {
  switch (input.model.state.t) {
    case 'server-connected': {
      return (
        <ListItemButton
          icon={(inputIcon) => <span className={cn(inputIcon.className, 'rounded-full bg-green-500')} />}
          className='text-green-500'
          label={input.ctx.t('wire.online')}
        />
      )
    }

    case 'server-connect-error':
    case 'server-connecting': {
      return (
        <ListItemButton
          icon={(input) => <span className={cn(input.className, 'rounded-full bg-orange-500')} />}
          color='warning'
          label={input.ctx.t('wire.connecting...')}
        />
      )
    }

    case 'server-disconnected': {
      return (
        <ListItemButton
          icon={(input) => <span className={cn(input.className, 'rounded-full bg-red-500')} />}
          color='danger'
          label={input.ctx.t('wire.offline')}
          end={() => (
            <button
              type='button'
              onClick={() =>
                input.dispatch({
                  t: 'clicked-try-reconnect',
                })
              }
              className='font-bold text-red-500'
            >
              {input.ctx.t('wire.try-reconnect')}
            </button>
          )}
        />
      )
    }
  }
}

//
//
//
//
//
//

export const subscriptions = <MsgToServer, MsgToClient>({
  transport,
}: {
  transport: IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
}): Sub<MsgClient> => {
  return transport.msgEvt
}
