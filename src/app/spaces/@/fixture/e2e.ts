import { expect, TestRunnerEnv } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doLoginWithSms } from '~/app/@/test/flows/do-login-with-sms'
import { TEST_ID_SPACE_LIST_SCREEN } from '../../list-spaces/frontend'

export const FixtureSpacesE2E = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)

  await doLoginWithSms(f)

  const screen = await f.frontend.findByTestId(TEST_ID_SPACE_LIST_SCREEN)
  expect(screen).toBeTruthy()

  return {
    ...f,
  }
}
