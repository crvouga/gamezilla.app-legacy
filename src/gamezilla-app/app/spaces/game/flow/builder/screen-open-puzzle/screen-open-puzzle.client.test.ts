import { describe, expect, it } from 'bun:test'
import { LamportTimestamp } from 'gamezilla-app/@/lamport-clock'
import { didPlaySound } from 'gamezilla-app/app/@/client'
import { andThen } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { EventId } from 'gamezilla-app/app/spaces/@/event'
import type { FlowClientCtx } from '../../@/flow-client-ctx'
import type { FlowPuzzle } from '../../@/puzzle/puzzle'
import { createFlowPuzzle, initial, testFlowClientCtx } from '../@/testing/client'
import { deriveModelCore } from '../@/testing/game'
import { BuilderClient } from '../builder.client'
import { BuilderCore } from '../builder.core'
import type { ModelClient } from '../builder.types'

const clickedPuzzleListItem = (ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
  return BuilderClient.update({
    ctx,
    model,
    modelCore: BuilderCore.initCore({
      ctx
    }),
    msg: {
      t: 'builder-open-puzzle.clicked-puzzle-list-item',
      puzzle
    }
  })
}

const userClickedPuzzleListItem = (ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
  return BuilderClient.update({
    ctx,
    model,
    modelCore: BuilderCore.initCore({
      ctx
    }),
    msgCore: {
      t: 'builder-open-puzzle.clicked-puzzle-list-item',
      puzzle,
      eventId: EventId.generate(),
      happenedAt: LamportTimestamp.fromNumber(0)
    }
  })
}

describe(import.meta.file, () => {
  it('should open puzzle builder after clicking a puzzle in the list', async () => {
    const ctx = await testFlowClientCtx()

    const puzzle = await createFlowPuzzle(ctx)

    const output = andThen(
      initial,
      clickedPuzzleListItem(ctx, puzzle)
      //
    )

    const modelCore = deriveModelCore(ctx)(output)

    expect(modelCore.opened.t === 'puzzle-builder' && modelCore.puzzleBuilder?.puzzle.id === puzzle.id).toBe(true)
  })

  it('should play a sound when clicking a puzzle in the list', async () => {
    const ctx = await testFlowClientCtx()

    const puzzle = await createFlowPuzzle(ctx)

    const output = andThen(
      initial,
      userClickedPuzzleListItem(ctx, puzzle)
      //
    )

    expect(didPlaySound(output)).toBe(true)
  })
})
