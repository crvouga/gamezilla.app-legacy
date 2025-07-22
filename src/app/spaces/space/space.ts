import { EventSourced, EventSourcedConfig } from '~/@/event-sourced'
import { EventId, WithEventId } from '~/@/event-sourced/event'
import { FromUnknown } from '~/@/from-unknown/from-unknown'
import { pipe } from '~/@/function/pipe'
import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { ParseError } from '~/@/schema/schema/parse-error'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { MsgSpace } from './msg-space'
import { SpaceProjection, SpaceProjectionStarted } from './space-projection'

const schema = EventSourced.schema(MsgSpace, SpaceProjection.schema)
export type Space = s.Infer<typeof schema>

const init: Space = EventSourced.init(SpaceProjection.init)

const config: EventSourcedConfig<MsgSpace, SpaceProjection> = {
  reducer: SpaceProjection.updateSpace,
}

const append = (model: Space, msg: WithEventId<MsgSpace>): Space => {
  return EventSourced.appendEvent(config, model, msg)
}

const random = (input?: { hostId?: UserId; spaceId?: SpaceId; guestIds?: UserId[] }) => {
  const spaceId = input?.spaceId ?? SpaceId.generate()
  const hostId = input?.hostId ?? UserId.generate()
  const guestIds = input?.guestIds ?? []

  return pipe(
    init,
    (model) =>
      EventSourced.appendEvent(config, model, {
        t: 'user-started-space',
        eventId: EventId.generate(),
        spaceId,
        userId: hostId,
      }),
    (model) =>
      guestIds.reduce(
        (model, guestId) =>
          EventSourced.appendEvent(config, model, {
            t: 'user-joined-space',
            eventId: EventId.generate(),
            spaceId,
            userId: guestId,
          }),
        model,
      ),
  )
}

const toSpaceId = (model: Space): SpaceId | null => {
  const state = EventSourced.toProjection(config, model)
  if (state.type === 'initial') return null
  return state.spaceId
}

const toSpaceProjection = (model: Space): SpaceProjection => {
  return EventSourced.toProjection(config, model)
}

const toSpaceStarted = (model: Space | null | undefined): SpaceProjectionStarted | null => {
  if (!model) return null
  const projection = toSpaceProjection(model)
  if (projection.type !== 'started') return null
  return projection
}

const toUserIds = (model: Space): UserId[] => {
  const projection = toSpaceProjection(model)
  const userIds = SpaceProjection.toUserIds(projection)
  return userIds
}

const { fromUnknownRegister, fromUnknown } = FromUnknown<Space>()

fromUnknownRegister((data) => pipe(data, schema.parse, (x) => Result.mapErr(x, ParseError.toString)))

export const Space = {
  schema,
  init,
  append,
  random,
  fromUnknownRegister,
  fromUnknown,
  toSpaceId,
  toSpaceProjection,
  toSpaceStarted,
  toUserIds,
}
