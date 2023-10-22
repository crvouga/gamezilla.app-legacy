import { Sub } from "gamezilla/@SHARED/core";
import { Button, IconArrowLeftOnRect } from "gamezilla/app/@SHARED/ui";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import { FlowGridUIPlay } from "../@SHARED/flow";
import { FlowViewCtx } from "../@SHARED/flow-ctx";
import {
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  initShared,
} from "./play.core";

type Client = SpaceGameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  null,
  null,
  FlowViewCtx
>;

const init: Client["init"] = () => {
  return { model: initShared };
};

const update: Client["update"] = (input) => {
  const { msg, model } = input;
  return { model };
};

const updateFromServer: Client["updateFromServer"] = (input) => {
  return input;
};

const updateFromEvt: Client["updateFromEvt"] = (input) => {
  return input;
};

const updateFromGameEvt: Client["updateFromGameEvt"] = (input) => {
  const { model } = input;
  if (model) {
    return { model };
  }
  return init(input);
};

const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

const View: Client["View"] = ({ model, dispatch, ctx }) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center">
        <FlowGridUIPlay.View
          dispatch={(c) => dispatch({ t: "grid", c })}
          model={model.grid}
        />
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
  updateFromGameEvt,
  subscriptions,
  View,
};
