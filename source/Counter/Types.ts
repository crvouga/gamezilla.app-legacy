import { Option } from "Core";

export type CounterModel = {
  status: "Incrementing" | "Idle";
  count: number;
};

export type BackendModel = CounterModel;

export type FrontendModel = Option.Option<CounterModel>;

export type FrontendMsg = ["ClickedToggle"];

export type ToBackend = ["ClickedToggle"];

export type BackendMsg = ["Ticked"] | ["ClientConnected", string];

export type ToFrontend = ["CounterNew", CounterModel];
