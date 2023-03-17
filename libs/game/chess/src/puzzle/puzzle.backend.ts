import { Cmd, p, Result, Task } from '@gamezilla/core';
import { ClientId, RoomId, UserId } from '@gamezilla/shared';
import { z } from 'zod';
import {
  Problem,
  Puzzle,
  Req,
  Res,
  SharedModel,
  ToFrontend,
} from './puzzle.types';

const { Err, Ok } = Result;

//
//
// Model
//
//

export type Model = SharedModel;

export type Msg = Req;

type Database = (sql: string) => Promise<Result<string, unknown>>;

export type Topic = ['client', ClientId] | ['room', RoomId] | ['user', UserId];

export const updateFromFrontend = ({
  msg,
  model,
  db,
}: // emit,
{
  msg: Msg;
  model: Model;
  emit: (topic: Topic, msg: ToFrontend) => Cmd;
  db: Database;
  // sendToFrontend: (msg: ToFrontend) => Cmd;
  // broadcast: (m: ToFrontend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
    case 'find-many': {
      return {
        model,
        // cmd: p(
        //   findMany({ db, puzzleId: msg[1].puzzleId }),
        //   Cmd.perform((res): Res => [...msg, res])
        //   // Cmd.chain((res) => emit(['client', clientId], res))
        // ),
      };
    }

    default: {
      return {
        model,
      };
    }
  }
};

const findMany =
  ({
    db,
    puzzleId,
  }: {
    db: Database;
    puzzleId?: string;
  }): Task<Result<Problem, Puzzle[]>> =>
  async () => {
    const queried = await db(`select * where puzzle_id = ${puzzleId}`);

    if (queried.type === 'Err') {
      return Err(['database', queried.error]);
    }

    const parsed = z.array(PuzzleRow).safeParse(queried.value);

    if (!parsed.success) {
      return Err(['parsing', parsed.error.message]);
    }

    return Ok(parsed.data);
  };

export const PuzzleRow = z.object({
  puzzle_id: z.string(),
  rating: z.number(),
  rating_deviation: z.number(),
  opening_tags: z.array(z.string()),
  FEN: z.string(),
  moves: z.array(z.string()),
  popularity: z.number(),
  number_of_plays: z.number(),
  themes: z.array(z.string()),
  game_URL: z.string(),
});
