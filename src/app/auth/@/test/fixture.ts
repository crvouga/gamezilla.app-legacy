import { FixtureApp } from '~/app/@/test/fixture'

export const FixtureAuth = async () => {
  const f = await FixtureApp()

  return {
    ...f,
  }
}
