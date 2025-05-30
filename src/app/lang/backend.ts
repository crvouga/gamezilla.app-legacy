import type { BackendModule } from './types'

const update: BackendModule['update'] = async () => {
  return {}
}

export const LangBackend = {
  update,
}
