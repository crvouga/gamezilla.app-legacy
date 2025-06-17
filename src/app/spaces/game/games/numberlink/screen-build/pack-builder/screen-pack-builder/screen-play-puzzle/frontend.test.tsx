import { describe, expect, test } from 'bun:test'
import { assertNotNullish } from '~/@/assert'
import { withEventMeta } from '~/@/event-sourced/event'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { FixturePackBuilderFrontend } from '../@/fixture/frontend'
import { ScreenPackBuildSpaceFixture } from '../@/fixture/space'
import { MsgFrontend } from '../types'
import { ScreenPuzzlePlay } from './frontend'

const Fixture = async ({
  puzzleIndex = 0,
}: {
  puzzleIndex?: number
} = {}) => {
  const f = await FixturePackBuilderFrontend()
  const spaceFixture = await ScreenPackBuildSpaceFixture()
  const modelSpace = spaceFixture.update(spaceFixture.initial, [
    {
      t: 'screen-pack-builder.user-clicked-pack-item',
      puzzleResult: { t: 'got', c: assertNotNullish(spaceFixture.puzzles[puzzleIndex]) },
      puzzleIndex,
    },
  ])
  const renderMsgs: MsgFrontend[] = []
  const render = (input: { model: typeof f.model; modelSpace: typeof f.modelSpace }) => {
    return f.render(
      <ScreenPuzzlePlay.View
        ctx={f.ctx}
        dispatch={(m) => renderMsgs.push(m)}
        model={input.model}
        modelSpace={input.modelSpace}
      />,
    )
  }
  return {
    ...f,
    pack: modelSpace.pack,
    modelSpace,
    render,
    renderMsgs,
  }
}

describe('Test', () => {
  test('play sound when clicking exit button', async () => {
    const f = await Fixture()
    const output = ScreenPuzzlePlay.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
        userId: f.ctx.currentUser.userId,
      }),
    })
    expect(PlaySoundCmd.did(output)).toBe(true)
  })

  test('play sound when clicking previous puzzle button', async () => {
    const f = await Fixture()
    const output = ScreenPuzzlePlay.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
        userId: f.ctx.currentUser.userId,
        previousPuzzleResult: { t: 'got', c: f.puzzle },
      }),
    })
    expect(PlaySoundCmd.did(output)).toBe(true)
  })

  test('play sound when clicking next puzzle button', async () => {
    const f = await Fixture()
    const output = ScreenPuzzlePlay.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: f.ctx.currentUser.userId,
        nextPuzzleResult: { t: 'got', c: f.puzzle },
      }),
    })
    expect(PlaySoundCmd.did(output)).toBe(true)
  })

  test('play sound when removing puzzle from pack', async () => {
    const f = await Fixture()
    const output = ScreenPuzzlePlay.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
        userId: f.ctx.currentUser.userId,
        puzzleIndex: 0,
      }),
    })
    expect(PlaySoundCmd.did(output)).toBe(true)
  })

  test('play sound when toggling more drawer', async () => {
    const f = await Fixture()
    const output = ScreenPuzzlePlay.update({
      ...f,
      msgSpace: withEventMeta({
        t: 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button',
        userId: f.ctx.currentUser.userId,
      }),
    })
    expect(PlaySoundCmd.did(output)).toBe(true)
  })
  test('previous button is disabled when at edge of pack', async () => {
    const f = await Fixture({ puzzleIndex: 0 })
    const r = f.render(f)
    const prevButton = assertNotNullish(r.getByRole('button', f.ctx.t('app.prev'))[0])
    expect(prevButton.disabled).toBe(true)
  })

  test('next button is disabled when at end of pack', async () => {
    let f = await Fixture()
    f = await Fixture({ puzzleIndex: f.modelSpace.pack.puzzleIds.length - 1 })
    const r = f.render(f)
    const nextButton = assertNotNullish(r.getByRole('button', f.ctx.t('app.next'))[0])
    expect(nextButton.disabled).toBe(true)
  })

  test('can go next even when puzzle is missing', async () => {
    const f = await Fixture()
    const r = f.render(f)
    await r.getByRole('button', f.ctx.t('app.next'))[0]?.click()
    const m = f.renderMsgs[0]
    expect(m?.t === 'got-msg-space' && m?.c?.t).toBe('screen-pack-builder.puzzle-screen.user-clicked-next-puzzle')
  })

  test('can go next when at second to last puzzle', async () => {
    let f = await Fixture()
    f = await Fixture({ puzzleIndex: f.modelSpace.pack.puzzleIds.length - 2 })
    const r = f.render(f)
    await r.getByRole('button', f.ctx.t('app.next'))[0]?.click()
    const m = f.renderMsgs[0]
    expect(m?.t === 'got-msg-space' && m?.c?.t).toBe('screen-pack-builder.puzzle-screen.user-clicked-next-puzzle')
  })
})
