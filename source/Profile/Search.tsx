import { Browser, Cmd, p, RemoteData } from "../Core"
import { UserId } from "../Data"
import * as Route from "../Route"
import * as ProfileStore from "./Profile.Store"
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

export const init: [Model, Cmd<Msg>, OutAction[]] = [
  {
    searchText: "",
  },
  Cmd.None,
  [["Profile", ["Search", { searchText: "" }]]],
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
  | ["Focus_Done", Browser.FocusResult]
  | ["InputtedSearchText", string]
  | ["ClickedResult", { userId: UserId }]

export type OutAction = ProfileStore.Action

const searchInputId = "SearchInput"

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Focus_Done":
      return [model, Cmd.None, []]

    case "ClickedClear":
      return [
        { ...model, searchText: "" },
        p(
          Browser.focus(searchInputId),
          Cmd.perform((result) => ["Focus_Done", result]),
        ),
        [],
      ]

    case "ClickedResult":
      return [model, Route.push(["Profile", msg[1]]), []]

    case "InputtedSearchText":
      const searchTextNew = msg[1]
      return [
        { ...model, searchText: searchTextNew },
        Cmd.None,
        [["Profile", ["Search", { searchText: searchTextNew }]]],
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

export const View = ({
  profileStore,
  model,
  $d,
}: {
  profileStore: ProfileStore.Model
  model: Model
  $d: (msg: Msg) => void
}) => {
  const results = ProfileStore.toSearch(model.searchText, profileStore)
  const query = profileStore.search[model.searchText] ?? RemoteData.NotAsked

  return (
    <UI.FillBox>
      <UI.InputBase
        sx={{ width: "100%", paddingY: 1, paddingX: 2 }}
        placeholder="Search"
        value={model.searchText}
        onChange={(event) => $d(["InputtedSearchText", event.target.value])}
        endAdornment={
          <UI.InputAdornment position="end">
            {query.type === "Loading" && <UI.CircularProgress size={24} />}
            <UI.IconButton edge="end" onClick={() => $d(["ClickedClear"])}>
              <UI.Icons.Close />
            </UI.IconButton>
          </UI.InputAdornment>
        }
      />

      <UI.Divider />

      {results.length === 0 && (
        <UI.Typography sx={{ paddingX: 2 }} color="text.secondary">
          {query.type === "Loading" ? "Searching..." : "No results found"}
        </UI.Typography>
      )}

      <UI.List sx={{ overflowY: "scroll" }}>
        {results.map((result) => (
          <UI.ListItemButton
            key={result.userId}
            sx={{ width: "100%" }}
            onClick={() => $d(["ClickedResult", { userId: result.userId }])}
          >
            <UI.ListItemAvatar>
              <UI.Avatar src={result.avatarUrl} />
            </UI.ListItemAvatar>
            <UI.ListItemText
              primaryTypographyProps={{ noWrap: true }}
              primary={result.username}
            />
            <UI.ListItemSecondaryAction>
              <UI.Icons.ChevronRight />
            </UI.ListItemSecondaryAction>
          </UI.ListItemButton>
        ))}
      </UI.List>
    </UI.FillBox>
  )
}
