import { Cmd, Result } from '@gamezilla/core';
import { z } from 'zod';
import { Problem, Puzzle, Req, Res } from './puzzle.types';

export const updateFromFrontend = (_props: {
  msg: Req;
  db: (sql: string) => Promise<Result<string, unknown>>;
}): { cmd?: Cmd } => {
  return {
    // cmd: p(
    //   handler({ db, req: msg }),
    //   Cmd.perform((res) => {
    //     //
    //   })
    // ),
  };
};

export const handler =
  ({
    db,
    req,
  }: {
    db: (sql: string) => Promise<Result<string, unknown>>;
    req: Req;
  }) =>
  async (): Promise<Res> => {
    switch (req[0]) {
      default: {
        const result = await handleQuery({ db, req });
        return [...req, result];
      }
    }
  };

const handleQuery = async ({
  req,
  db,
}: {
  db: (sql: string) => Promise<Result<string, unknown>>;
  req: Req;
}): Promise<Result<Problem, Puzzle[]>> => {
  switch (req[0]) {
    case 'find-many': {
      const found = await db(`SELECT * WHERE puzzle_id = ${req[1].puzzleId}`);
      if (found.type === 'Err') {
        return Result.Err({ type: 'database-error', message: found.error });
      }
      const parsed = z.array(PuzzleRow).safeParse(found.value);
      if (!parsed.success) {
        return Result.Err({
          type: 'parsing-error',
          message: parsed.error.message,
        });
      }
      return Result.Ok(parsed.data);
    }
  }
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
