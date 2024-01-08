export type GameCoreTypes = {
  Ctx: any;
  GameState: any;
  GameEvent: any;
};

export type GameCore<T extends GameCoreTypes> = {
  initState: (input: { ctx: T["Ctx"] }) => T["GameState"];
  reducer: (input: {
    ctx: T["Ctx"];
    event: T["GameEvent"];
    state: T["GameState"];
  }) => T["GameState"];
};
