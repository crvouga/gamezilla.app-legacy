import { SessionId } from "gamezilla/@CHILD/app/@SHARED/data";

export type ServerMsgToClientMsg<MsgToClient> =
  | {
      t: "to-client";
      msgs: MsgToClient[];
      codebaseVersionId: string;
    }
  | {
      t: "session-id";
      sessionId: SessionId;
      codebaseVersionId: string;
    };

export type ClientMsgToServerMsg<MsgToServer> = {
  t: "to-server";
  msgs: MsgToServer[];
  codebaseVersionId: string;
};
