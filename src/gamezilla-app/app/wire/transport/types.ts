export type MsgServerToMsgClient<MsgToClient> = {
  m: MsgToClient[]
  v: string
}

export type MsgClientToMsgServer<MsgToServer> = {
  m: MsgToServer[]
  v: string
}
