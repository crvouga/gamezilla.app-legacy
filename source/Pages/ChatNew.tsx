import { cmd } from "Core";
import { Cmd } from "Core/Cmd";
import * as Navigation from "Core/Navigation";
import * as Store from "Store";
import * as View from "View";

//
//
//
// Model
//
//
//

export type Model = {
  searchText: string;
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
    selected: {},
    searchStatus: "Idle",
    status: "Idle",
  },
  cmd.none,
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
  | { type: "UserClickedSearchResult"; searchResult: SearchResult }
  | { type: "UserClickedSelectedDeleteButton"; userId: string }
  | { type: "UserClickedCreateButton" };

export type Action = Store.GroupedMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "UserClickedCreateButton":
      return [{ ...model, status: "Creating" }, cmd.none, []];

    case "UserClickedCancelButton":
      return [model, Navigation.back(), []];

    case "UserEnteredSearchText":
      const searchAction = Store.Profile.Search(msg.searchText);
      return [
        {
          ...model,
          searchText: msg.searchText,
          searchStatus: "Searching",
        },
        cmd.none,
        [searchAction],
      ];

    case "UserClickedSelectedDeleteButton":
      const selectedNew = removeKey(msg.userId, model.selected);
      return [{ ...model, selected: selectedNew }, cmd.none, []];

    case "UserClickedSearchResult":
      const userId = msg.searchResult.userId;

      if (userId in model.selected) {
        return [
          {
            ...model,
            searchText: "",
            selected: removeKey(userId, model.selected),
          },
          cmd.none,
          [],
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
        cmd.none,
        [],
      ];
  }
};

//
//
//
// View
//
//
//

export const view =
  (store: Store.Model, model: Model): View.View<Msg> =>
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
              // console.log(event);
            }}
            onChange={(event) => {
              const searchText = event.currentTarget.value;
              dispatch({ type: "UserEnteredSearchText", searchText });
            }}
          />
        </View.Box>

        <View.Divider />

        <View.List>
          {/* {model.searchStatus === "Idle" && model.searchResults.length === 0 && (
            <View.Typography sx={{ p: 2 }} color="text.secondary">
              No account found.
            </View.Typography>
          )} */}

          {Store.searchProfiles(model.searchText, store).map((searchResult) => (
            <View.ListItemButton
              key={searchResult.userId}
              onClick={() => {
                dispatch({ type: "UserClickedSearchResult", searchResult });
              }}
            >
              <View.ListItemAvatar>
                <View.Avatar src={searchResult.avatarUrl} />
              </View.ListItemAvatar>
              <View.ListItemText
                primary={searchResult.username}
                secondary={searchResult.name}
              />

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
