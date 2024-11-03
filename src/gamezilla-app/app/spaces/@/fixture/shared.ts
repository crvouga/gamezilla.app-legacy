import { type SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { pipe } from 'gamezilla-app/@/core'
import { withEventId } from '../../../../@/event-sourced/event'
import { SpaceCore } from '../../core'
import { EventSourced } from 'gamezilla-app/@/event-sourced'

export const makeSpace = ({
  spaceId,
  guestId = UserId.generate(),
  hostId
}: {
  spaceId: SpaceId
  hostId: UserId
  guestId?: UserId
}): SpaceCore.Model => {
  return pipe(
    SpaceCore.init,
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-started-space', spaceId: spaceId, userId: hostId } as const)
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-inputted-game', spaceId: spaceId, userId: hostId, game: 'connect-four' } as const)
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId: spaceId, userId: guestId } as const)
      )
  )
}
