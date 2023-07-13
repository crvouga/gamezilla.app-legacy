import { UserId } from "@gamezilla/shared/app";
import { z } from "zod";
import { ColumnIndex, PlayerType } from "./connect-four";

export const UserIdZod: z.ZodType<UserId> = z.custom((value) => {
  if (typeof value === "string" && value.length > 0) {
    return value as UserId;
  }
  throw new z.ZodError([]);
});

export const PlayerTypeZod: z.ZodType<PlayerType> = z.enum([
  "PlayerOne",
  "PlayerTwo",
]);

const Col = z.array(PlayerTypeZod);

export const ColumnsZod = z.tuple([Col, Col, Col, Col, Col, Col, Col]);

export const ColumnIndexZod: z.ZodType<ColumnIndex> = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);
