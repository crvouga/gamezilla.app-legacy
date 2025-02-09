import { describe, expect, test } from 'bun:test'
import { didPlaySound } from '~/app/@/frontend/cmd'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { FixtureFlowBuilderFrontend } from '../../@/fixture/frontend'

const Fixture = async () => {
  const f = await FixtureFlowBuilderFrontend()
  const puzzle = await Puzzle.random({
    createdBy: f.ctx.currentUserId,
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

    expect(didPlaySound(output)).toBe(true)
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
})
