import { Eff } from '~/@/eff'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { andThen } from '~/@/update/and-then'
import { AppFrontendCmd, showToast } from '../@/frontend/cmd'
import { AppFrontendEvt } from '../@/frontend/evt'
import { BackendInstanceFrontend } from './backend-instance/frontend'
import type { IFrontendTransport } from './transport/frontend'
import type { FrontendCtx, ModelFrontend, MsgFrontend, MsgToFrontend } from './types'
import { ListItemButton } from '~/@/ui/list-item-button'
import { cn } from '~/@/ui/cn'

//
//
//
// Model
//
//
//

export const init = (input: { ctx: FrontendCtx; stored: Record<string, unknown> | null }): { model: ModelFrontend } => {
  const backendInstance = BackendInstanceFrontend.init({
    ctx: { ...input.ctx, rpc: input.ctx.rpc.backendInstance },
  })
  return {
    model: {
      state: {
        t: 'backend-connecting',
      },
      backendTime: null,
      backendInstance: backendInstance.model,
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
  model: ModelFrontend
  msgEvt?: AppFrontendEvt[]
  eff?: Eff<MsgFrontend>
}

export const update = <TMsgToFrontend extends Record<string, unknown>, TMsgToBackend extends Record<string, unknown>>({
  msg,
  msgBackend,
  msgCmd,
  model,
  ctx,
  transport,
}: {
  ctx: {
    t: Translator
  }
  msg?: MsgFrontend | null
  msgBackend?: MsgToFrontend | null
  msgCmd?: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: TMsgToBackend
  }> | null
  model: ModelFrontend
  transport: IFrontendTransport<{
    MsgToBackend: TMsgToBackend
    MsgToFrontend: TMsgToFrontend
  }>
}): Output => {
  if (!msg && !msgBackend && !msgCmd) {
    return { model }
  }

  return andThen<ModelFrontend, Output>(
    { model },
    (model) => updateFromMsg({ ctx, msg, model, transport }),
    (model) => updateFromBackend({ ctx, model, msgBackend, transport }),
    (model) => updateFromCmd({ ctx, msgCmd, model, transport }),
  )
}

const updateFromMsg: typeof update = ({ msg, model, transport }) => {
  if (!msg) {
    return { model }
  }

  switch (msg.t) {
    case 'got-backend-instance-msg': {
      return { model }
    }

    case 'backend-connect-error': {
      return {
        model: {
          ...model,
          state: {
            t: 'backend-connect-error',
            errorCount: model.state.t === 'backend-connect-error' ? model.state.errorCount + 1 : 1,
          },
        },
      }
    }

    case 'backend-connected': {
      return {
        model: {
          ...model,
          state: {
            t: 'backend-connected',
          },
        },
        msgEvt: [
          {
            t: 'wire-evt.backend-connected',
          },
        ],
      }
    }

    case 'backend-disconnected': {
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
            t: 'backend-connecting',
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

    case 'sent-to-backend': {
      return { model }
    }
  }
}

const updateFromBackend: typeof update = ({ ctx, model, msgBackend }) => {
  if (!msgBackend) {
    return { model }
  }

  switch (msgBackend.t) {
    case 'got-backend-instance-msg': {
      return { model }
    }
    case 'backend-restarted': {
      return {
        model,
        msgCmd: [showToast(ctx.t('wire.backend-restarted'))],
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
    case 'send-to-backend': {
      return {
        model,
        eff(dispatch) {
          if (wireCmd.toBackend) {
            transport.toBackend.pub([wireCmd.toBackend])
            dispatch({
              t: 'sent-to-backend',
              toBackend: wireCmd.toBackend,
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

const Dot = (input: { className: string; colorClassName: string }) => {
  return (
    <div className={cn(input.className, 'aspect-square shrink-0 p-[1px]')}>
      <div className={cn(input.colorClassName, 'h-full w-full shrink-0 rounded-full')} />
    </div>
  )
}

export const ViewDot = (input: { model: ModelFrontend; ctx: { t: Translator }; className: string }) => {
  switch (input.model.state.t) {
    case 'backend-connected': {
      return <Dot className={input.className} colorClassName='bg-green-500' />
    }

    case 'backend-connecting':
    case 'backend-connect-error': {
      return <Dot className={input.className} colorClassName='animate-pulse bg-orange-500' />
    }

    case 'backend-disconnected': {
      return <Dot className={input.className} colorClassName='bg-red-500' />
    }
  }
}

export const ViewConnectionStatusListItem = (input: {
  model: ModelFrontend
  dispatch: (m: MsgFrontend) => void
  ctx: {
    t: Translator
  }
}) => {
  switch (input.model.state.t) {
    case 'backend-connected': {
      return (
        <ListItemButton
          icon={(inputIcon) => <Dot className={inputIcon.className} colorClassName='bg-green-500' />}
          className='text-green-500'
          label={input.ctx.t('wire.online')}
        />
      )
    }

    case 'backend-connect-error':
    case 'backend-connecting': {
      return (
        <ListItemButton
          icon={(input) => <Dot className={input.className} colorClassName='bg-orange-500' />}
          color='warning'
          label={input.ctx.t('wire.connecting...')}
        />
      )
    }

    case 'backend-disconnected': {
      return (
        <ListItemButton
          icon={(input) => <Dot className={input.className} colorClassName='bg-red-500' />}
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

export const subscriptions = <MsgToBackend, MsgToFrontend>({
  transport,
}: {
  transport: IFrontendTransport<{
    MsgToBackend: MsgToBackend
    MsgToFrontend: MsgToFrontend
  }>
}): Sub<MsgFrontend> => {
  return transport.msgEvt
}
