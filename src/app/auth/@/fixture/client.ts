import { FixtureAppClient } from '~/app/@/client/fixture'
import * as AuthClient from '../../client'

export const FixtureAuthClient = async () => {
  const f = await FixtureAppClient()
  const initial = AuthClient.init({ ctx: f.ctx })
  return {
    ...f,
    initial,
  }
}
