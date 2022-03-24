export type IAuthState =
  | {
      type: "loading";
    }
  | {
      type: "signed-out";
    }
  | {
      type: "signed-in";
      userId: string;
      defaultName: string;
    };

export type IDataAccess = {
  subscribe: (emit: (authState: IAuthState) => void) => () => void;
};
