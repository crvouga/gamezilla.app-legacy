import { Eff, Sub, batchMsgs, notAsked } from "gamezilla-app/@SHARED/core";
import { isAnonymous } from "../../@SHARED/client";
import { SpaceClientCmd } from "./@SHARED/space-client-cmd";
import { Input, Output, SpaceClientModule } from "./architecture/architecture";
import { CurrentSpaceBottomBar } from "./current-space-bottom-bar/current-space-bottom-bar";
import { EndSpaceClient } from "./end-space/end-space.client";
import { GameClient } from "./game/game.client";
import { GoHome } from "./go-home/go-home";
import { JoinSpaceClient } from "./join-space/join-space.client";
import { LeaveSpaceClient } from "./leave-space/leave-space.client";
import { ListSpacesClient } from "./list-spaces/list-spaces.client";
import { Modals } from "./modals/modals";
import { SpaceClient } from "./space/space.cient";
import { Spaces } from "./spaces-core";
import { ClientModule, ModelClient } from "./spaces.core";
import { StartSpaceClient } from "./start-space/start-space.client";
import { SyncClient } from "./sync/sync.client";
//
//
//
// Model
//
//
//
export const init: ClientModule["init"] = ({ ctx }) => {
    const model: ModelClient = {
        ...Spaces.init,
        games: {},
        modal: null,
        modalPreviewUserId: null,
        listSpacesRequest: notAsked,
    };
    const listSpaces = ListSpacesClient.init({ ctx, model });
    return {
        model: {
            ...model,
            ...listSpaces.model,
        },
        eff: Eff.batch([listSpaces.eff]),
        msgCmd: SpaceClientCmd.toClientCmd(batchMsgs(listSpaces.msgCmd)),
    };
};
//
//
//
// Update
//
//
//
export const update: ClientModule["update"] = (input) => {
    const updated = updateMain(input);
    return {
        model: updated.model,
        eff: updated.eff,
        msgCmd: SpaceClientCmd.toClientCmd(updated.msgCmd),
    };
};
export const updateMain = (input: Input, acc?: Output): Output => {
    acc = acc ?? updateChild(input);
    const [spaceEvent, ...spaceEventsRest] = acc.msgSpaceEvent ?? [];
    if (spaceEvent) {
        const updated = updateChild({
            ctx: input.ctx,
            model: acc.model,
            msgSpaceEvent: spaceEvent,
            modelLocation: input.modelLocation,
        });
        return updateMain(input, {
            model: updated.model,
            modelLocation: updated.modelLocation ?? acc.modelLocation,
            eff: Eff.batch([acc.eff, updated.eff]),
            msgSpaceEvent: batchMsgs(spaceEventsRest, updated.msgSpaceEvent),
            msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
            msgEvt: [],
        });
    }
    const [spaceCmd, ...spaceCmdsRest] = SpaceClientCmd.toSpaceClientCmd(acc.msgCmd);
    if (spaceCmd) {
        const updated = updateChild({
            ctx: input.ctx,
            model: acc.model,
            msgCmd: spaceCmd,
        });
        return updateMain(input, {
            model: updated.model,
            eff: Eff.batch([acc.eff, updated.eff]),
            msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent),
            msgCmd: batchMsgs(spaceCmdsRest, updated.msgCmd),
            msgEvt: [],
        });
    }
    return acc;
};
const updateChild: SpaceClientModule["update"] = (input) => {
    if (input.msgSpaceEvent &&
        Spaces.hasEvent(input.model, input.msgSpaceEvent.spaceId, input.msgSpaceEvent.eventId)) {
        return { model: input.model };
    }
    return SpaceClientModule.andThen({ model: input.model }, (model) => EndSpaceClient.update({ ...input, model }), (model) => Modals.update({ ...input, model }), (model) => LeaveSpaceClient.update({ ...input, model }), (model) => updateSpacesFromSpaceEvent({ ...input, model }), (model) => GameClient.update({ ...input, model }), (model) => SyncClient.update({ ...input, model }), (model) => StartSpaceClient.update({ ...input, model }), (model) => JoinSpaceClient.update({ ...input, model }), (model) => ListSpacesClient.update({ ...input, model }), (model) => GoHome.update({ ...input, model }), (model) => CurrentSpaceBottomBar.update({ ...input, model }));
};
const updateSpacesFromSpaceEvent: SpaceClientModule["update"] = ({ msgSpaceEvent, model, }) => {
    if (!msgSpaceEvent) {
        return { model };
    }
    const updated = Spaces.updateFromSpaceEvent({
        model,
        spaceEvent: msgSpaceEvent,
    });
    return { model: { ...model, ...updated.model } };
};
//
//
//
//
// Subscriptions
//
//
//
//
export const subscriptions: ClientModule["subscriptions"] = (input) => {
    return Sub.batch([
        //
        GameClient.subscriptions(input),
    ]);
};
//
//
//
//
// View
//
//
//
//
export const View: ClientModule["View"] = ({ ctx, dispatch, model, slots }) => {
    switch (ctx.currentRoute.n) {
        case "spaces": {
            switch (ctx.currentRoute.t) {
                case "space-list": {
                    return (<>
              <ListSpacesClient.View dispatch={dispatch} ctx={ctx} model={model}/>

              {slots?.bottomBar(null)}
            </>);
                }
                case "space": {
                    if (isAnonymous(ctx)) {
                        return null;
                    }
                    return (<SpaceClient.View spaceId={ctx.currentRoute.spaceId} ctx={ctx} dispatch={dispatch} model={model}/>);
                }
            }
        }
        default: {
            return null;
        }
    }
};
export const ViewCurrentSpaceBar = CurrentSpaceBottomBar.View;
