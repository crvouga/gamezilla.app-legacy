export type GameCoreTypes = {
    Ctx: any;
    ModelSync: any;
    MsgSync: any;
};
export type GameCore<T extends GameCoreTypes> = {
    initSync: (input: {
        ctx: T["Ctx"];
    }) => T["ModelSync"];
    reducer: (input: {
        ctx: T["Ctx"];
        msgSync: T["MsgSync"];
        modelSync: T["ModelSync"];
    }) => T["ModelSync"];
};
