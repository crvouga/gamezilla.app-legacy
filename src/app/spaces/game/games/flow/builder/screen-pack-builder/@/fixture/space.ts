import { UserId } from '~/app/@/data/user-id'
import { SpaceGameSpaceFixture } from '~/app/spaces/game/games/@/testing/sync'
import { Pack } from '../../../../@/pack/pack'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { Solutions } from '../../../../@/solutions/solutions'
import { FlowSpaceCtx } from '../../../../@/space/ctx'
import { ScreenPackBuilderSpace } from '../../space'
import type { ModelSpace, MsgSpace, UpdateSpace } from '../../types'

export const ScreenPackBuilderSpaceFixture = async (input?: { puzzleCount?: number; appendDuplicatesOf?: Puzzle }) => {
  const f = await SpaceGameSpaceFixture()
  const ctx: FlowSpaceCtx = {
    ...f.ctx,
    solutions: Solutions.init,
  }
  const createdBy = UserId.generate()

  const puzzlesPromises = [Puzzle.random({ createdBy }), Puzzle.random({ createdBy }), Puzzle.random({ createdBy })]

  for (let i = 0; i < (input?.puzzleCount ?? 0); i++) {
    puzzlesPromises.push(
      Puzzle.random({
        createdBy,
      }),
    )
  }

  const puzzles = (await Promise.all(puzzlesPromises)) as [Puzzle, Puzzle, Puzzle, ...Puzzle[]]

  if (input?.appendDuplicatesOf) {
    for (let i = 0; i < 3; i++) {
      puzzles.push(input.appendDuplicatesOf)
    }
  }

  const pack = await Pack.random({
    createdBy,
    puzzleIds: puzzles.map((puzzle) => puzzle.id),
  })

  const modelSpace: ModelSpace = ScreenPackBuilderSpace.initSpace({ pack })

  const update = (msgs: MsgSpace[]) => {
    return msgs.reduce<ReturnType<UpdateSpace>>((acc, msgSpace) => {
      const updated = ScreenPackBuilderSpace.updateSpace({ ctx, modelSpace: acc, msgSpace })
      return {
        ...updated,
        msgs: [...(acc.msgs ?? []), ...(updated.msgs ?? [])],
      }
    }, modelSpace)
  }

  return {
    ...f,
    update,
    createdBy,
    pack,
    puzzles,
    modelSpace,
  }
}
