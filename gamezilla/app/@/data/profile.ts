import { UserId } from "./user-id";

export type Profile = {
  userId: UserId;
  avatarUrl: string;
  username: string;
};
