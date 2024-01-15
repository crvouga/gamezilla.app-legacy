import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  FlowGrid,
  FlowGridPosition,
  FlowGridUIEdit,
  FlowGridUIPlay,
} from "../../@SHARED/flow";

//
//
//
// Model
//
//
//

export type ClientModel = null;

export type ServerModel = null;

const EMPTY_GRID = FlowGrid.init({ bounds: FlowGridPosition.bounds8x8 });

//
//
//
// Msg
//
//
//

export type ClientMsg = GameEvent;

export type ServerMsg = { t: null };

export type ToServer = { t: null };

export type ToClient = { t: null };

//
//
//
//
//
//
//

export type GameEvent =
  | {
      t: "grid-ui-play";
      c: FlowGridUIPlay.Msg;
    }
  | {
      t: "grid-ui-edit";
      c: FlowGridUIEdit.Msg;
    }
  | {
      t: "user-changed-to-edit-mode";
      userId: UserId;
    }
  | {
      t: "user-changed-to-play-mode";
      userId: UserId;
    };

type Mode =
  | {
      t: "play";
    }
  | {
      t: "edit";
    };

export type GameState = {
  play: FlowGridUIPlay.Model;
  edit: FlowGridUIEdit.Model;
  mode: Mode;
};

export const toCurrentGrid = (state: GameState): FlowGrid.Model => {
  switch (state.mode.t) {
    case "edit": {
      return state.edit.grid;
    }

    case "play": {
      return state.play.grid;
    }
  }
};

export const initState = (_input: { ctx: SpaceCtx }): GameState => {
  const grid = EMPTY_GRID;
  return {
    mode: { t: "edit" },
    play: FlowGridUIPlay.init({ grid }),
    edit: FlowGridUIEdit.init({ grid }),
  };
};

export const reducer = ({
  state,
  event,
}: {
  ctx: SpaceCtx;
  event: GameEvent;
  state: GameState;
}): GameState => {
  switch (event.t) {
    case "grid-ui-play": {
      return {
        ...state,
        play: FlowGridUIPlay.update({ model: state.play, msg: event.c }),
      };
    }

    case "grid-ui-edit": {
      const updated = FlowGridUIEdit.update({
        model: state.edit,
        msg: event.c,
      });
      return {
        ...state,
        edit: updated.model,
      };
    }

    case "user-changed-to-edit-mode": {
      return {
        ...state,
        mode: {
          t: "edit",
        },
      };
    }

    case "user-changed-to-play-mode": {
      return {
        ...state,
        play: {
          ...state.play,
          grid: FlowGridUIEdit.toGrid(state.edit),
        },
        mode: {
          t: "play",
        },
      };
    }
  }
};
