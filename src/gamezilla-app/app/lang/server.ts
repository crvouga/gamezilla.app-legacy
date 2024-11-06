import { Sub } from 'gamezilla-app/@/core'
import type { ServerModule } from './types'

export const update: ServerModule['update'] = async () => {
  return {}
}

export const subscriptions: ServerModule['subscriptions'] = async () => {
  return Sub.None
}

export const initDeps: ServerModule['initDeps'] = async () => {
  return null
}
