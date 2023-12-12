import { SessionId } from "gamezilla/@CHILD/app/@SHARED/data";

export type ServerToClientMsg<ToClient> =
  | {
      t: "to-client";
      msgs: ToClient[];
      codebaseVersionId: string;
    }
  | {
      t: "session-id";
      sessionId: SessionId;
      codebaseVersionId: string;
    };

export type ClientToServerMsg<ToServer> = {
  t: "to-server";
  msgs: ToServer[];
  codebaseVersionId: string;
};
