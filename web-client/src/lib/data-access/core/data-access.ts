import type { IAuthDataAccess } from "./auth";
import type { ILobbyDataAccess } from "./lobby";
import type { IProfileDataAccess } from "./profile";

export type IDataAccess = {
  auth: IAuthDataAccess;
  lobby: ILobbyDataAccess;
  profile: IProfileDataAccess;
};
