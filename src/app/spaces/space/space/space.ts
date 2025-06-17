import { EventSourced, EventSourcedConfig } from '~/@/event-sourced'
import { EventId, WithEventId } from '~/@/event-sourced/event'
import { FromUnknown } from '~/@/from-unknown/from-unknown'
import { pipe } from '~/@/function/pipe'
import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { ParseError } from '~/@/schema/schema/parse-error'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { MsgSpace } from '../msg-space'
import * as SpaceProjection from './space-projection'

export const Model = EventSourced.schema(MsgSpace, SpaceProjection.Model)
export type Model = s.Infer<typeof Model>

export const init: Model = EventSourced.init(SpaceProjection.init)

const config: EventSourcedConfig<MsgSpace, SpaceProjection.Model> = {
  reducer: SpaceProjection.updateSpace,
}

export const append = (model: Model, msg: WithEventId<MsgSpace>): Model => {
  return EventSourced.appendEvent(config, model, msg)
}

export const random = (input?: { hostId?: UserId; spaceId?: SpaceId; guestIds?: UserId[] }) => {
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

export const toSpaceId = (model: Model): SpaceId | null => {
  const state = EventSourced.toProjection(config, model)
  if (state.type === 'initial') return null
  return state.spaceId
}

export const toSpaceProjection = (model: Model): SpaceProjection.Model => {
  return EventSourced.toProjection(config, model)
}

export const toSpaceStarted = (model: Model | null | undefined): SpaceProjection.Started | null => {
  if (!model) return null
  const projection = toSpaceProjection(model)
  if (projection.type !== 'started') return null
  return projection
}

export const toUserIds = (model: Model): UserId[] => {
  const projection = toSpaceProjection(model)
  const userIds = SpaceProjection.toUserIds(projection)
  return userIds
}

export const { fromUnknownRegister, fromUnknown } = FromUnknown<Model>()

fromUnknownRegister((data) => pipe(data, Model.parse, (x) => Result.mapErr(x, ParseError.toString)))
