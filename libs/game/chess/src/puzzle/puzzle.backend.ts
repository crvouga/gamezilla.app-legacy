import { Cmd, Sub } from '@gamezilla/core';
import { SharedMsg } from '@gamezilla/game-shared';
import { DatabaseConnection } from '@gamezilla/shared/backend';
import { z } from 'zod';
import {
  BackendModel,
  BackendMsg,
  initShared,
  ToBackend,
} from './puzzle.types';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init = initShared;

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
    default: {
      return {
        model,
      };
    }
  }
};

export const updateFromFrontend = ({
  msg,
  model,
}: // dbConn,
{
  msg: ToBackend;
  model: Model;
  dbConn: DatabaseConnection;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
    case 'find-many': {
      // const puzzleId = msg[1].puzzleId;

      // dbConn.query(`SELECT * WHERE puzzle_id = ${puzzleId}`, PuzzleRow);

      return {
        model,
      };
    }

    default: {
      return {
        model,
      };
    }
  }
};

export const updateFromRoom = ({
  msg,
  model,
}: {
  msg: SharedMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
    case 'user-left': {
      return {
        model,
      };
    }
  }
};

//
//
// Subscriptions
//
//

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
//
//

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
