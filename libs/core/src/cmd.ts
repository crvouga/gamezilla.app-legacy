import { p } from './pipe';
import { Task } from './task';

export type Cmd<Msg = never> = ($send: (msg: Msg) => void) => void;

const of = <Msg>(msg: Msg): Cmd<Msg> => {
  return ($send) => {
    $send(msg);
  };
};

const map =
  <A, B>(mapper: (a: A) => B) =>
  (cmd: Cmd<A>): Cmd<B> => {
    return ($send) => {
      cmd((a) => {
        $send(mapper(a));
      });
    };
  };

const chain =
  <A, B>(mapper: (a: A) => Cmd<B>) =>
  (cmd: Cmd<A>): Cmd<B> => {
    return ($send) => {
      cmd((a) => {
        mapper(a)((b) => {
          $send(b);
        });
      });
    };
  };

const tag = <Tag extends string, Msg>(
  tagName: Tag,
  cmd: Cmd<Msg>
): Cmd<[Tag, Msg]> => {
  return p(
    cmd,
    map((msg) => [tagName, msg])
  );
};

const tag_ = <Tag extends string, Msg>(
  tagName: Tag,
  cmd: Cmd<Msg>
): Cmd<{ t: Tag; c: Msg }> => {
  return p(
    cmd,
    map((msg) => ({ t: tagName, c: msg }))
  );
};

const batch = <Msg>(cmdList: (Cmd<Msg> | undefined | null)[]): Cmd<Msg> => {
  return ($send) => {
    for (let i = 0; i < cmdList.length; i++) {
      const cmd = cmdList[i];
      if (cmd) {
        cmd($send);
      }
    }
  };
};

const None: Cmd = () => {
  // do nothing
};

const perform =
  <A, Msg>(f: (a: A) => Msg) =>
  (task: Task<A>): Cmd<Msg> => {
    return async ($send) => {
      const value = await task();
      $send(f(value));
    };
  };

export const Cmd = {
  None,
  perform,
  batch,
  tag,
  tag_,
  chain,
  map,
  of,
};
