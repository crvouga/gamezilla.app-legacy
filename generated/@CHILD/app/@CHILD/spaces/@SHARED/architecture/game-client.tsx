import { WithEventId, WithEventMeta, } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ClientCmd, ClientEvent } from "gamezilla-app/@CHILD/app/@SHARED/client";
import { Eff, Sub } from "gamezilla-app/@SHARED/core";
import { VDom } from "gamezilla-app/@SHARED/vdom";
export type GameClientTypes = {
    //
    ModelClient: any;
    MsgClient: any;
    //
    MsgToClient: any;
    MsgToServer: any;
    //
    ModelSync: any;
    MsgSync: any;
    //
    ClientCtx: any;
};
type Output<T extends GameClientTypes> = {
    model: T["ModelClient"];
    eff?: Eff<T["MsgClient"]>;
    msgCmd?: ClientCmd<{
        MsgClient: T["MsgClient"];
        MsgToServer: T["MsgToServer"];
    }>[];
    msgSync?: WithEventId<T["MsgSync"]>[];
};
export type InMsg<T extends GameClientTypes> = ({
    variant: "msg";
} & T["MsgClient"]) | ({
    variant: "to-client";
} & T["MsgToClient"]) | ({
    variant: "event";
} & ClientEvent);
export type OutMsg<T extends GameClientTypes> = ({
    variant: "msgCmd";
} & ClientCmd<T>) | ({
    variant: "game-event";
} & WithEventId<T["MsgSync"]>);
export type GameClient<T extends GameClientTypes> = {
    init: (input: {
        ctx: T["ClientCtx"];
        modelSync: T["ModelSync"];
        model?: T["ModelClient"] | null;
    }) => Output<T>;
    update: (input: {
        ctx: T["ClientCtx"];
        modelSync: T["ModelSync"];
        modelSyncBefore: T["ModelSync"];
        model?: T["ModelClient"] | null;
        //
        msg?: T["MsgClient"] | null;
        msgServer?: T["MsgToClient"] | null;
        msgEvt?: ClientEvent | null;
        msgSync?: WithEventMeta<T["MsgSync"]> | null;
    }) => Output<T>;
    subscriptions: (input: {
        intervalId: string;
        ctx: T["ClientCtx"];
        model?: T["ModelClient"] | null;
        modelSync: T["ModelSync"];
    }) => Sub<T["MsgClient"]>;
    View: (input: {
        ctx: T["ClientCtx"];
        dispatch: (msg: T["MsgClient"]) => void;
        modelSync: T["ModelSync"];
        model?: T["ModelClient"] | null;
    }) => VDom;
    ViewFeedItem: (input: {
        ctx: T["ClientCtx"];
        modelSync: T["ModelSync"];
        msgEvt: T["MsgSync"];
    }) => VDom;
};
/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
export const tag = <T extends string, Types extends GameClientTypes>(tag: T, client: GameClient<Types>): GameClient<{
    ModelClient: {
        t: T;
        c: Types["ModelClient"];
    };
    MsgClient: {
        t: T;
        c: Types["MsgClient"];
    };
    MsgToClient: {
        t: T;
        c: Types["MsgToClient"];
    };
    MsgToServer: {
        t: T;
        c: Types["MsgToServer"];
    };
    ModelSync: {
        t: T;
        c: Types["ModelSync"];
    };
    MsgSync: {
        t: T;
        c: Types["MsgSync"];
    };
    ClientCtx: Types["ClientCtx"];
}> => {
    return {
        init: (input) => {
            const initial = client.init({
                ctx: input.ctx,
                modelSync: input.modelSync.c,
                model: input.model?.c,
            });
            return {
                model: { t: tag, c: initial.model },
                eff: Eff.tag(tag, initial.eff),
                msgCmd: ClientCmd.tag(tag, initial.msgCmd),
            };
        },
        update: (input) => {
            const updated = client.update({
                msgEvt: input.msgEvt,
                msg: input.msg?.t === tag ? input.msg?.c : undefined,
                model: input.model?.t === tag ? input.model?.c : undefined,
                msgSync: input.msgSync?.t === tag ? input.msgSync?.c : undefined,
                msgServer: input.msgServer?.t === tag ? input.msgServer?.c : undefined,
                ctx: input.ctx,
                modelSync: input.modelSync.c,
                modelSyncBefore: input.modelSyncBefore.c,
            });
            return {
                model: { t: tag, c: updated.model },
                eff: Eff.tag(tag, updated.eff),
                msgCmd: ClientCmd.tag(tag, updated.msgCmd),
                msgSync: updated.msgSync
                    ? updated.msgSync.map((msgSync): WithEventMeta<{
                        t: T;
                        c: WithEventMeta<Types["MsgSync"]>;
                    }> => ({
                        eventId: msgSync.msgEvtId,
                        happenedAt: msgSync.happenedAt,
                        t: tag,
                        c: {
                            ...msgSync,
                            msgEvtId: msgSync.msgEvtId,
                            happenedAt: msgSync.happenedAt,
                        },
                    }))
                    : undefined,
            };
        },
        subscriptions: (input) => {
            return Sub.tag(tag, client.subscriptions({
                ctx: input.ctx,
                intervalId: input.intervalId,
                modelSync: input.modelSync.c,
                model: input.model?.c,
            }));
        },
        View: (input) => {
            return (<client.View ctx={input.ctx} modelSync={input.modelSync.c} dispatch={(m) => input.dispatch({ t: tag, c: m })} model={input.model?.c}/>);
        },
        ViewFeedItem: (input) => {
            if (client.ViewFeedItem) {
                return client.ViewFeedItem({
                    ctx: input.ctx,
                    msgEvt: input.msgEvt.c,
                    modelSync: input.modelSync.c,
                });
            }
            return null;
        },
    };
};
/**
 * @description
 * A helper function used for chaining together update functions together.
 * @example
 * const updated = chain(
 * { model: 0 },
 * (model) => ({ model: model + 1, msgEvt: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, msgCmd: [someCmd] }),
 * )
 * //=> { model: 3, msgEvt: [someEvent], eff: someEff, msgCmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
const chain = <T extends GameClientTypes>(initial: Output<T>, ...updaters: ((input: T["ModelClient"]) => Output<T>)[]): Output<T> => {
    const msgCmd: ClientCmd<{
        MsgClient: T["MsgClient"];
        MsgToServer: T["MsgToServer"];
    }>[] = initial.msgCmd ?? [];
    const msgSyncs: T["MsgSync"][] = initial?.msgSync ?? [];
    const eff: Eff<T["MsgClient"]>[] = initial.eff ? [initial.eff] : [];
    let model = initial.model;
    let i = 0;
    let len = updaters.length;
    for (i = 0; i < len; ++i) {
        const updated = updaters[i]!(model);
        model = updated.model;
        if (updated.eff) {
            eff.push(updated.eff);
        }
        if (updated.msgSync) {
            let j = 0;
            let len = updated.msgSync.length;
            for (j = 0; j < len; ++j) {
                msgSyncs.push(updated.msgSync[j]!);
            }
        }
        if (updated.msgCmd) {
            let j = 0;
            let len = updated.msgCmd.length;
            for (j = 0; j < len; ++j) {
                msgCmd.push(updated.msgCmd[j]!);
            }
        }
    }
    return {
        model,
        eff: Eff.batch(eff),
        msgSync: msgSyncs,
        msgCmd,
    };
};
const tagOutput = <TTag extends string, TTypes extends GameClientTypes>(tag: TTag, output: Output<TTypes>): Output<{
    ModelClient: {
        t: TTag;
        c: TTypes["ModelClient"];
    };
    MsgClient: {
        t: TTag;
        c: TTypes["MsgClient"];
    };
    MsgToClient: {
        t: TTag;
        c: TTypes["MsgToClient"];
    };
    MsgToServer: {
        t: TTag;
        c: TTypes["MsgToServer"];
    };
    ModelSync: {
        t: TTag;
        c: TTypes["ModelSync"];
    };
    MsgSync: {
        t: TTag;
        c: TTypes["MsgSync"];
    };
    ClientCtx: TTypes["ClientCtx"];
}> => {
    return {
        model: {
            t: tag,
            c: output.model,
        },
        eff: output.eff ? Eff.tag(tag, output.eff) : undefined,
        msgCmd: output.msgCmd
            ? output.msgCmd.map((msgCmd) => ClientCmd.tagOne(tag, msgCmd))
            : undefined,
        msgSync: output.msgSync
            ? output.msgSync.map((msgSync) => ({
                eventId: msgSync.eventId,
                happenedAt: msgSync.happenedAt,
                t: tag,
                c: msgSync,
            }))
            : undefined,
    };
};
export const GameClient = {
    tag,
    tagOutput,
    chain,
};
