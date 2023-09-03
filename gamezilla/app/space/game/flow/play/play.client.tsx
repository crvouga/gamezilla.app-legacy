import { Sub, andThen, p } from "gamezilla/@SHARED/core";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import { IconArrowLeftOnRect, Button } from "gamezilla/app/@SHARED/ui";
import { FlowGridPlayUI } from "../flow-grid";
import { FlowViewCtx } from "../flow-shared";
import {
  ClientModel,
  ClientMsg,
  CoreModel,
  ToClient,
  ToServer,
  initShared,
} from "./play.core";

type Client = SpaceGameClient<
  ClientModel,
  CoreModel,
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

const updateFromEvt: Client["updateFromEvt"] = (input) => {
  return input;
};

const mergeWithServer: Client["mergeWithServer"] = ({ client, server }) => {
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
        <Button
          className="w-full"
          onClick={ctx.onExit}
          start={<IconArrowLeftOnRect className="h-6 w-6" />}
          text="Exit"
        />
      </div>
    </div>
  );
};

export const PlayClient: Client = {
  init,
  update,
  updateFromServer,
  updateFromEvt,
  mergeWithServer,
  subscriptions,
  View,
};
