export type IState =
  | {
      type: "idle";
    }
  | {
      type: "signing-in";
      method: ISignInMethod;
    };

export type ISignInMethod = {
  type: "google";
};

export type IDataAccess = {
  signIn: (method: ISignInMethod) => Promise<void>;
};
