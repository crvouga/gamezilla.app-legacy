import { z } from "zod";
import { ClientModel, ServerModel } from "./connect-four.core";
import * as VsBot from "./vs-bot/vs-bot-parsers";
import * as VsUser from "./vs-user/vs-user-parsers";

export const ServerModelZod: z.ZodType<ServerModel> = z.discriminatedUnion(
  "t",
  [
    z.object({
      t: z.literal("none"),
    }),
    z.object({
      t: z.literal("vs-user"),
      c: VsUser.ServerModelZod,
    }),
    z.object({
      t: z.literal("vs-bot"),
      c: VsBot.CoreModelZod,
    }),
  ]
);

export const ClientModelZod: z.ZodType<ClientModel> = z.discriminatedUnion(
  "t",
  [
    z.object({
      t: z.literal("none"),
    }),
    z.object({
      t: z.literal("vs-user"),
      c: VsUser.ClientModelZod,
    }),
    z.object({
      t: z.literal("vs-bot"),
      c: VsBot.ClientModelZod,
    }),
  ]
);
