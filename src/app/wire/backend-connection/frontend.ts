import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Clickable } from '~/@/ui/clickable'
import { ListItemButton } from '~/@/ui/list-item-button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { BackendConnectionStatus } from './connection-status'
import { PingId } from './ping-id'
import { toPingRate } from './ping-rate'
import { FrontendModule, initModel, Model, MsgFrontend, PingItem } from './types'
import { Dot } from './ui'

const init: FrontendModule['init'] = (_input) => {
  const model = initModel()

  return {
    model: model,
  }
}

const update: FrontendModule['update'] = (input) => {
  const { msg, model } = input

  if (!msg) return { model }

  switch (msg.t) {
    case 'ping': {
      const pingNew: PingItem = { pingId: msg.pingId, pingAt: msg.now, pongAt: null }

      const pingsNew = CappedOrderedDict.add(model.pings, msg.pingId, pingNew)

      const modelNew: Model = { ...model, pings: pingsNew }

      return {
        model: modelNew,
        eff: () => {
          input.ctx.topic.ping.pub(input.ctx.clientSessionId, { pingId: msg.pingId })
        },
      }
    }

    case 'pong': {
      const ping = CappedOrderedDict.get(model.pings, msg.pingId)

      if (!ping) return { model }

      const pingNew: PingItem = { ...ping, pongAt: msg.now }

      const pingsNew = CappedOrderedDict.set(model.pings, msg.pingId, pingNew)

      const modelNew: Model = { ...model, pings: pingsNew }

      return { model: modelNew }
    }
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([pings(input), pongs(input)])
}

const pings: FrontendModule['subscriptions'] = (input) => {
  const pingRate = toPingRate(input.model)
  return Time.interval('pings', pingRate, (now): MsgFrontend => ({ t: 'ping', now, pingId: PingId.generate() }))
}

const pongs: FrontendModule['subscriptions'] = (input) => {
  return input.ctx.topic.pong.sub(
    input.ctx.clientSessionId,
    (msg): MsgFrontend => ({ t: 'pong', pingId: msg.pingId, now: UnixMs.now() }),
  )
}

const ViewDot = (input: { model: Model; ctx: AppFrontendCtxBase; class: string }) => {
  const status = BackendConnectionStatus.fromModel(input.model)
  return h(BackendConnectionStatus.ViewDot, { model: status, ctx: input.ctx, class: input.class })
}

const ViewListItem = (input: { model: Model; ctx: AppFrontendCtxBase; dispatch: (msg: MsgFrontend) => void }) => {
  return h(ViewListItemInner, input)
}

const ViewListItemInner: typeof ViewListItem = (input) => {
  const status = BackendConnectionStatus.fromModel(input.model)
  switch (status.t) {
    case 'connected': {
      return h(ListItemButton, {
        icon: (inputIcon) => h(Dot, { class: inputIcon.class, colorClassName: 'bg-green-500' }),
        class: 'text-green-500',
        label: input.ctx.t('wire.online'),
        end: () => h(Typography, { text: TimeSpan.format(status.latestPing) }),
      })
    }

    case 'connecting': {
      return h(ListItemButton, {
        icon: (input) => h(Dot, { class: input.class, colorClassName: 'bg-orange-500' }),
        color: 'warning',
        label: input.ctx.t('wire.connecting...'),
      })
    }

    case 'disconnected': {
      return h(ListItemButton, {
        icon: (input) => h(Dot, { class: input.class, colorClassName: 'bg-red-500' }),
        color: 'danger',
        label: input.ctx.t('wire.offline'),
        end: () =>
          h(
            Clickable,
            {
              type: 'button',
              onClick: () => {},
              class: 'font-bold text-red-500',
            },
            [input.ctx.t('wire.try-reconnect')],
          ),
      })
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
