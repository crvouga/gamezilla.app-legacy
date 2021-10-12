export const authUserKey = "auth-user";

export type IAuthMethod = "google" | "email";

export type IAuthUser = {
  displayName?: string;
  userId: string;
  avatarUrl?: string;
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

export type IAuthDataAccess = {
  authenticate: ({
    authMethod,
  }: {
    authMethod: IAuthMethod;
  }) => Promise<Error[]>;
  unauthenticate: () => Promise<Error[]>;
  onAuthStateChanged: (set: (authState: IAuthState) => void) => () => void;
};
