export type IName = string & { type: "Name" };

export const toName = (name?: string | null) => {
  return (name?.trim() ?? "") as IName;
};
