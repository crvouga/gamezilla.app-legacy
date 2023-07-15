import { z } from "zod";
import {
  ColumnIndexZod,
  ColumnsZod,
  PlayerTypeZod,
  UserIdZod,
} from "../connect-four";
import {
  GameOver,
  MoveTimeLimit,
  Rematch,
  ServerModel,
  ClientModel,
  SharedModel,
} from "./vs-user.shared";

export const MoveTimeLimitZod: z.ZodType<MoveTimeLimit> = z.union([
  z.literal(5),
  z.literal(7),
  z.literal(9),
]);

const PlayersZod = z.object({
  "player-one": UserIdZod,
  "player-two": UserIdZod,
});

const RematchZod: z.ZodType<Rematch> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("NotAsking"),
  }),
  z.object({
    type: z.literal("Asking"),
    asker: PlayerTypeZod,
  }),
]);

const GameOverZod: z.ZodType<GameOver> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Draw"),
  }),
  z.object({
    type: z.literal("Winner"),
    winner: PlayerTypeZod,
  }),
  z.object({
    type: z.literal("resignation"),
    resigner: PlayerTypeZod,
  }),
]);

export const SharedModelZod: z.ZodType<SharedModel> = z.discriminatedUnion(
  "type",
  [
    z.object({
      type: z.literal("setup"),
      moveTimeLimit: MoveTimeLimitZod,
      players: z.object({
        "player-one": UserIdZod.nullable(),
        "player-two": UserIdZod.nullable(),
      }),
    }),
    z.object({
      type: z.literal("game"),
      moveTimeLimit: MoveTimeLimitZod,
      moveCountDown: z.number(),
      columns: ColumnsZod,
      players: PlayersZod,
    }),
    z.object({
      type: z.literal("game-over"),
      moveTimeLimit: MoveTimeLimitZod,
      columns: ColumnsZod,
      gameOver: GameOverZod,
      rematch: RematchZod,
      players: PlayersZod,
    }),
  ]
);

export const ServerModelZod: z.ZodType<ServerModel> = SharedModelZod;

export const ClientModelZod: z.ZodType<ClientModel> = SharedModelZod.and(
  z.object({
    ghostIndex: ColumnIndexZod.or(z.literal("none")),
    openedModal: z.enum(["ConfirmResign", "none"]),
  })
);
