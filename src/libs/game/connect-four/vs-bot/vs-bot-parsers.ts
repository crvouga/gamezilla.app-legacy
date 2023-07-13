import { z } from "zod";
import {
  ColumnIndexZod,
  ColumnsZod,
  PlayerTypeZod,
  UserIdZod,
} from "../connect-four/connect-four-parsers";
import type {
  BotLevel,
  ClientModel,
  ServerModel,
  SharedModel,
} from "./vs-bot.shared";

export const BotLevelZod: z.ZodType<BotLevel> = z.enum([
  "Easy",
  "Medium",
  "Hard",
]);

export const SharedModelZod: z.ZodType<SharedModel> = z.discriminatedUnion(
  "type",
  [
    z.object({
      type: z.literal("setup"),
      userPlayerType: PlayerTypeZod,
      botLevel: BotLevelZod,
      player: UserIdZod.nullable(),
    }),
    z.object({
      type: z.literal("game"),
      userPlayerType: PlayerTypeZod,
      botLevel: BotLevelZod,
      player: UserIdZod,
      columns: ColumnsZod,
    }),
  ]
);

export const ServerModelZod: z.ZodType<ServerModel> = SharedModelZod;

export const ClientModelZod: z.ZodType<ClientModel> = SharedModelZod.and(
  z.object({
    ghostIndex: ColumnIndexZod.nullable(),
  })
);
