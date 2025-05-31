import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { AuthBackendCtx } from './ctx'

export const FixtureAuthBackend = async (...params: Parameters<typeof FixtureAppBackend>) => {
  const f = await FixtureAppBackend(...params)
  const ctx = await AuthBackendCtx.initUnitTest({
    ctx: f.ctx,
  })

  return {
    ...f,
    ctx,
  }
}
