export type IUserId = string & { type: "IUserId" };

export const toUserId = (userId: string) => {
  return userId as IUserId;
};
