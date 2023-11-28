/**
 * Debug via standard browser's `console`.
 *
 * @since 0.5.0
 */
import { Option } from "../data/option";
import { p } from "../utils/pipe";
import { Debugger, DebugMsg } from "./debugger-commons";

/**
 * **[UNSAFE]** Simple debugger that uses the standard browser's `console`
 * @category constructors
 * @since 0.5.4
 */

export const makeDebugger = <Model, Msg extends {}>(): Debugger<Model, Msg> => {
  return () => {
    return {
      debug: (data) => {
        const [action, model] = data;

        console.group("%cLOG", "background-color: green; color: black");

        // --- Action
        if (action.type === "INIT") {
          console.info("[INIT]");
        }

        if (action.type === "MESSAGE") {
          const showType = p(action, getMsgType, Option.withDefault(""));

          console.groupCollapsed(
            `[MESSAGE] %c${showType}`,
            "font-weight: bold"
          );
          console.dir(action.payload);
          console.groupEnd();
        }

        // --- Model
        console.groupCollapsed("[MODEL]");
        console.dir(model);
        console.groupEnd();
        console.groupEnd();
      },

      stop: () => {
        console.group("%cLOG", "background-color: green; color: black");
        console.info("--- stop debugger ---");
        console.groupEnd();
      },
    };
  };
};

/**
 * Tries to extract the "type" of a `Message` reading the value of the [_discriminant_ property](http://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions) (iterating through a list of commonly used names - e.g. "tag", "type", "kind" etc.)
 * @since 0.5.0
 */
function getMsgType<Msg>(m: DebugMsg<Msg>): Option<string> {
  // todo: remove any
  const { payload } = m as any;

  const tag = Option.fromNullable(payload["tag"]);

  if (tag.type === "Some") {
    return tag;
  }

  const _tag = Option.fromNullable(payload["_tag"]);

  if (_tag.type === "Some") {
    return _tag;
  }

  const type = Option.fromNullable(payload["type"]);

  if (type.type === "Some") {
    return type;
  }

  const _type = Option.fromNullable(payload["_type"]);

  if (_type.type === "Some") {
    return _type;
  }

  const kind = Option.fromNullable(payload["kind"]);

  if (kind.type === "Some") {
    return kind;
  }

  const _kind = Option.fromNullable(payload["_kind"]);

  if (_kind.type === "Some") {
    return _kind;
  }

  return Option.None;
}
