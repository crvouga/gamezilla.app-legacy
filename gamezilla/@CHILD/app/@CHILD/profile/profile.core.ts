import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import {
  ClientId,
  Profile,
  ProfileAvatarSeed,
  ProfileAvatarStyle,
  UserId,
} from "gamezilla/@CHILD/app/@SHARED/data";

//
//
//
// Model
//
//
//

export type ClientModel = {
  profiles: {
    [userId: UserId]: Profile;
  };
  requests: {
    [key in Req["t"]]?: RemoteResult<string, null>;
  };
  draft?: {
    username?: string;
    avatarSeed?: ProfileAvatarSeed;
    avatarStyle?: ProfileAvatarStyle;
  };
};

export type ServerModel = null;

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | Req
  | { t: "inputted-username"; username: string }
  | { t: "inputted-avatar-seed"; seed: string }
  | { t: "inputted-avatar-style"; style: ProfileAvatarStyle }
  | { t: "clicked-generate-random-seed" };

export type ServerMsg = { t: "handled"; clientId: ClientId; msg: ToClient };

export type ToClient =
  | {
      t: "current-user-profile";
      result: Result<string, Profile>;
      source: unknown;
      loggedIn?: boolean;
    }
  | Res;

export type ToServer = Req;

export type Req =
  | { t: "find-one"; userId: UserId }
  | { t: "change-username"; username: string }
  | { t: "search"; query: string }
  | { t: "delete-forever"; query: string };

export type Res = Req & { result: Result<string, Profile[]> };
