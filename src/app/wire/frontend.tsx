import { Eff } from '~/@/eff'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { cn } from '~/@/ui/cn'
import { ListItemButton } from '~/@/ui/list-item-button'
import { BackendInstanceFrontend } from './backend-instance/frontend'
import type { FrontendCtx, ModelFrontend, MsgFrontend } from './types'

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

export const update = (input: {
  ctx: {
    t: Translator
  }
  msg?: MsgFrontend | null
  model: ModelFrontend
  msgIn?: unknown | null
}): {
  model: ModelFrontend
  msgOut?: unknown[]
  eff?: Eff<MsgFrontend>
} => {
  return {
    model: input.model,
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

export const subscriptions = (_: {}): Sub<MsgFrontend> => {
  return Sub.None
}
