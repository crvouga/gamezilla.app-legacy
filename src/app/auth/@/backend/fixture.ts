import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { BackendCtx } from './ctx'

export const FixtureAuthBackend = async (...params: Parameters<typeof FixtureAppBackend>) => {
  const f = await FixtureAppBackend(...params)
  const ctx = await BackendCtx.initUnitTest({
    ctx: f.ctx,
  })

  return {
    ...f,
    ctx,
  }
}
