import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceCore } from '../../core/space-core'

export const makeSpace = ({
  spaceId,
  guestId = UserId.generate(),
  hostId,
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
        withEventId({ t: 'user-started-space', spaceId: spaceId, userId: hostId } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-inputted-game', spaceId: spaceId, userId: hostId, game: 'connect-four' } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId: spaceId, userId: guestId } as const),
      ),
  )
}
