import { UserId } from "@gamezilla/shared/app";

export type ParserMyZodEsque<TInput> = {
  parse: (input: unknown) => TInput;
};

export type SpaceMsg = { t: "user-left"; userId: UserId };
