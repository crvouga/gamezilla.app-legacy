import { z } from "zod"
import { SpaceEvent } from "./space-event"
import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"

const ParserSpaceId = z.custom<SpaceId>(SpaceId.is)
const ParserUserId = z.custom<UserId>(UserId.is)

// @ts-ignore
const ParserSpaceEvent: z.ZodType<SpaceEvent> = z.discriminatedUnion("t", [
  z.object({
    t: z.literal("user-started-space"),
    userId: ParserUserId,
    spaceId: ParserSpaceId,
  }),
  z.object({
    t: z.literal("user-ended-space"),
    spaceId: ParserSpaceId,
    userId: ParserUserId,
  }),
  z.object({
    t: z.literal("user-joined-space"),
    spaceId: ParserSpaceId,
    userId: ParserUserId,
  }),
  z.object({
    t: z.literal("user-left-space"),
    spaceId: ParserSpaceId,
    userId: ParserUserId,
  }),
  z.object({
    t: z.literal("user-inputted-game"),
    spaceId: ParserSpaceId,
    userId: ParserUserId,
    game: z.string().nullable(),
  }),
])
