import {
  Eff,
  Keyboard,
  Option,
  Result,
  Sub,
  exhaustive,
  isErr,
} from "gamezilla/@SHARED/core";
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { Direction } from "./@SHARED/direction";
import {
  ClientModel,
  ClientMsg,
  CoreModel,
  ServerModel,
  ToClient,
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
    ctx,
  }: {
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
        direction.type === "Some" ? Eff.None : Eff.None;

      const toggleStatusEff = msg[1] === "Space" ? Eff.None : Eff.None;

      return [model, Eff.batch([changeDirectionEff, toggleStatusEff])];
    }

    case "ToggleStatus": {
      return [model, Eff.None];
    }

    case "InputPlayer": {
      return [model, Eff.None];
    }

    case "input-direction": {
      return [model, Eff.None];
    }

    case "start-game": {
      return [model, Eff.None];
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
  if (isErr(result)) {
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
  ctx: ClientCtx;
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
    <canvas class="pointer-events-none h-full max-h-full min-h-full w-full touch-none select-none" />
  );
};

export const mergeWithServer = ({
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
