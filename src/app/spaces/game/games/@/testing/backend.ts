import { FixtureAppBackend } from '~/app/@/backend/fixture'

export const SpaceGameFixtureBackend = async () => {
  const f = await FixtureAppBackend()

  return f
}
