import { UserIdZod } from "@gamezilla/shared/app";
import { VsBotSetup } from "@gamezilla/shared/game-space";
import { z } from "zod";
import {
  ColumnIndexZod,
  ColumnsZod,
  PlayerTypeZod,
} from "../connect-four/connect-four-parsers";
import type {
  BotLevel,
  ClientModel,
  CoreModel,
  ServerModel,
} from "./vs-bot.core";

export const BotLevelZod: z.ZodType<BotLevel> = z.enum([
  "Easy",
  "Medium",
  "Hard",
]);

export const CoreModelZod: z.ZodType<CoreModel> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("setup"),
    userPlayerType: PlayerTypeZod,
    botLevel: BotLevelZod,
    player: UserIdZod.nullable(),
  }),
  z.object({
    type: z.literal("game"),
    userPlayerType: PlayerTypeZod,
    gameId: z.number(),
    botLevel: BotLevelZod,
    player: UserIdZod,
    columns: ColumnsZod,
  }),
]);

export const ServerModelZod: z.ZodType<ServerModel> = CoreModelZod;

export const ClientModelZod: z.ZodType<ClientModel> = CoreModelZod.and(
  z.object({
    ghostIndex: ColumnIndexZod.nullable(),
    vsBotSetup: VsBotSetup.ModelZod,
  })
);
