export type MsgServerToMsgClient<MsgToClient> = {
  m: MsgToClient[]
}

export type MsgClientToMsgServer<MsgToServer> = {
  m: MsgToServer[]
}
