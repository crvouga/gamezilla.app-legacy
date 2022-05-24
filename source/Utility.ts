export const exhaustive = (
  discriminatedUnionType: "There is a missing case when switching on discriminated union"
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`);
};

export type Group<GroupName extends string, Msg> = {
  group: GroupName;
} & Msg;

export const groupTag =
  <Msg, GroupName extends string>(group: GroupName) =>
  (msg: Msg): Group<GroupName, Msg> => {
    return { ...msg, group: group } as const;
  };
