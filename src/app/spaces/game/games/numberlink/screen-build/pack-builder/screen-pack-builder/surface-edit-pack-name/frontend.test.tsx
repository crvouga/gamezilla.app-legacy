import { describe, expect, test } from 'bun:test'
import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
import { EditPackNameFrontend } from './frontend'
import { MsgFrontend } from '../types'
import { withEventMeta } from '~/@/event-sourced/event'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'

export const Fixture = async () => {
  const f = await FixturePackBuilderFrontend()
  const renderMsgs: MsgFrontend[] = []
  const dispatch = (msg: MsgFrontend) => {
    renderMsgs.push(msg)
  }
  return { ...f, renderMsgs, dispatch }
}

describe(import.meta.file, () => {
  test('sound open drawer', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      { msgSpace: withEventMeta({ t: 'edit-pack-name.user-clicked-open-drawer-button', userId: f.hostId }) },
    ])
    expect(PlaySoundCmd.did(output)).toBe(true)
  })
  test('close drawer', async () => {
    const f = await Fixture()
    const r = f.render(
      <EditPackNameFrontend.ViewSurface {...f} modelSpace={{ ...f.modelSpace, opened: 'edit-pack-name-drawer' }} />,
    )
    const closeButton = r.getByRole('dialog', f.ctx.t('app.edit-name'))[0]?.getByRole('button', f.ctx.t('app.close'))[0]
    await closeButton?.click()
    expect(f.renderMsgs[0]).toEqual({
      t: 'got-msg-space',
      c: { t: 'edit-pack-name.user-closed-drawer', userId: f.hostId },
    })
  })
})
