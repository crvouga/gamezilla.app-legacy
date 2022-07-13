import { Option } from "Core";

export type Counter = {
  status: "Incrementing" | "Idle";
  count: number;
};

export type BackendModel = Counter;

export type FrontendModel = Option.Option<Counter>;

export type FrontendMsg = { type: "ClickedToggle"; group: "Counter" };

export type ToBackend = { type: "Toggle"; group: "Counter" };

export type BackendMsg = { type: "Ticked" };

export type ToFrontend = {
  group: "Counter";
  type: "CounterNew";
  counter: Counter;
};
