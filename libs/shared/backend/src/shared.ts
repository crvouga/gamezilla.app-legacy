import { UserId } from '@gamezilla/shared';

export type ParserMyZodEsque<TInput> = {
  parse: (input: unknown) => TInput;
};

export type RoomMsg = { t: 'user-left'; userId: UserId };
