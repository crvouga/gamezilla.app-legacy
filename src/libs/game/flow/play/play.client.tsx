import { Cmd, andThen, p } from "@gamezilla/core";
import {
  ClientGameSpaceCtx,
  ClientGameSpaceViewCtx,
} from "@gamezilla/shared/game-space";
import { IconArrowLeftOnRect, MyButton } from "@gamezilla/ui";
import { FlowGridPlayUI } from "../flow-grid";
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  initShared,
} from "./play.core";

type Model = ClientModel;

type Msg = ClientMsg;

export const init = initShared;

export const update = (input: {
  msg: Msg;
  model: Model;
  ctx: ClientGameSpaceCtx;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    input,
    andThen((step) => {
      return FlowGridPlayUI.update({ ...input, ...step });
    })
  );
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
  ctx: ClientGameSpaceViewCtx;
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
