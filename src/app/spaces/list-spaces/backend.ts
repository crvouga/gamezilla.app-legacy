import { EventSourced } from '~/@/event-sourced'
import { unwrapOr } from '~/@/result'
import { Paginated } from '~/app/@/data/pagination'
import { sendToFrontend } from '~/app/@/backend/cmd'
import type { SpaceBackendModule } from '../@/architecture/space-backend'
import { SpaceCore } from '../core/space-core'

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
      const listed = await input.ctx.spacesCoreBackend.list(input.msgFrontend)
      const spaces = unwrapOr(listed, Paginated.init())
      const started = spaces.items.map(EventSourced.startFromLatestSnapshot)
      const userIds = spaces.items.flatMap(SpaceCore.toUserIds)
      const profiles = unwrapOr(await input.ctx.profileCache.get(userIds), {})

      return {
        msgCmd: [
          sendToFrontend(input.msgFrontend, {
            t: 'listed-spaces',
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
