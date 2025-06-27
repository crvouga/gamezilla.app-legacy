import { FixtureAppFrontend } from '~/app/@/frontend/fixture'

export const FixtureAuthFrontend = async (...params: Parameters<typeof FixtureAppFrontend>) => {
  const f = await FixtureAppFrontend(...params)

  return {
    ...f,
  }
}
