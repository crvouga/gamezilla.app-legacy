import { EventSourced } from '~/@/event-sourced'
import { unwrapOr } from '~/@/result'
import { Paginated } from '~/app/@/data/pagination'
import { sendToFrontend } from '~/app/@/backend/cmd'
import type { SpaceBackendModule } from '../architecture/space-backend'
import { Space } from '../core/space'

//
//
//
// Update
//
//
//

const update: SpaceBackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'list-spaces': {
      const listed = await input.ctx.spacesCore.list(input.msgFrontend)
      const spaces = unwrapOr(listed, Paginated.init())
      const started = spaces.items.map(EventSourced.startFromLatestSnapshot)
      const userIds = spaces.items.flatMap(Space.toUserIds)
      const profiles = unwrapOr(await input.ctx.userProfileDb.findByUserIds(userIds), [])

      return {
        msgCmd: [
          sendToFrontend(input.msgFrontend, {
            t: 'list-spaces.listed',
            spaces: started,
            causedBy: { msgFrontend: input.msgFrontend },
            profiles,
          }),
        ],
      }
    }
  }

  return {}
}

//
//
//
//
//
//

export const ListSpacesBackend = {
  update,
}
