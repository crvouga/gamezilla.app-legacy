import { RemoteData } from "../Core";
import { BackendModel } from "../Types";

export type FrontendModel = {
  backendModel: RemoteData.Model<string, BackendModel>;
  tab: "Model" | "Msg";
};

export type FrontendMsg = ["ClickedBack"];

export type ToFrontend = ["BackendModel", BackendModel];
