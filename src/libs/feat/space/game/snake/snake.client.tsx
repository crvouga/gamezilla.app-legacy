import {
  Cmd,
  Keyboard,
  Option,
  Result,
  Sub,
  exhaustive,
} from "@gamezilla/core";
import { ViewCtx } from "@gamezilla/shared/client";
import { SpaceClientCtx } from "src/libs/feat/space/shared";
import { Direction } from "./direction";
import {
  ClientModel,
  ClientMsg,
  CoreModel,
  ServerModel,
  ToClient,
  ToServer,
  initCoreModel,
} from "./snake.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: Model = {
  ...initCoreModel,
  openedMenuId: Option.None,
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = (
  {
    sendToServer,
    ctx,
  }: {
    sendToServer: (msg: ToServer) => Cmd;
    ctx: SpaceClientCtx;
  },
  msg: Msg,
  _model: Model
): [Model, Cmd<Msg>] => {
  const model: Model = { ..._model, openedMenuId: Option.None };

  switch (msg[0]) {
    case "PressedKeyDown": {
      if (model.gameStatus.type !== "GameStarted") {
        return [model, Cmd.None];
      }

      if (model.gameStatus.player[1] !== ctx.currentUserId) {
        return [model, Cmd.None];
      }

      const direction = Direction.fromKey(msg[1]);

      const changeDirectionCmd =
        direction.type === "Some"
          ? sendToServer([
              "input-direction",
              { userId: ctx.currentUserId, direction: direction.value },
            ])
          : Cmd.None;

      const toggleStatusCmd =
        msg[1] === "Space"
          ? sendToServer(["ToggleStatus", { userId: ctx.currentUserId }])
          : Cmd.None;

      return [model, Cmd.batch([changeDirectionCmd, toggleStatusCmd])];
    }

    case "ToggleStatus": {
      return [model, sendToServer(msg)];
    }

    case "InputPlayer": {
      return [model, sendToServer(msg)];
    }

    case "input-direction": {
      return [model, sendToServer(msg)];
    }

    case "start-game": {
      return [model, sendToServer(msg)];
    }

    case "OpenedMenu": {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None];
    }

    case "ClosedMenu": {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromServer = (
  msg: ToClient,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "tick": {
      const coreModel = msg[1];
      return [
        {
          ...coreModel,
          openedMenuId: model.openedMenuId,
        },
        Cmd.None,
      ];
    }

    case "InputDirection_Done": {
      return updateResponse(msg[1], model);
    }

    case "ToggleStatus_Done": {
      return updateResponse(msg[1], model);
    }

    case "InputPlayer_Done": {
      return updateResponse(msg[1], model);
    }

    case "StartGame_Done": {
      return updateResponse(msg[1], model);
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const updateResponse = <
  TProblem extends string,
  TResult extends Result<TProblem, CoreModel>
>(
  result: TResult,
  model: Model
): [Model, Cmd<Msg>] => {
  if (result.t === "err") {
    return [model, Cmd.None];
  }
  const coreModel = result.value;
  return [{ ...model, ...coreModel }, Cmd.None];
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Keyboard.keyDowns<Msg>((key) => ["PressedKeyDown", key]);
};

//
//
//
// View
//
//
//

export const View = ({
  model,
  dispatch,
}: {
  ctx: ViewCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  if (model.gameStatus.type === "GameSetup") {
    return <div></div>;
  }

  return (
    <div>
      <ViewBoard model={model} dispatch={dispatch} />
    </div>
  );
};

export const ViewBoard = (_props: {
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  return (
    <canvas className="pointer-events-none h-full max-h-full min-h-full w-full touch-none select-none" />
  );
};

export const syncWithServer = ({
  clientModel,
  serverModel,
}: {
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  return {
    ...serverModel,
    openedMenuId: clientModel.openedMenuId,
  };
};
