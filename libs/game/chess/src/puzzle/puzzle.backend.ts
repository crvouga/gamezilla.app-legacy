import { Cmd, Sub } from '@gamezilla/core';
import { SharedMsg } from '@gamezilla/game-shared';
import { DatabaseConnection } from '@gamezilla/shared/backend';
import { GameMsg } from '../chess-shared';
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

export const init = (): { model: Model; cmd: Cmd<Msg> } => {
  console.log('SEND puzzles');
  return {
    model: initShared,
    cmd: Cmd.None,
  };
};

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
    case 'upload-lichess-db-puzzle-done': {
      return {
        model: {
          ...model,
          isUploadingLichessDbPuzzle: false,
        },
      };
    }
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
}: {
  msg: ToBackend;
  model: Model;
  dbConn: DatabaseConnection;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'find-many': {
      // const puzzleId = msg[1].puzzleId;

      // dbConn.query(`SELECT * WHERE puzzle_id = ${puzzleId}`, PuzzleRow);

      return {
        model,
      };
    }

    case 'upload-lichess-db-puzzle': {
      if (model.isUploadingLichessDbPuzzle) {
        return { model };
      }
      return {
        model: {
          ...model,
          isUploadingLichessDbPuzzle: true,
        },
        // cmd: p(
        //   () => uploadLichessDbPuzzleCsv({ dbConn }),
        //   Cmd.perform(() => ['upload-lichess-db-puzzle-done'])
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

export const updateFromGame = ({
  msg,
  model,
}: {
  msg: GameMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg[0]) {
    case 'mode-changed': {
      return {
        model,
        cmd: Cmd.None,
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
