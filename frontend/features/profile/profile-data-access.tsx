import * as Create from "./create/create-data-access";
import * as Delete from "./delete/delete-data-access";
import { IDataAccess } from "./profile-logic";
import * as Subscribe from "./subscribe/subscribe-data-access";
import * as Update from "./update/update-data-access";

export const dataAccess: IDataAccess = {
  delete: Delete.dataAccess,
  create: Create.dataAccess,
  update: Update.dataAccess,
  subscribe: Subscribe.dataAccess,
};
