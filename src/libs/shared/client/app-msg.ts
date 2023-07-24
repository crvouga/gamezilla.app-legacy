import { UserId, Username } from "@gamezilla/shared/app";
import { Route } from "./route";

//
//
//
// Msg
//
//
//

export type ClientAppMsg<T = unknown> =
  | { t: "route-changed"; route: Route }
  | { t: "push-route"; route: Route }
  | { t: "route-back" }
  | { t: "wire-connected" }
  | { t: "got-current-user"; userId: UserId | null }
  | { t: "toast-enqueued"; text: string; duration?: number }
  | { t: "got-profiles"; profiles: { [userId: string]: Profile } };

export type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
};

//
//
//
//
//
//

const map = <TA, TB>(
  appMsg: ClientAppMsg<TA>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _f: (a: TA) => TB
): ClientAppMsg<TB> => {
  return appMsg;
};

export const tagOne = <TTag extends string, TMsg>(
  _tag: TTag,
  appMsg: ClientAppMsg<TMsg>
): ClientAppMsg<{ t: TTag; c: TMsg }> => {
  return appMsg;
};

export const tag = <TTag extends string, TMsg>(
  tag: TTag,
  appMsgs: ClientAppMsg<TMsg>[] = []
): ClientAppMsg<{ t: TTag; c: TMsg }>[] => {
  const mapped: ClientAppMsg<{ t: TTag; c: TMsg }>[] = [];
  for (let i = 0; i < appMsgs.length; i++) {
    const msg = appMsgs[i];
    if (msg) {
      mapped.push(tagOne(tag, msg));
    }
  }
  return mapped;
};

export const ClientAppMsg = {
  map,
  tag,
  tagOne,
};
