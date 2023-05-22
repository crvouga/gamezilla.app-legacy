import { UserId } from '@gamezilla/shared/app';
import { Route } from './route';

//
//
//
// Model
//
//
//

export type AppMsg<T = unknown> =
  | { t: 'route-changed'; route: Route }
  | { t: 'wire-connected' }
  | { t: 'user-logged-in'; currentUserId: UserId }
  | { t: 'toast-enqueued'; message: string; duration?: number };

//
//
//
//
//
//

const map = <TA, TB>(appMsg: AppMsg<TA>, _f: (a: TA) => TB): AppMsg<TB> => {
  return appMsg;
};

export const tagOne = <TTag extends string, TMsg>(
  _tag: TTag,
  appMsg: AppMsg<TMsg>
): AppMsg<{ t: TTag; c: TMsg }> => {
  return appMsg;
};

export const tag = <TTag extends string, TMsg>(
  tag: TTag,
  appMsgs: AppMsg<TMsg>[] = []
): AppMsg<{ t: TTag; c: TMsg }>[] => {
  const mapped: AppMsg<{ t: TTag; c: TMsg }>[] = [];
  for (let i = 0; i < appMsgs.length; i++) {
    const msg = appMsgs[i];
    if (msg) {
      mapped.push(tagOne(tag, msg));
    }
  }
  return mapped;
};

export const AppMsg = {
  map,
  tag,
  tagOne,
};
