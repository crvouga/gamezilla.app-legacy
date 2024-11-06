import { Sub } from 'gamezilla-app/@/core'
import type { ClientModule } from './types'

export const init: ClientModule['init'] = (_input) => {
  return { model: { t: 'noop' } }
}

export const update: ClientModule['update'] = (input) => {
  return { model: input.model }
}

export const subscriptions: ClientModule['subscriptions'] = () => {
  return Sub.None
}

export const View: ClientModule['View'] = (_input) => {
  return null
}
