import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { z } from "zod"
import * as Game from "../@CHILD/game/game.core"

const SpaceEvent = z.discriminatedUnion("t", [
  z.object({
    t: z.literal("user-started-space"),
    userId: z.string().refine(UserId.is),
    spaceId: z.string().refine(SpaceId.is),
    game: z.string().nullable(),
  }),

  z.object({
    t: z.literal("user-ended-space"),
    userId: z.string().refine(UserId.is),
    spaceId: z.string().refine(SpaceId.is),
  }),

  z.object({
    t: z.literal("user-joined-space"),
    userId: z.string().refine(UserId.is),
    spaceId: z.string().refine(SpaceId.is),
  }),

  z.object({
    t: z.literal("user-left-space"),
    userId: z.string().refine(UserId.is),
    spaceId: z.string().refine(SpaceId.is),
  }),

  z.object({
    t: z.literal("user-inputted-game"),
    userId: z.string().refine(UserId.is),
    spaceId: z.string().refine(SpaceId.is),
    game: z.string().nullable(),
  }),

  z.object({
    t: z.literal("game"),
    spaceId: z.string().refine(SpaceId.is),
    c: z.any(),
  }),

  z.object({
    t: z.literal("user-joined"),
    userId: z.string().refine(UserId.is),
  }),
])

export type SpaceEvent =
  | {
      t: "user-started-space"
      userId: UserId
      spaceId: SpaceId
    }
  | {
      t: "user-ended-space"
      userId: UserId
      spaceId: SpaceId
    }
  | {
      t: "user-joined-space"
      userId: UserId
      spaceId: SpaceId
    }
  | {
      t: "user-left-space"
      userId: UserId
      spaceId: SpaceId
    }
  | {
      t: "user-inputted-game"
      userId: UserId
      spaceId: SpaceId
      game: Game.GameName | null
    }
  | {
      t: "game"
      spaceId: SpaceId
      c: Game.MsgSync
    }
