import { pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";

export const exhaustive = (
  discriminatedUnionType: "Missing Case Error"
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`);
};

export type Group<GroupName extends string, Msg> = {
  group: GroupName;
} & Msg;

export const groupTag =
  <Msg, GroupName extends string>(group: GroupName) =>
  (msg: Msg): Group<GroupName, Msg> => {
    return { ...msg, group: group } as const;
  };

export const andThen =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
    msg: Msg
  ) =>
  ([model, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
    const [modelNew, cmdNew] = update(msg, model);

    return [modelNew, cmd.batch([cmdPrev, cmdNew])];
  };

export const andThenMany =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
    msgs: Msg[]
  ) =>
  ([modelPrev, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
    const [msg, ...msgsRest] = msgs;

    if (!msg) {
      return [modelPrev, cmdPrev];
    }

    const [modelNew, cmdNew] = update(msg, modelPrev);

    return pipe(
      [modelNew, cmd.batch([cmdPrev, cmdNew])],
      andThenMany(update, msgsRest)
    );
  };
