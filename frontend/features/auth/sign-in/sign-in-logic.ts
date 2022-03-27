export type ISignInMethod = {
  type: "google";
};

export type IDataAccess = {
  signIn: (method: ISignInMethod) => Promise<void>;
};
