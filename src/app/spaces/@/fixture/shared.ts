import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../../spaces-core/space'

export const makeSpace = ({
  spaceId,
  guestId = UserId.generate(),
  hostId,
}: {
  spaceId: SpaceId
  hostId: UserId
  guestId?: UserId
}): Space.Model => {
  return pipe(
    Space.init,
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-started-space', spaceId: spaceId, userId: hostId } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-inputted-game', spaceId: spaceId, userId: hostId, game: 'connect-four' } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId: spaceId, userId: guestId } as const),
      ),
  )
}
