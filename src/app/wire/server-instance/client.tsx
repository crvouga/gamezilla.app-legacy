import { Sub } from '~/@/sub'
import type { ClientModule } from './types'

const init: ClientModule['init'] = (_input) => {
  return { model: { t: 'noop' } }
}

const update: ClientModule['update'] = (input) => {
  return { model: input.model }
}

const subscriptions: ClientModule['subscriptions'] = () => {
  return Sub.None
}

const View: ClientModule['View'] = (_input) => {
  return null
}

export const ServerInstanceClient = {
  init,
  update,
  subscriptions,
  View,
}
