export type IUserMetadata = {
  name?: string;
};

export type IAuthState =
   {
      type: "logged-out";
    }
  | {
      type: "logged-in";
      userId: string;
      userMetadata: IUserMetadata;
    };

export type ILogin = { provider: "google" };

export type IThemeMode = "light" | "dark" | "system";
