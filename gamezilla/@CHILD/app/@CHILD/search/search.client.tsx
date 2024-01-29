import { Browser, Eff, matchSort, p } from "gamezilla/@SHARED/core";
import {
  ClientEvent,
  ClientCmd,
  sendMsgToServer,
  pushRoute,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconMagnifyingGlass,
  IconXMark,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  ClientModel,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "./search.core";

//
//
//
// Model
//
//
//

export const init = ({
  stored,
}: {
  stored: ClientModel | null;
}): {
  model: ClientModel;
} => {
  if (stored) {
    return {
      model: stored,
    };
  }
  return {
    model: {
      searchText: "",
      searchResults: {},
      requests: {},
    },
  };
};

//
//
//
// Update
//
//
//

export type Msg = MsgClient;

const searchInputId = "search-input";

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<Msg>;
  msgEvt?: ClientEvent[];
  msgCmd?: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>[];
} => {
  if (msg.t === "focus-done") {
    return { model };
  }

  if (msg.t === "clicked-clear") {
    return {
      model: { ...model, searchText: "" },
      eff: p(
        Browser.focus(searchInputId),
        Eff.perform((result) => ({ t: "focus-done", result }))
      ),
    };
  }

  if (msg.t === "clicked-result") {
    return {
      model,
      msgCmd: [
        pushRoute({
          t: "profile",
          c: { t: "profile", userId: msg.userId },
        }),
      ],
    };
  }

  if (msg.t === "inputted-search-text") {
    return {
      model: { ...model, searchText: msg.searchText },
    };
  }

  return { model, msgCmd: [sendMsgToServer(msg)] };
};

export const updateFromServer = ({
  model,
}: {
  msg: MsgToClient;
  model: ClientModel;
}): { model: ClientModel; eff?: Eff<Msg> } => {
  return { model };
};

//
//
//
// View
//
//
//

export const View = ({
  model,
  dispatch,
  viewBottomBar,
}: {
  model: ClientModel;
  dispatch: (msg: Msg) => void;
  viewBottomBar: VDom;
}) => {
  //   const request = model.requests[model.searchText] ?? { type: 'not-asked' };
  const results = matchSort(
    Object.values(model.searchResults),
    (item) => item.username,
    model.searchText
  );

  return (
    <>
      <div className="flex h-full w-full flex-col">
        {/* input */}
        <div className="w-full p-4">
          <div className="flex w-full items-center gap-2 rounded-full bg-neutral-700 px-4 py-2">
            <IconMagnifyingGlass className="h-6 w-6" />
            <input
              id={searchInputId}
              className="flex-1 bg-transparent text-lg outline-none"
              placeholder="Search"
              value={model.searchText}
              onChange={(msgEvt) =>
                dispatch({
                  t: "inputted-search-text",
                  searchText: msgEvt.currentTarget.value,
                })
              }
            ></input>
            <button onClick={() => dispatch({ t: "clicked-clear" })}>
              <IconXMark className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* results */}
        <ul>
          {results.map((result) => (
            <li key={result.userId}>
              <button
                className="flex w-full items-center gap-4 p-4 hover:bg-neutral-700"
                onClick={() =>
                  dispatch({ t: "clicked-result", userId: result.userId })
                }
              >
                {result.username}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {viewBottomBar}
    </>
  );
};
