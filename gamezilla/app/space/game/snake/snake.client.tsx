import {
  Eff,
  Keyboard,
  Option,
  Result,
  Sub,
  exhaustive,
} from "gamezilla/@SHARED/core";
import { ViewCtx } from "gamezilla/app/@SHARED/client";
import { SpaceClientCtx } from "gamezilla/app/space/@SHARED";
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
    sendToServer: (msg: ToServer) => Eff;
    ctx: SpaceClientCtx;
  },
  msg: Msg,
  _model: Model
): [Model, Eff<Msg>] => {
  const model: Model = { ..._model, openedMenuId: Option.None };

  switch (msg[0]) {
    case "PressedKeyDown": {
      if (model.gameStatus.type !== "GameStarted") {
        return [model, Eff.None];
      }

      if (model.gameStatus.player[1] !== ctx.currentUserId) {
        return [model, Eff.None];
      }

      const direction = Direction.fromKey(msg[1]);

      const changeDirectionEff =
        direction.type === "Some"
          ? sendToServer([
              "input-direction",
              { userId: ctx.currentUserId, direction: direction.value },
            ])
          : Eff.None;

      const toggleStatusEff =
        msg[1] === "Space"
          ? sendToServer(["ToggleStatus", { userId: ctx.currentUserId }])
          : Eff.None;

      return [model, Eff.batch([changeDirectionEff, toggleStatusEff])];
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
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Eff.None];
    }

    case "ClosedMenu": {
      return [{ ...model, openedMenuId: Option.None }, Eff.None];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromServer = (
  msg: ToClient,
  model: Model
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "tick": {
      const coreModel = msg[1];
      return [
        {
          ...coreModel,
          openedMenuId: model.openedMenuId,
        },
        Eff.None,
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
): [Model, Eff<Msg>] => {
  if (result.t === "err") {
    return [model, Eff.None];
  }
  const coreModel = result.value;
  return [{ ...model, ...coreModel }, Eff.None];
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
