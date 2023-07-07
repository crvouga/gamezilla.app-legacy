import { SpaceCtx, SpaceViewCtx } from "@gamezilla/shared/client";
import { Cmd } from "@gamezilla/shared/core";
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  initShared,
} from "./play.shared";
import { FlowGridPlayUI } from "../flow-grid";
import { MyButton } from "@gamezilla/shared/ui";

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
  $send,
  onExit,
}: {
  model: Model;
  $send: (m: Msg) => void;
  onExit: () => void;
  ctx: SpaceViewCtx;
}) => {
  return (
    <div className="w-full flex-1 flex-col">
      <div className="flex-1">
        <FlowGridPlayUI.View $send={$send} model={model} />
      </div>
      <div className="w-full">
        <MyButton onClick={onExit}>Exit</MyButton>
      </div>
    </div>
  );
};
