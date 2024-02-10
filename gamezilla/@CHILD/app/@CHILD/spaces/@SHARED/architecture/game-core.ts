export type GameCoreTypes = {
  Ctx: any
  ModelGame: any
  MsgGame: any
}

export type GameCore<T extends GameCoreTypes> = {
  initGame: (input: { ctx: T["Ctx"] }) => T["ModelGame"]
  reducer: (input: {
    ctx: T["Ctx"]
    msgGame: T["MsgGame"]
    modelGame: T["ModelGame"]
  }) => T["ModelGame"]
}
