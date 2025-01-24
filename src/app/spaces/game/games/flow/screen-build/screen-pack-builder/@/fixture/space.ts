import { UserId } from '~/app/@/data/user-id'
import { SpaceGameSpaceFixture } from '~/app/spaces/game/games/@/testing/sync'
import { Pack } from '../../../../@/pack/pack'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { FlowSpaceCtx } from '../../../../@/space/ctx'
import { ScreenPackBuildSpace } from '../../space'
import type { ModelSpace, MsgSpace, UpdateSpace } from '../../types'

export const ScreenPackBuildSpaceFixture = async (input?: { puzzleCount?: number; appendDuplicatesOf?: Puzzle }) => {
  const f = await SpaceGameSpaceFixture()
  const ctx: FlowSpaceCtx = {
    ...f.ctx,
  }
  const createdBy = UserId.generate()

  const puzzlesPromises = [Puzzle.random({ createdBy }), Puzzle.random({ createdBy }), Puzzle.random({ createdBy })]

  for (let i = 0; i < (input?.puzzleCount ?? 0); i++) {
    puzzlesPromises.push(Puzzle.random({createdBy,}))
  }

  const puzzlesAll = await Promise.all(puzzlesPromises)
  const puzzles = puzzlesAll.slice(0, input?.puzzleCount ?? 3)

  if (input?.appendDuplicatesOf) {
    for (let i = 0; i < 3; i++) {
      puzzles.push(input.appendDuplicatesOf)
    }
  }

  const pack = await Pack.random({
    createdBy,
    puzzleIds: puzzles.map((puzzle) => puzzle.id),
  })

  const initial: ModelSpace = ScreenPackBuildSpace.initSpace({ pack })

  const update = (initial: ModelSpace, msgs: MsgSpace[]) => {
    return msgs.reduce<ReturnType<UpdateSpace>>((acc, msgSpace) => {
      const updated = ScreenPackBuildSpace.updateSpace({ ctx, modelSpace: acc, msgSpace })
      return {
        ...updated,
        msgs: [...(acc.msgs ?? []), ...(updated.msgs ?? [])],
      }
    }, initial)
  }

  return {
    ...f,
    update,
    createdBy,
    pack,
    puzzles,
    initial,
  }
}
