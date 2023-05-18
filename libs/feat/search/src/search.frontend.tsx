import { Browser, Cmd, matchSort, p } from '@gamezilla/shared/core';
import { Route } from '@gamezilla/shared/client';
import { IconMagnifyingGlass, IconXMark, ViewNode } from '@gamezilla/shared/ui';
import { ClientModel, ClientMsg, ToServer, ToClient } from './search.types';

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
    searchText: '',
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

const searchInputId = 'search-input';

export const update = ({
  msg,
  model,
  sendToServer,
}: {
  msg: Msg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'focus-done') {
    return { model };
  }

  if (msg.t === 'clicked-clear') {
    return {
      model: { ...model, searchText: '' },
      cmd: p(
        Browser.focus(searchInputId),
        Cmd.perform((result) => ({ t: 'focus-done', result }))
      ),
    };
  }

  if (msg.t === 'clicked-result') {
    return {
      model,
      cmd: Route.push({
        t: 'profile',
        c: { t: 'profile', userId: msg.userId },
      }),
    };
  }

  if (msg.t === 'inputted-search-text') {
    return {
      model: { ...model, searchText: msg.searchText },
    };
  }

  return { model, cmd: sendToServer(msg) };
};

export const updateFromServer = ({
  model,
}: {
  msg: ToClient;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
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
  $send,
  viewBottomBar,
}: {
  model: Model;
  $send: (msg: Msg) => void;
  viewBottomBar: ViewNode;
}) => {
  //   const request = model.requests[model.searchText] ?? { type: 'NotAsked' };
  const results = matchSort(
    Object.values(model.searchResults),
    (item) => item.username,
    model.searchText
  );

  return (
    <>
      <div className="w-full h-full flex flex-col">
        {/* input */}
        <div className="w-full p-4">
          <div className="w-full flex items-center bg-neutral-700 rounded-full px-4 py-2 gap-2">
            <IconMagnifyingGlass />
            <input
              id={searchInputId}
              className="bg-transparent text-lg outline-none flex-1"
              placeholder="Search"
              value={model.searchText}
              onChange={(event) =>
                $send({
                  t: 'inputted-search-text',
                  searchText: event.target.value,
                })
              }
            ></input>
            <button onClick={() => $send({ t: 'clicked-clear' })}>
              <IconXMark />
            </button>
          </div>
        </div>
        {/* results */}
        <ul>
          {results.map((result) => (
            <li key={result.userId}>
              <button
                className="w-full flex items-center gap-4 p-4 hover:bg-neutral-700"
                onClick={() =>
                  $send({ t: 'clicked-result', userId: result.userId })
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
