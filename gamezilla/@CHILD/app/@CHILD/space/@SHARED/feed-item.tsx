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


const Info = ({ text }: { text: string }) => {
  return <div class="w-full flex items-center justify-center text-secondary text-xs">{text}</div>
}

export const FeedItem = {
  Info,
}