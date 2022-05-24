export const exhaustive = (
  discriminatedUnionType: "There is a missing case when switching on discriminated union"
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`);
};

export const groupMsg =
  <Msg, Group extends string>(group: Group) =>
  (msg: Msg): Msg & { group: Group } => {
    return { ...msg, group: group } as const;
  };

export type Group<GroupName extends string, Msg> = {
  group: GroupName;
} & Msg;
