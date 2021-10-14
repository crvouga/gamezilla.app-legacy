import { DataAccess } from "./data-access";
import { Stores } from "./stores";

export const dataAccess = DataAccess();
export const stores = Stores(dataAccess);
