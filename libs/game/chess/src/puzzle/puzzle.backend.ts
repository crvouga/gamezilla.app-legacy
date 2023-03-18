import { Cmd } from '@gamezilla/core';
import {
  ClientId,
  DatabaseConnection,
  RoomId,
  UserId,
} from '@gamezilla/shared';
import { z } from 'zod';
import { Req, SharedModel, ToFrontend } from './puzzle.types';

//
//
// Model
//
//

export type Model = SharedModel;

export type Msg = Req;

export type Topic = ['client', ClientId] | ['room', RoomId] | ['user', UserId];

export const updateFromFrontend = ({
  msg,
  model,
}: // databaseConnection,
{
  msg: Msg;
  model: Model;
  emit: (topic: Topic, msg: ToFrontend) => Cmd;
  databaseConnection: DatabaseConnection;
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
        //   () => {
        //     return databaseConnection.query(
        //       PuzzleRow,
        //       `SELECT * WHERE puzzle_id = ${msg[1].puzzleId}`
        //     );
        //   },
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

export const findMany = async ({
  databaseConnection,
  puzzleId,
}: {
  databaseConnection: DatabaseConnection;
  puzzleId?: string;
}) => {
  const queried = await databaseConnection.query(
    PuzzleRow,
    `SELECT * WHERE puzzle_id = ${puzzleId}`
  );

  return queried;
};

export const initTables = async ({
  databaseConnection,
}: {
  databaseConnection: DatabaseConnection;
}) => {
  await databaseConnection.query(
    z.object({}),
    `CREATE TABLE IF NOT EXISTS puzzles (
      puzzle_id STRING PRIMARY KEY,`
  );
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
