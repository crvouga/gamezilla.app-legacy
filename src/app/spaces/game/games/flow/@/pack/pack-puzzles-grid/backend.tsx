import { sendToFrontend } from '~/app/@/backend/cmd'
import type { BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'list-puzzles-by-id': {
      const listed = await input.ctx.puzzleDb.query({
        pagination: {
          limit: input.msgFrontend.puzzleIds.length,
          offset: 0,
        },
        order: {
          createdAt: 'asc',
        },
        where: {
          puzzleId: {
            in: input.msgFrontend.puzzleIds,
          },
        },
      })
      return {
        msgCmd: [
          sendToFrontend(input.msgFrontend, {
            t: 'listed-puzzles-by-id',
            listed,
            causedBy: { msgFrontend: input.msgFrontend },
          }),
        ],
      }
    }
  }
  return {}
}

export const PackPuzzlesGridBackend = {
  update,
}
