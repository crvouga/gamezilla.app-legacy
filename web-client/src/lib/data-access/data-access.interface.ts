import type { IAuthDataAccess } from "./auth-data-access.interface";
import type { ILobbyDataAccess } from "./lobby-data-access.interface";

export type IDataAccess = {
  auth: IAuthDataAccess;
  lobby: ILobbyDataAccess;
};
