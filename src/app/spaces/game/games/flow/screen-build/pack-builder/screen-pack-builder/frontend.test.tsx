import { describe, expect, test } from 'bun:test'
import { withEventMeta } from '~/@/event-sourced/event'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { FixturePackBuilderFrontend } from './@/fixture/frontend'
import { ScreenPackBuilderFrontend } from './frontend'

const Fixture = async () => {
  const f = await FixturePackBuilderFrontend()
  const dispatch = () => {}
  return {
    ...f,
    dispatch,
  }
}

describe(import.meta.file, () => {
  test('render edit name drawer', async () => {
    const f = await Fixture()
    const r = f.render(
      <ScreenPackBuilderFrontend.View {...f} modelSpace={{ ...f.modelSpace, opened: 'edit-pack-name-drawer' }} />,
    )
    const drawers = r.getByRole('dialog', f.ctx.t('app.edit-name'))
    expect(drawers.length).toBe(1)
  })

  test('render NOT edit name drawer', async () => {
    const f = await Fixture()
    const r = f.render(<ScreenPackBuilderFrontend.View {...f} modelSpace={{ ...f.modelSpace }} />)
    const drawers = r.getByRole('dialog', f.ctx.t('app.edit-name'))
    expect(drawers.length).toBe(0)
  })

  test('play sound exiting pack builder', async () => {
    const f = await Fixture()
    const output = ScreenPackBuilderFrontend.update({
      ...f,
      msgSpace: withEventMeta({ t: 'screen-pack-builder.user-clicked-back-button', userId: f.hostId }),
    })
    expect(didPlaySound(output)).toBe(true)
  })
})
