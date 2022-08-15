import { Browser, Cmd, pipe, RemoteData } from "../Core"
import { UserId } from "../Data"
import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model = {
  searchText: string
}

export const init: [Model, Cmd.Cmd<Msg>, OutAction[]] = [
  {
    searchText: "",
  },
  Cmd.None,
  [["Store", ["Profile", ["Search", { searchText: "" }]]]],
]

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedClear"]
  | ["FocusResulted", Browser.FocusResult]
  | ["InputtedSearchText", string]
  | ["ClickedResult", { userId: UserId.UserId }]

export type OutAction = Store.Action

const SearchInputId = "SearchInput"

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "FocusResulted":
      return [model, Cmd.None, []]

    case "ClickedClear":
      return [
        { ...model, searchText: "" },
        pipe(
          Browser.focus(SearchInputId),
          Cmd.perform((result) => ["FocusResulted", result]),
        ),
        [],
      ]

    case "ClickedResult":
      return [model, Route.push(["Profile", msg[1].userId]), []]

    case "InputtedSearchText":
      const searchTextNew = msg[1]
      return [
        { ...model, searchText: searchTextNew },
        Cmd.None,
        [["Store", ["Profile", ["Search", { searchText: searchTextNew }]]]],
      ]
  }
}

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
    const results = Store.Profile.toSearch(model.searchText, store)
    const query =
      store.queries.Profile.Search[model.searchText] ?? RemoteData.NotAsked

    return (
      <UI.FillBox>
        <UI.Toolbar>
          <UI.InputBase
            sx={{ height: "100%", flex: 1 }}
            placeholder="Search"
            value={model.searchText}
            onChange={(event) =>
              dispatch(["InputtedSearchText", event.target.value])
            }
          />
          <UI.IconButton
            edge="end"
            onClick={() => dispatch(["ClickedClear"])}
          >
            <UI.Icons.Close />
          </UI.IconButton>
        </UI.Toolbar>

        <UI.Divider />

        {query.type === "Failure" && <UI.Box sx={{ flex: 1 }}></UI.Box>}
        {query.type === "NotAsked" && <UI.Box sx={{ flex: 1 }}></UI.Box>}

        <UI.Box sx={{ paddingTop: 1, flex: 1, overflowY: "scroll" }}>
          {results.map((result) => (
            <UI.ListItemButton
              key={result.userId}
              sx={{ flex: 1, width: "100%" }}
              onClick={() =>
                dispatch(["ClickedResult", { userId: result.userId }])
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
      </UI.FillBox>
    )
  }
