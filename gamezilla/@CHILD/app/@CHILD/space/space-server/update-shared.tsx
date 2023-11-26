import {
  Space,
  SpaceServerCmd,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { ServerCmd, sendToUser } from "gamezilla/@CHILD/app/@SHARED/server";
import { ToClient } from "../space.core";

export function spaceCmdToCmd(space: Space, cmd?: SpaceServerCmd<ToClient>[]) {
  return cmd?.map((cmd): ServerCmd<ToClient> => {
    switch (cmd.t) {
      case "send-to-space": {
        const userIds = Object.values(space.users);
        return sendToUser(userIds, cmd.msg);
      }
      default: {
        return cmd;
      }
    }
  });
}
