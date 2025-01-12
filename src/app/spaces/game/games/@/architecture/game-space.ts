export type GameSpaceTypes = {
  Ctx: any
  ModelSpace: any
  MsgSpace: any
  EventSpace?: any
}

export type GameSpaceModule<T extends GameSpaceTypes> = {
  initSpace: (input: { ctx: T['Ctx'] }) => T['ModelSpace']
  updateSpace: (input: { ctx: T['Ctx']; msgSpace: T['MsgSpace']; modelSpace: T['ModelSpace'] }) => T['ModelSpace'] & {
    event?: T['EventSpace']
  }
}
