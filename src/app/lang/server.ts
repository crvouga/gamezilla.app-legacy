import type { ServerModule } from './types'

export const update: ServerModule['update'] = async () => {
  return {}
}

export const initDeps: ServerModule['initDeps'] = async () => {
  return null
}
