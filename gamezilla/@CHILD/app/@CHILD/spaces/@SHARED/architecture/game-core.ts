export type GameCoreTypes = {
  Ctx: any;
  GameModel: any;
  GameMsg: any;
};

export type GameCore<T extends GameCoreTypes> = {
  initGame: (input: { ctx: T["Ctx"] }) => T["GameModel"];
  reducer: (input: {
    ctx: T["Ctx"];
    msgEvent: T["GameMsg"];
    state: T["GameModel"];
  }) => T["GameModel"];
};
