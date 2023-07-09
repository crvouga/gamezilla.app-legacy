import { SpaceCtx, ViewCtx } from "@gamezilla/shared/client";
import {
  Cmd,
  Keyboard,
  Option,
  Result,
  Sub,
  exhaustive,
} from "@gamezilla/shared/core";
import { useLayoutEffect, useRef } from "react";
import { Direction } from "./direction";
import * as Snake from "./snake";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  SharedModel,
  ToClient,
  ToServer,
  initSharedModel,
} from "./snake.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: Model = {
  ...initSharedModel,
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
    ctx: SpaceCtx;
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
      const sharedModel = msg[1];
      return [
        {
          ...sharedModel,
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
  TResult extends Result<TProblem, SharedModel>
>(
  result: TResult,
  model: Model
): [Model, Cmd<Msg>] => {
  if (result.t === "err") {
    return [model, Cmd.None];
  }
  const sharedModel = result.value;
  return [{ ...model, ...sharedModel }, Cmd.None];
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
  $send,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.gameStatus.type === "GameSetup") {
    return <div></div>;
  }

  return (
    <div>
      <ViewBoard model={model} $send={$send} />
    </div>
  );
};

export const ViewBoard = ({
  model,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      const dpi = 1000;
      ctx.scale(dpi, dpi);

      const width = canvas.width;
      const height = canvas.height;

      Snake.draw({ width, height }, model, ctx);
    }
  }, [model]);

  return (
    <canvas
      style={{
        userSelect: "none",
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        minHeight: "100%",
      }}
      ref={ref}
    />
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
