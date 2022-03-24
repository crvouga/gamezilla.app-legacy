export type IDataAccess = {
  create: (profile: {
    userId: string;
    avatarUrl: string;
    name: string;
    username: string;
  }) => Promise<
    | {
        type: "success";
      }
    | {
        type: "error";
      }
  >;
};
