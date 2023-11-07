import { SpaceClientCtx } from "./space";

export type ActivityFeedItem =
  | {
      t?: "info";
      text: string;
    }
  | {
      t: "error";
      text: string;
    };

export type ViewActivityFeedItem<State, Event> = (input: {
  event: Event;
  state: State;
  ctx: SpaceClientCtx;
}) => ActivityFeedItem | null;
