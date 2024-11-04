import { sendToClient } from 'gamezilla-app/app/@/server'
import type { ServerModule } from './pack-puzzles-grid.types'

const update: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'list-puzzles-by-id': {
      const listed = await input.ctx.flowPuzzleDb.list({
        pagination: {
          limit: input.msgClient.puzzleIds.length,
          offset: 0
        },
        order: {
          createdAt: 'asc'
        },
        where: {
          puzzleId: {
            in: input.msgClient.puzzleIds
          }
        }
      })
      return {
        msgCmd: [
          sendToClient(input.msgClient, {
            t: 'listed-puzzles-by-id',
            listed,
            causedBy: { msgClient: input.msgClient }
          })
        ]
      }
    }
  }
  return {}
}

export const PackPuzzlesGridServer = {
  update
}
