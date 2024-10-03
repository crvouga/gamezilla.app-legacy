import { FixtureAppClient } from 'gamezilla-app/app/@/client/client-test-env'
import * as AuthClient from '../../auth.client'

export const FixtureAuthClient = async () => {
  const f = await FixtureAppClient()
  const initial = AuthClient.init({ ctx: f.ctx })
  return {
    ...f,
    initial
  }
}
