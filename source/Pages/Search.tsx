import * as Route from "Route";
import * as Store from "Store";
import * as UI from "UI";
import { Browser, Cmd, RemoteData, Sub, pipe } from "Core";
import { matchSorter } from "match-sorter";

//
//
//
// Model
//
//
//

export type Model = {
  searchText: string;
};

export const init: [Model, Cmd.Cmd<Msg>, OutAction[]] = [
  {
    searchText: "",
  },
  Cmd.None,
  [Store.Profile.Search("")],
];

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "InputtedSearchText"; searchText: string }
  | { type: "ClickedClear" }
  | { type: "ClickedResult"; userId: string }
  | { type: "FocusResulted" };

export type OutAction = Store.Action;

const SearchInputId = "SearchInput";

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "FocusResulted":
      return [model, Cmd.None, []];

    case "ClickedClear":
      return [
        { ...model, searchText: "" },
        pipe(
          Browser.focus(SearchInputId),
          Cmd.fromTask((result) => ({ type: "FocusResulted", result })),
        ),
        [],
      ];

    case "ClickedResult":
      return [model, Route.push({ type: "Profile", userId: msg.userId }), []];

    case "InputtedSearchText":
      const seachTextNew = msg.searchText;
      return [
        { ...model, searchText: seachTextNew },
        Cmd.None,
        [Store.Profile.Search(seachTextNew)],
      ];
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const view =
  ({ store }: { store: Store.Model }, model: Model): UI.View<Msg> =>
  (dispatch) => {
    const results = Store.Profile.toSearch(model.searchText, store);
    const query =
      store.queries.Profile.Search[model.searchText] ?? RemoteData.NotAsked;

    return (
      <UI.Box sx={{ height: "100%", width: "100%" }}>
        <UI.TextField
          id={SearchInputId}
          placeholder="Search"
          fullWidth
          value={model.searchText}
          onChange={(event) =>
            dispatch({
              type: "InputtedSearchText",
              searchText: event.target.value,
            })
          }
          InputProps={{
            endAdornment: (
              <UI.InputAdornment position="end">
                <UI.IconButton
                  onClick={() => dispatch({ type: "ClickedClear" })}
                >
                  <UI.Icons.Close />
                </UI.IconButton>
              </UI.InputAdornment>
            ),
          }}
        />

        {query.type === "Failure" && <UI.Box sx={{ flex: 1 }}></UI.Box>}
        {query.type === "NotAsked" && <UI.Box sx={{ flex: 1 }}></UI.Box>}

        <UI.Box sx={{ flex: 1 }}>
          {results.map((result) => (
            <UI.ListItemButton
              key={result.userId}
              sx={{ flex: 1, width: "100%" }}
              onClick={() =>
                dispatch({ type: "ClickedResult", userId: result.userId })
              }
            >
              <UI.ListItemAvatar>
                <UI.Avatar src={result.avatarUrl} />
              </UI.ListItemAvatar>
              <UI.ListItemText primary={result.username} />
              <UI.ListItemSecondaryAction>
                <UI.Icons.ChevronRight />
              </UI.ListItemSecondaryAction>
            </UI.ListItemButton>
          ))}
        </UI.Box>

        {query.type === "Loading" && (
          <UI.Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UI.CircularProgress />
          </UI.Box>
        )}
      </UI.Box>
    );
  };
