import { SpaceCtx, SpaceViewCtx } from "@gamezilla/shared/client";
import { Cmd } from "@gamezilla/core";
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  initShared,
} from "./play.shared";
import { FlowGridPlayUI } from "../flow-grid";
import { IconArrowLeftOnRect, MyButton } from "@gamezilla/ui";

type Model = ClientModel;

type Msg = ClientMsg;

export const init: Model = initShared;

export const update = (input: {
  msg: Msg;
  model: Model;
  ctx: SpaceCtx;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const updated = FlowGridPlayUI.update({
    msg: input.msg,
    model: input.model,
  });

  return updated;
};

export const updateFromServer = (input: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return input;
};

export const syncWithServer = ({
  client,
  server,
}: {
  client?: ClientModel;
  server: SharedModel;
}) => {
  const client_ = client ?? init;
  return { ...client_, ...server };
};

//
//
// View
//
//

export const View = ({
  model,
  dispatch,
  onExit,
}: {
  model: Model;
  dispatch: (m: Msg) => void;
  onExit: () => void;
  ctx: SpaceViewCtx;
}) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center">
        <FlowGridPlayUI.View dispatch={dispatch} model={model} />
      </div>
      <div className="w-full p-4">
        <MyButton className="w-full" onClick={onExit}>
          <IconArrowLeftOnRect />
          Exit
        </MyButton>
      </div>
    </div>
  );
};
