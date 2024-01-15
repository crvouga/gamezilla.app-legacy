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
      const pressedTerminal = Flow.findTerminalByNodeId(
        state.grid.flow,
        event.nodeId
      );

      if (pressedTerminal) {
        if (pressedTerminal.startId === event.nodeId) {
          if (!pressedTerminal.endId) {
            const removed = Flow.removeTerminal(
              state.grid.flow,
              pressedTerminal.groupId
            );
            return { ...state, grid: { ...state.grid, flow: removed } };
          }
          const terminalNew: Flow.Terminal = {
            groupId: pressedTerminal.groupId,
            startId: pressedTerminal.endId,
            endId: null,
          };
          const added = Flow.addTerminal(state.grid.flow, terminalNew);
          return { ...state, grid: { ...state.grid, flow: added } };
        }
        const terminalNew: Flow.Terminal = {
          groupId: pressedTerminal.groupId,
          startId: pressedTerminal.startId,
          endId: null,
        };
        const added = Flow.addTerminal(state.grid.flow, terminalNew);
        return { ...state, grid: { ...state.grid, flow: added } };
      }

      const currentPlacingGroupdId = toCurrentPlacingGroupId(state);

      const currentTerminal = Flow.toTerminalByGroupId(
        state.grid.flow,
        currentPlacingGroupdId
      );

      if (!currentTerminal) {
        const terminalNew: Flow.Terminal = {
          groupId: currentPlacingGroupdId,
          startId: event.nodeId,
          endId: null,
        };

        const added = Flow.addTerminal(state.grid.flow, terminalNew);

        return {
          ...state,
          grid: {
            ...state.grid,
            flow: added,
          },
        };
      }

      if (currentTerminal.groupId !== currentPlacingGroupdId) {
        return state;
      }

      if (currentTerminal.startId === event.nodeId) {
        return state;
      }

      const terminalNew: Flow.Terminal = {
        groupId: currentPlacingGroupdId,
        startId: currentTerminal.startId,
        endId: event.nodeId,
      };

      const added = Flow.addTerminal(state.grid.flow, terminalNew);

      return {
        ...state,
        grid: {
          ...state.grid,
          flow: added,
        },
      };
    }
  }
};

export const toCurrentPlacingGroupId = (state: GameState): Flow.GroupId => {
  for (const groupId of Flow.GROUP_ID_ORDER) {
    const terminal = Flow.toTerminalByGroupId(state.grid.flow, groupId);

    if (!terminal) {
      return groupId;
    }

    if (!terminal.endId) {
      return groupId;
    }
  }

  return Flow.GROUP_ID_ORDER[Flow.GROUP_ID_ORDER.length - 1]!;
};
