import { RemoteData } from "../Core";
import { BackendModel } from "../Types";

export type FrontendModel = {
  backendModel: RemoteData.Model<string, BackendModel>;
};

export type ToFrontend = ["BackendModel", BackendModel];
