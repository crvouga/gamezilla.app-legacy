import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { Clickable } from '~/@/ui/clickable'
import { ListItemButton } from '~/@/ui/list-item-button'
import { Typography } from '~/@/ui/typography'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { BackendConnectionStatus } from './connection-status'
import { PingId } from './ping-id'
import { FrontendModule, initModel, Model, MsgFrontend, PingItem } from './types'
import { Dot } from './ui'

const init: FrontendModule['init'] = (_input) => {
  return {
    model: initModel(),
  }
}
const update: FrontendModule['update'] = (input) => {
  const { msg, model } = input

  if (!msg) return { model }

  switch (msg.t) {
    case 'wire.backend-connection.ping': {
      return {
        model: {
          ...model,
          pings: CappedOrderedDict.add(model.pings, msg.pingId, {
            pingId: msg.pingId,
            pingAt: msg.now,
            pongAt: null,
          }),
        },
        eff: () => {
          input.ctx.topic['wire.ping'].publish(null, { pingId: msg.pingId })
        },
      }
    }

    case 'wire.backend-connection.pong': {
      const ping = CappedOrderedDict.get(model.pings, msg.pingId)

      if (!ping) return { model }

      const pingNew: PingItem = { ...ping, pongAt: msg.now }

      const pingsNew = CappedOrderedDict.set(model.pings, msg.pingId, pingNew)

      return { model: { ...model, pings: pingsNew } }
    }
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([pings(input), pongs(input)])
}

const pings: FrontendModule['subscriptions'] = (input) => {
  return Time.interval(
    'pings',
    input.model['pingRate'],
    (now): MsgFrontend => ({ t: 'wire.backend-connection.ping', now, pingId: PingId.generate() }),
  )
}

const pongs: FrontendModule['subscriptions'] = (input) => {
  return input.ctx.topic['wire.pong'].subscribe(
    input.ctx.clientSessionId,
    (msg): MsgFrontend => ({ t: 'wire.backend-connection.pong', pingId: msg.pingId, now: Posix.now() }),
  )
}

const ViewDot = (input: { model: Model; ctx: AppFrontendCtxBase; className: string }) => {
  const status = BackendConnectionStatus.fromModel(input.model)
  return <BackendConnectionStatus.ViewDot model={status} ctx={input.ctx} className={input.className} />
}

const ViewListItem = (input: { model: Model; ctx: AppFrontendCtxBase; dispatch: (msg: MsgFrontend) => void }) => {
  return (
    <div>
      <ViewListItemInner {...input} />
    </div>
  )
}

const ViewListItemInner: typeof ViewListItem = (input) => {
  const status = BackendConnectionStatus.fromModel(input.model)
  switch (status.t) {
    case 'connected': {
      return (
        <ListItemButton
          icon={(inputIcon) => <Dot className={inputIcon.className} colorClassName='bg-green-500' />}
          className='text-green-500'
          label={input.ctx.t('wire.online')}
          end={() => <Typography text={TimeSpan.format(status.averagePing)} />}
        />
      )
    }

    case 'connecting': {
      return (
        <ListItemButton
          icon={(input) => <Dot className={input.className} colorClassName='bg-orange-500' />}
          color='warning'
          label={input.ctx.t('wire.connecting...')}
        />
      )
    }

    case 'disconnected': {
      return (
        <ListItemButton
          icon={(input) => <Dot className={input.className} colorClassName='bg-red-500' />}
          color='danger'
          label={input.ctx.t('wire.offline')}
          end={() => (
            <Clickable type='button' onClick={() => {}} className='font-bold text-red-500'>
              {input.ctx.t('wire.try-reconnect')}
            </Clickable>
          )}
        />
      )
    }
  }
}

export const BackendConnectionFrontend = {
  subscriptions,
  update,
  init,
  ViewListItem,
  ViewDot,
}
