import { describe, expect, test } from 'bun:test'
import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
import { DrawerEditPackNameFrontend } from './frontend'
import { MsgFrontend } from '../types'

export const Fixture = async () => {
  const f = await FixturePackBuilderFrontend()
  const renderMsgs: MsgFrontend[] = []
  const dispatch = (msg: MsgFrontend) => {
    renderMsgs.push(msg)
  }
  return { ...f, renderMsgs, dispatch }
}

describe(import.meta.file, () => {
  test('close drawer', async () => {
    const f = await Fixture()
    const r = f.render(
      <DrawerEditPackNameFrontend.ViewDrawer
        {...f}
        modelSpace={{ ...f.modelSpace, opened: 'edit-pack-name-drawer' }}
      />,
    )
    const closeButton = r
      .getByRole('dialog', f.ctx.t('app.edit-name'))[0]
      ?.getByRole('button', f.ctx.t('drawer.close'))[0]
    await closeButton?.click()
    expect(f.renderMsgs[0]).toEqual({
      t: 'got-msg-space',
      c: { t: 'edit-pack-name.user-closed-drawer', userId: f.hostId },
    })
  })
})
