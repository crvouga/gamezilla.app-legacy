import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as Navigation from "Framework/Navigation";
import * as View from "View";
import * as Profile from "Profile";
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
  status: "Idle" | "Searching";
};

type SearchResult = { userId: string; username: string; avatarUrl: string };

//
//
//
// Init
//
//
//

export const init: Model = {
  searchText: "",
  searchResults: [],
  selected: {},
  status: "Idle",
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "ClickedCancelButton" }
  | { type: "UserEnteredSearchText"; searchText: string }
  | { type: "RecievedSearchResults"; searchResults: SearchResult[] }
  | { type: "UserSelectedResult"; searchResult: SearchResult }
  | { type: "Problem" };

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedCancelButton":
      return [model, Navigation.back()];

    case "UserEnteredSearchText":
      return [
        { ...model, searchText: msg.searchText, status: "Searching" },
        pipe(
          Profile.search({ nameOrUsername: msg.searchText }),
          attempt(
            either.fold<{ message: string }, Profile.Profile[], Msg>(
              () => ({ type: "Problem" }),
              (searchResults) => ({
                type: "RecievedSearchResults",
                searchResults,
              })
            )
          )
        ),
      ];

    case "RecievedSearchResults":
      return [
        { ...model, searchResults: msg.searchResults, status: "Idle" },
        cmd.none,
      ];

    case "Problem":
      return [{ ...model, status: "Idle" }, cmd.none];

    case "UserSelectedResult":
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
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch({ type: "ClickedCancelButton" })}
            >
              Cancel
            </View.Button>
          }
          title="New message"
        />

        <View.Autocomplete
          multiple
          options={model.searchResults}
          freeSolo
          fullWidth
          getOptionLabel={(option) => {
            if (typeof option === "string") {
              return option;
            }

            return option.username;
          }}
          onInputChange={(_event, valueNew) => {
            dispatch({ type: "UserEnteredSearchText", searchText: valueNew });
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <View.Chip
                avatar={<View.Avatar src={option.avatarUrl} />}
                variant="outlined"
                label={option.username}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <View.TextField
              {...params}
              label="Users"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {model.status === "Searching" ? (
                      <View.CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(params, option, state) => {
            return (
              <View.ListItemButton
                selected={state.selected}
                key={option.userId}
                onClick={
                  // @ts-ignore
                  (event) => params.onClick(event)
                  // dispatch({ type: "UserSelectedResult", searchResult: option })
                }
              >
                <View.ListItemAvatar>
                  <View.Avatar src={option.avatarUrl} />
                </View.ListItemAvatar>
                <View.ListItemText primary={option.username} />
              </View.ListItemButton>
            );
          }}
        />
      </View.Page>
    );
