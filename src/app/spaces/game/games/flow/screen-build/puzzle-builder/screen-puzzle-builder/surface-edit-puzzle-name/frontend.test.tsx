import { describe, expect, it, test } from 'bun:test'

import { Puzzle } from '../../../../@/puzzle/puzzle'
import { FixtureFlowBuilderFrontend } from '../../../@/fixture/frontend'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'

const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()
  const puzzle = await Puzzle.random({
    createdBy: f.ctx.currentUser.userId,
  })

  return {
    ...f,
    puzzle,
  }
}

describe(import.meta.file, () => {
  test('play sound when opening edit name drawer', async () => {
    const f = await Fixture()

    const output = f.update(f.init, [
      {
        msg: { t: 'puzzle.edit-name.user-clicked-button' },
      },
    ])

    expect(PlaySoundCmd.did(output)).toBe(true)
  })

  test('clicking edit name button should toggle surface open/closed state', async () => {
    const f = await Fixture()

    const afterOpen = f.update(f.init, [
      {
        msg: { t: 'puzzle.edit-name.user-clicked-button' },
      },
    ])

    const afterSecondClick = f.update(afterOpen, [
      {
        msg: { t: 'puzzle.edit-name.user-clicked-button' },
      },
    ])

    expect(f.init.model.puzzleBuilderOpened).not.toBe('edit-name')
    expect(afterOpen.model.puzzleBuilderOpened).toBe('edit-name')
    expect(afterSecondClick.model.puzzleBuilderOpened).not.toBe('edit-name')
  })

  it('should close when user clicks cancel when action location is bar', async () => {
    const f = await Fixture()

    const before = f.update(f.init, [
      {
        msg: { t: 'puzzle.edit-name.user-clicked-button' },
      },
    ])
    const after = f.update(before, [
      {
        msg: { t: 'puzzle.edit-name.user-clicked-cancel-button', screenActionLocation: 'bar' },
      },
    ])
    expect(before.model.puzzleBuilderOpened).toBe('edit-name')
    expect(after.model.puzzleBuilderOpened).toBe(null)
  })

  it('should open more drawer when user clicks cancel when action location is more drawer', async () => {
    const f = await Fixture()

    const before = f.update(f.init, [
      {
        msg: { t: 'puzzle.edit-name.user-clicked-button' },
      },
    ])
    const after = f.update(before, [
      {
        msg: { t: 'puzzle.edit-name.user-clicked-cancel-button', screenActionLocation: 'more-drawer' },
      },
    ])
    expect(before.model.puzzleBuilderOpened).toBe('edit-name')
    expect(after.model.puzzleBuilderOpened).toBe('more')
  })
})
