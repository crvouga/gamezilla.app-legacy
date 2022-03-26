export type IProfile = {
  userId: string;
  avatarUrl?: string;
  name?: string;
  username?: string;
};

export type IProfileState =
  | {
      type: "loading";
    }
  | {
      type: "not-found";
    }
  | {
      type: "found";
      profile: IProfile;
    };

export type IDataAccess = {
  subscribe: ({
    userId,
  }: {
    userId: string;
  }) => (emit: (profileState: IProfileState) => void) => () => void;
};
