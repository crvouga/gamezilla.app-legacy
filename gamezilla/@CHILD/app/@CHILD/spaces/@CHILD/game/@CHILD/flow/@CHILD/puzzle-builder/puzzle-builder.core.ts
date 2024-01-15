import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Flow,
  FlowGrid,
  FlowGridPosition,
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
      t: "play-ui";
      c: FlowGridUIPlay.Msg;
    }
  | {
      t: "user-pressed-down-node";
      nodeId: Flow.NodeId;
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
  editorIds: { [userId: UserId]: UserId };
  placingGroup: Flow.GroupId | null;
  grid: FlowGrid.Model;
  mode: Mode;
};

export const initState = ({ ctx }: { ctx: SpaceCtx }): GameState => {
  return {
    grid: EMPTY_GRID,
    play: FlowGridUIPlay.init({
      grid: EMPTY_GRID,
    }),
    placingGroup: null,
    editorIds: {
      [ctx.space.hostId]: ctx.space.hostId,
    },
    mode: {
      t: "edit",
    },
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
    case "play-ui": {
      return {
        ...state,
        play: FlowGridUIPlay.update({
          model: {
            ...state.play,
            grid: state.grid,
          },
          msg: event.c,
        }),
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
        mode: {
          t: "play",
        },
      };
    }

    case "user-pressed-down-node": {
      return state;
    }
  }
};
