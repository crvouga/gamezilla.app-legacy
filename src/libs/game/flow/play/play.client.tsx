import { Sub, andThen, p } from "@gamezilla/core";
import { GameClient } from "@gamezilla/shared/game-space";
import { IconArrowLeftOnRect, MyButton } from "@gamezilla/ui";
import { FlowGridPlayUI } from "../flow-grid";
import { FlowViewCtx } from "../flow-shared";
import {
  ClientModel,
  ClientMsg,
  SharedModel,
  ToClient,
  ToServer,
  initShared,
} from "./play.core";

type Client = GameClient<
  ClientModel,
  SharedModel,
  ClientMsg,
  ToClient,
  ToServer,
  FlowViewCtx
>;

const init: Client["init"] = () => {
  return { model: initShared };
};

const update: Client["update"] = (input) => {
  return p(
    input,
    andThen((step) => {
      return FlowGridPlayUI.update({ ...input, ...step });
    })
  );
};

const updateFromServer: Client["updateFromServer"] = (input) => {
  return input;
};

const updateFromGameSpace: Client["updateFromGameSpace"] = (input) => {
  return input;
};

const syncWithServer: Client["syncWithServer"] = ({ client, server }) => {
  const client_ = client ?? init;
  return { model: { ...client_, ...server } };
};

const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

const View: Client["View"] = ({ model, dispatch, ctx }) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center">
        <FlowGridPlayUI.View dispatch={dispatch} model={model} />
      </div>
      <div className="w-full p-4">
        <MyButton className="w-full" onClick={ctx.onExit}>
          <IconArrowLeftOnRect />
          Exit
        </MyButton>
      </div>
    </div>
  );
};

export const PlayClient: Client = {
  init,
  update,
  updateFromServer,
  updateFromGameSpace,
  syncWithServer,
  subscriptions,
  View,
};
