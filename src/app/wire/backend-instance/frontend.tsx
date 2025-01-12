import { Sub } from '~/@/sub'
import type { FrontendModule } from './types'

const init: FrontendModule['init'] = (_input) => {
  return { model: { t: 'noop' } }
}

const update: FrontendModule['update'] = (input) => {
  return { model: input.model }
}

const subscriptions: FrontendModule['subscriptions'] = () => {
  return Sub.None
}

const View: FrontendModule['View'] = (_input) => {
  return null
}

export const BackendInstanceFrontend = {
  init,
  update,
  subscriptions,
  View,
}
