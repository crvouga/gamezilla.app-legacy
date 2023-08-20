import { Browser, Eff, matchSort, p } from "gamezilla/@SHARED/core";
import { ClientAppMsg } from "gamezilla/app/@SHARED/client";
import { IconMagnifyingGlass, IconXMark, VDom } from "gamezilla/app/@SHARED/ui";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./search.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: {
  model: Model;
} = {
  model: {
    searchText: "",
    searchResults: {},
    requests: {},
  },
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

const searchInputId = "search-input";

export const update = ({
  msg,
  model,
  sendToServer,
}: {
  msg: Msg;
  model: Model;
  sendToServer: (m: ToServer) => Eff;
}): {
  model: Model;
  eff?: Eff<Msg>;
  msgs?: ClientAppMsg[];
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
      msgs: [
        {
          t: "route-push",
          route: {
            t: "profile",
            c: { t: "profile", userId: msg.userId },
          },
        },
      ],
    };
  }

  if (msg.t === "inputted-search-text") {
    return {
      model: { ...model, searchText: msg.searchText },
    };
  }

  return { model, eff: sendToServer(msg) };
};

export const updateFromServer = ({
  model,
}: {
  msg: ToClient;
  model: Model;
}): { model: Model; eff?: Eff<Msg> } => {
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
  model: Model;
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
              onChange={(event) =>
                dispatch({
                  t: "inputted-search-text",
                  searchText: event.currentTarget.value,
                })
              }></input>
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
                }>
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
