import * as SessionFound from "./SessionFound";

export type Model =
  | {
      type: "SessionLoading";
    }
  | {
      type: "SessionFound";
      child: SessionFound.Model;
    }
  | {
      type: "SessionMissing";
    };
