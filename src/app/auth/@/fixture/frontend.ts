import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import * as AuthFrontend from '../../frontend'

export const FixtureAuthFrontend = async () => {
  const f = await FixtureAppFrontend()
  const initial = AuthFrontend.init({ ctx: f.ctx })
  return {
    ...f,
    initial,
  }
}
