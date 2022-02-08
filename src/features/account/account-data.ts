export type IUserMetadata = {
  name?: string;
};

export type IAuthStatus =
  | {
    type: "loading";
  }
  | {
    type: "logged-out";
  }
  | {
    type: "logged-in";
    userId: string;
    userMetadata: IUserMetadata;
  };

export type ILogin = { provider: "google" };
