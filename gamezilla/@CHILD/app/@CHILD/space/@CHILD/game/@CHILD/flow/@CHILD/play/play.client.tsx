import { Sub, chain } from "gamezilla/@SHARED/core";
import { Button, IconArrowLeftOnRect } from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  GameClient,
  SpaceClientEvt,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { FlowGridUIPlay } from "../../@SHARED/flow";
import { FlowViewCtx } from "../../@SHARED/flow-ctx";
import {
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  initShared,
} from "./play.core";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: null;
  GameState: null;
  ViewCtx: FlowViewCtx;
  ClientCtx: FlowViewCtx;
  ClientCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  ClientEvt: SpaceClientEvt;
}>;

const init: Client["init"] = () => {
  return { model: initShared };
};

const update: Client["update"] = (input) => {
  return chain(init(input));
};

const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

const View: Client["View"] = ({ model, dispatch, ctx }) => {
  if (!model) {
    return <div></div>;
  }
  return (
    <div class="flex h-full w-full flex-1 flex-col">
      <div class="flex flex-1 items-center justify-center">
        <FlowGridUIPlay.View
          dispatch={(c) => dispatch({ t: "grid", c })}
          model={model?.grid}
        />
      </div>
      <div class="w-full p-4">
        <Button
          class="w-full"
          onClick={ctx.onExit}
          start={<IconArrowLeftOnRect class="h-6 w-6" />}
          text="Exit"
        />
      </div>
    </div>
  );
};

export const PlayClient: Client = {
  init,
  update,
  subscriptions,
  View,
};
