import type { IAvatarSeed, IAvatarStyle } from "./profile.interface";

export const authUserKey = "auth-user";

export type IAuthMethod =
  | {
      type: "social";
      provider: "google";
    }
  | {
      type: "email";
      emailAddress: string;
    }
  | {
      type: "phone";
      phoneNumber: string;
    };

export type IUserId = string & { type: "IUserId" };

export const toUserId = (userId: string) => {
  return userId as IUserId;
};

export type IAuthUser = {
  userId: IUserId;
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
};

export type IAuthState =
  | {
      status: "loading";
    }
  | {
      status: "authenticated";
      authUser: IAuthUser;
    }
  | {
      status: "unauthenticated";
    };

type IUnsubscribe = () => void;

export type IAuthDataAccess = {
  authenticate: (authMethod: IAuthMethod) => Promise<Error[]>;
  unauthenticate: () => Promise<Error[]>;
  onAuthStateChanged: (set: (authState: IAuthState) => void) => IUnsubscribe;
};
