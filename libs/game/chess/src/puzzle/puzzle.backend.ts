import { Cmd, p, Result, Task } from '@gamezilla/core';
import { z } from 'zod';
import { Problem, Puzzle, Req, Res, ToFrontend } from './puzzle.types';

const { Err, Ok } = Result;

type Database = (sql: string) => Promise<Result<string, unknown>>;

export const updateFromFrontend = ({
  msg,
  db,
  sendToFrontend,
}: {
  msg: Req;
  db: Database;
  sendToFrontend: (msg: ToFrontend) => Cmd;
  broadcast: (m: ToFrontend) => Cmd;
}): { cmd?: Cmd } => {
  switch (msg[0]) {
    case 'find-many': {
      return {
        cmd: p(
          findMany({ db, puzzleId: msg[1].puzzleId }),
          Cmd.perform((res): Res => [...msg, res]),
          Cmd.chain(sendToFrontend)
        ),
      };
    }

    case 'input-move': {
      return {};
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
