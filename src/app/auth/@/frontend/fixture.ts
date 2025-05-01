import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { AuthFrontendCtx } from './ctx'

export const FixtureAuthFrontend = async (...params: Parameters<typeof FixtureAppFrontend>) => {
  const f = await FixtureAppFrontend(...params)
  const ctx = await AuthFrontendCtx.init({
    ctx: f.ctx,
  })

  return {
    ...f,
    ctx,
  }
}
