import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import type { TimeCmd } from '../../@/frontend/cmd'

export type Model = {
  t: 'noop'
}

export const init = (): { model: Model } => {
  return {
    model: {
      t: 'noop',
    },
  }
}

export type Msg = { t: 'noop' }

export const update = <TParentMsg>({
  msg,
  model,
  msgCmd,
}: {
  msgCmd?: TimeCmd<TParentMsg> | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  parentEff?: Eff<TParentMsg>
  eff?: Eff<Msg>
} => {
  if (msg) return updateFromMsg({ msg, model })

  if (msgCmd) return updateFromCmd({ msgCmd, model })

  return { model }
}

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) return { model }
  return { model }
}

const updateFromCmd: typeof update = ({ msgCmd, model }) => {
  if (!msgCmd) return { model }

  const cmd = msgCmd.c

  switch (cmd.t) {
    case 'start-timeout': {
      return {
        model,
        parentEff: Time.startTimeout(cmd.timeoutId, cmd.duration, cmd.msg),
      }
    }

    case 'cancel-timeout': {
      return {
        model,
        parentEff: Time.cancelTimeout(cmd.timeoutId),
      }
    }

    default: {
      return { model }
    }
  }
}

export const subscriptions: Sub<Msg> = Sub.None
