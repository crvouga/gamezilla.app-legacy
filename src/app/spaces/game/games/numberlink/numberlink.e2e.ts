import { test } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/app-fixture'
import { doLoginWithSms } from '~/app/@/test/flows/do-login-with-sms'
import { doStartSpace } from '~/app/@/test/flows/do-start-space'
import { doOpenNumberlink } from './@/flows/do-open-numberlink'

const Fixture = FixtureAppE2E

test('open game', async (e) => {
  const f = await Fixture(e)
  await doLoginWithSms(f)
  await doStartSpace(f)
  await doOpenNumberlink(f)
})
