import { Cmd, Result } from '@gamezilla/core';
import { Problem, Puzzle, Req, Res } from './puzzle.types';

export const updateFromFrontend = (_props: {
  msg: Req;
  db: (sql: string) => Promise<unknown>;
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
  ({ db, req }: { db: (sql: string) => Promise<unknown>; req: Req }) =>
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
}: {
  db: (sql: string) => Promise<unknown>;
  req: Req;
}): Promise<Result<Problem, Puzzle[]>> => {
  switch (req[0]) {
    case 'find-many': {
      return Result.Ok([]);
    }
  }
};
