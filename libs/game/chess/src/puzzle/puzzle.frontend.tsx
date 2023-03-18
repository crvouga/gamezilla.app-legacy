import { Cmd } from '@gamezilla/core';
import { GameRoomCtx } from '@gamezilla/game-shared';
import { Box, Button, FillBox } from '@gamezilla/shared/ui';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToFrontend,
} from './puzzle.types';

//
//
// Model
//
//

export type Model = FrontendModel;

export const init: Model = {
  puzzles: {},
};

//
//
// Update
//
//

type Msg = FrontendMsg;

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

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'find-many': {
      return { model };
    }

    case 'input-move': {
      return { model };
    }
  }
};

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: Model;
  backendModel: BackendModel;
}): Model => {
  return { ...frontendModel, ...backendModel };
};

//
//
// View
//
//

export const View = ({
  model,
  onClose,
}: {
  ctx: GameRoomCtx;
  model: Model;
  $send: (m: Msg) => void;
  onClose: () => void;
}) => {
  return (
    <FillBox>
      puzzles
      <pre>{JSON.stringify(model, null, 2)}</pre>
      <Box sx={{ flex: 1 }}></Box>
      <Box sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </FillBox>
  );
};
