import { Sub } from "gamezilla-app/@SHARED/core";
import { GameServerModule } from "../../@SHARED/architecture/game-server-v2";
import { SpaceServerCtx, SpaceServerEvent } from "../../@SHARED/space";
import { SpaceServerCmd } from "../../@SHARED/space-server-cmd";
import { FlowServer } from "./@CHILD/flow/flow.server";
import { MsgSync, GameName, ModelSync, ModelServer, MsgServer, MsgToClient, MsgToServer, } from "./game.core";
import { ConnectFourServer } from "./@CHILD/connect-four/connect-four.server";
//
//
//
//
//
//
//
type Module = GameServerModule<{
    Model: ModelServer;
    Msg: MsgServer;
    MsgToClient: MsgToClient;
    MsgToServer: MsgToServer;
    ModelSync: ModelSync;
    MsgSync: MsgSync;
    Ctx: SpaceServerCtx;
    MsgInCmd: null;
    MsgInEvent: SpaceServerEvent;
    MsgOutCmd: SpaceServerCmd<MsgToClient>;
    MsgOutEvent: null;
    Deps: null;
}>;
//
//
//
// Model
//
//
//
const init = (gameName: GameName): Module["init"] => {
    switch (gameName) {
        case "connect-four": {
            return {
                t: "connect-four",
                c: ConnectFourServer.init,
            };
        }
        case "flow": {
            return {
                t: "flow",
                c: FlowServer.init,
            };
        }
    }
};
//
//
//
// Update
//
//
//
export const update: Module["update"] = async (input) => {
    const { modelSync, ctx, model } = input;
    return GameServerModule.andThen({ model }, async (model) => {
        switch (modelSync.t) {
            case "flow": {
                const updated = await FlowServer.update({
                    ctx,
                    modelSync: modelSync.c,
                    model: model.t === "flow" ? model.c : FlowServer.init,
                    msgCmd: input.msgCmd,
                    msgEvt: input.msgEvt,
                    msgClient: input.msgClient?.t === "flow"
                        ? { ...input.msgClient, ...input.msgClient.c }
                        : null,
                    msgSync: input.msgSync?.t === "flow"
                        ? { ...input.msgSync, ...input.msgSync.c }
                        : null,
                    msg: input.msg?.t === "flow" ? input.msg.c : null,
                    deps: null,
                });
                const tagged = GameServerModule.tagOutput("flow", (msgCmd) => SpaceServerCmd.tag("flow", msgCmd), updated);
                return tagged;
            }
            case "connect-four": {
                const updated = await ConnectFourServer.update({
                    ctx,
                    modelSync: modelSync.c,
                    model: model.t === "connect-four" ? model.c : ConnectFourServer.init,
                    msgCmd: input.msgCmd,
                    msgEvt: input.msgEvt,
                    msgClient: input.msgClient?.t === "connect-four"
                        ? { ...input.msgClient, ...input.msgClient.c }
                        : null,
                    msgSync: input.msgSync?.t === "connect-four"
                        ? { ...input.msgSync, ...input.msgSync.c }
                        : null,
                    msg: input.msg?.t === "connect-four" ? input.msg.c : null,
                    deps: null,
                });
                const tagged = GameServerModule.tagOutput("connect-four", (msgCmd) => SpaceServerCmd.tag("connect-four", msgCmd), updated);
                return tagged;
            }
        }
    });
};
//
//
//
// Subscriptions
//
//
//
export const subscriptions: Module["subscriptions"] = async (input) => {
    const { modelSync, model } = input;
    switch (modelSync.t) {
        case "connect-four": {
            return Sub.tag("connect-four", await ConnectFourServer.subscriptions({
                ...input,
                modelSync: modelSync.c,
                model: model?.t === "connect-four" ? model.c : ConnectFourServer.init,
            }));
        }
        case "flow": {
            return Sub.tag("flow", await FlowServer.subscriptions({
                ...input,
                modelSync: modelSync.c,
                model: model?.t === "flow" ? model.c : FlowServer.init,
            }));
        }
    }
};
export const Game = {
    init,
    update,
    subscriptions,
    deps: null,
};
