import { describe, expect, it } from 'bun:test'
import { LamportTimestamp } from 'gamezilla-app/@/lamport-clock'
import { didPlaySound } from 'gamezilla-app/app/@/client'
import { EventId } from 'gamezilla-app/app/spaces/@/event'
import { FlowPack } from '../../@/pack/flow-pack'
import { FlowPuzzle } from '../../@/flow-puzzle/flow-puzzle'
import { FixtureFlowPlayClient } from '../@/fixture.client'

const Fixture = async () => {
  const f = await FixtureFlowPlayClient()
  const puzzle = await FlowPuzzle.random()
  const pack = await FlowPack.random({
    puzzleIds: [puzzle.id]
  })
  const initial = f.update(f.initial, [
    {
      msg: {
        t: 'user-clicked-open-pack-list-item',
        pack
      }
    }
  ])
  return {
    ...f,
    initial,
    pack,
    puzzle
  }
}

describe(import.meta.file, () => {
  it('should render exit button', async () => {
    const f = await Fixture()
    const rendered = f.render(f.initial)
    expect(rendered.getByRole('button', f.ctx.t('app.exit'))).toBeTruthy()
  })

  it('should render pack grid', async () => {
    const f = await Fixture()
    const rendered = f.render(f.initial)
    expect(rendered.getByRole('grid')).toBeTruthy()
  })

  it('should emit msg from clicking exit button', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const exitButton = r.getByRole('button', f.ctx.t('app.exit'))
    exitButton?.click()
    const msg = await r.msgs.once()
    expect(msg.t).toEqual('user-clicked-exit-pack-button')
  })

  it('should exit to pack list on exit button pack click', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'user-clicked-exit-pack-button'
        }
      }
    ])
    expect(output.modelCore.screen.t).toBe('screen-select-pack')
  })

  it('should play nav back sound on exit', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: {
          t: 'user-clicked-exit-pack-button',
          eventId: EventId.generate(),
          happenedAt: LamportTimestamp.fromNumber(1)
        }
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })

  it('should open puzzle after clicking grid item', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msg: {
          t: 'user-clicked-open-puzzle-grid-item',
          flowPuzzle: { t: 'got', c: f.puzzle },
          puzzleIndex: 0
        }
      }
    ])
    expect(output.modelCore.screen.t).toBe('screen-play-puzzle')
    if (output.modelCore.screen.t === 'screen-play-puzzle' && output.modelCore.screen.puzzleResult.t === 'got') {
      expect(output.modelCore.screen.puzzleResult.c).toEqual(f.puzzle)
    }
  })

  it('should play sound after user opens puzzle', async () => {
    const f = await Fixture()
    const output = f.update(f.initial, [
      {
        msgCore: {
          t: 'user-clicked-open-puzzle-grid-item',
          flowPuzzle: { t: 'got', c: f.puzzle },
          eventId: EventId.generate(),
          happenedAt: LamportTimestamp.fromNumber(1),
          puzzleIndex: 0
        }
      }
    ])
    expect(didPlaySound(output)).toBe(true)
  })
})
