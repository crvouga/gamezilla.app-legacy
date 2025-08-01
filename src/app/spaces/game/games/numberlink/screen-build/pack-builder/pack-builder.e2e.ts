import { test } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/app-fixture'
import { doLoginWithSms } from '~/app/@/test/flows/do-login-with-sms'
import { doStartSpace } from '~/app/@/test/flows/do-start-space'
import { doOpenNumberlink } from '../../@/test/do-open-numberlink'
import { doOpenNumberlinkBuild } from '../@/test/do-open-numberlink-build'
import { doOpenPackBuilder } from './@/flows/do-open-pack-builder'
import { doCreateNewPack } from './@/flows/do-create-new-pack'

const Fixture = FixtureAppE2E

test('open', async (e) => {
  const f = await Fixture(e)
  await doLoginWithSms(f)
  await doStartSpace(f)
  await doOpenNumberlink(f)
  await doOpenNumberlinkBuild(f)
  await doOpenPackBuilder(f)
})

test.skip('create pack', async (e) => {
  const f = await Fixture(e)
  await doLoginWithSms(f)
  await doStartSpace(f)
  await doOpenNumberlink(f)
  await doOpenNumberlinkBuild(f)
  await doOpenPackBuilder(f)
  await doCreateNewPack(f)
})
