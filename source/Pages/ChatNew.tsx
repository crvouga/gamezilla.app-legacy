import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as Navigation from "Framework/Navigation";
import * as View from "View";
import * as Profile from "Store/Profile";
import * as Store from "Store";
import { pipe } from "fp-ts/lib/function";
import { attempt } from "Framework/Task";
import { either } from "fp-ts";

//
//
//
// Model
//
//
//

export type Model = {
  searchText: string;
  searchResults: SearchResult[];
  selected: { [userId: string]: SearchResult };
  searchStatus: "Idle" | "Searching";
  status: "Idle" | "Creating";
};

type SearchResult = { userId: string; username: string; avatarUrl: string };

//
//
//
// Init
//
//
//

export const init = (): [Model, Cmd<Msg>] => [
  {
    searchText: "",
    searchResults: [],
    selected: {},
    searchStatus: "Searching",
    status: "Idle",
  },
  searchUsers(""),
];

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedCancelButton" }
  | { type: "UserEnteredSearchText"; searchText: string }
  | { type: "RecievedSearchResults"; searchResults: SearchResult[] }
  | { type: "UserClickedSearchResult"; searchResult: SearchResult }
  | { type: "Problem" }
  | { type: "UserClickedSelectedDeleteButton"; userId: string }
  | { type: "UserClickedCreateButton" };

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedCreateButton":
      return [{ ...model, status: "Creating" }, cmd.none];

    case "UserClickedCancelButton":
      return [model, Navigation.back()];

    case "UserEnteredSearchText":
      return [
        { ...model, searchText: msg.searchText, searchStatus: "Searching" },
        searchUsers(msg.searchText),
      ];

    case "UserClickedSelectedDeleteButton":
      const selectedNew = removeKey(msg.userId, model.selected);
      return [{ ...model, selected: selectedNew }, cmd.none];

    case "RecievedSearchResults":
      return [
        { ...model, searchResults: msg.searchResults, searchStatus: "Idle" },
        cmd.none,
      ];

    case "Problem":
      return [{ ...model, searchStatus: "Idle" }, cmd.none];

    case "UserClickedSearchResult":
      const userId = msg.searchResult.userId;

      if (userId in model.selected) {
        return [
          {
            ...model,
            searchText: "",
            selected: removeKey(userId, model.selected),
          },
          searchUsers(""),
        ];
      }

      return [
        {
          ...model,
          searchText: "",
          selected: {
            ...model.selected,
            [msg.searchResult.userId]: msg.searchResult,
          },
        },
        searchUsers(""),
      ];
  }
};

const searchUsers = (nameOrUsername: string) => {
  return pipe(
    Profile.search({ nameOrUsername }),
    attempt(
      either.fold<{ message: string }, Profile.Profile[], Msg>(
        () => ({ type: "Problem" }),
        (searchResults) => ({
          type: "RecievedSearchResults",
          searchResults,
        })
      )
    )
  );
};

//
//
//
// View
//
//
//

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedCancelButton" })}
            />
          }
          title="New message"
          right={
            <View.Button
              loading={model.status === "Creating"}
              sx={{ marginRight: -1 }}
              onClick={() => dispatch({ type: "UserClickedCreateButton" })}
            >
              Chat
            </View.Button>
          }
        />

        <View.Typography variant="h6" sx={{ fontWeight: "bold", paddingX: 2 }}>
          To
        </View.Typography>

        <View.Box sx={{ display: "flex", alignItems: "center", paddingY: 2 }}>
          {Object.values(model.selected).map((searchResult) => (
            <View.Chip
              sx={{ marginLeft: 1 }}
              key={searchResult.userId}
              label={searchResult.username}
              onDelete={() => {
                dispatch({
                  type: "UserClickedSelectedDeleteButton",
                  userId: searchResult.userId,
                });
              }}
            />
          ))}
          <View.InputBase
            sx={{ paddingLeft: 2, flex: 1 }}
            autoFocus
            placeholder={
              Object.values(model.selected).length === 0 ? "Search" : ""
            }
            value={model.searchText}
            onKeyDown={(event) => {
              console.log(event);
            }}
            onChange={(event) => {
              const searchText = event.currentTarget.value;
              dispatch({ type: "UserEnteredSearchText", searchText });
            }}
          />
        </View.Box>

        <View.Divider />

        <View.List>
          {model.searchStatus === "Idle" && model.searchResults.length === 0 && (
            <View.Typography sx={{ p: 2 }} color="text.secondary">
              No account found.
            </View.Typography>
          )}

          {model.searchResults.map((searchResult) => (
            <View.ListItemButton
              key={searchResult.userId}
              onClick={() => {
                dispatch({ type: "UserClickedSearchResult", searchResult });
              }}
            >
              <View.ListItemAvatar>
                <View.Avatar src={searchResult.avatarUrl} />
              </View.ListItemAvatar>
              <View.ListItemText primary={searchResult.username} />

              <View.ListItemSecondaryAction>
                <View.Checkbox
                  checked={searchResult.userId in model.selected}
                />
              </View.ListItemSecondaryAction>
            </View.ListItemButton>
          ))}

          {model.searchStatus === "Searching" && (
            <View.Box
              sx={{
                width: "100%",
                p: 2,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <View.CircularProgress />
            </View.Box>
          )}
        </View.List>
      </View.Page>
    );

//
//
//
// Helpers
//
//
//

const removeKey = <T,>(key: keyof T, a: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = a;
  return rest;
};
