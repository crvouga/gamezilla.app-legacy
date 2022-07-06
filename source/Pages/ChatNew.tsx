import * as Route from "Route";
import * as Store from "Store";
import * as UI from "UI";
import { Cmd, Keyboard, RemoteData, Sub, pipe } from "Core";
import { useEffect, useRef } from "react";

//
//
//
// Model
//
//
//

export type Model = {
  searchText: string;
  selected: { [userId: string]: string };
  highlightedIndex: "None" | number;
};

//
//
//
// Init
//
//
//

export const init = (): [Model, Cmd.Cmd<Msg>, Action[]] => {
  const searchText = "";
  return [
    {
      searchText,
      selected: {},
      highlightedIndex: "None",
    },
    Cmd.None,
    [Store.Profile.Search(searchText)],
  ];
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "ClickedCancel" }
  | { type: "InputtedSearch"; searchText: string }
  | { type: "ClickedResult"; userId: string }
  | { type: "ClickedSelectedDelete"; userId: string }
  | { type: "ClickedChat" }
  | { type: "PressedKeyDown"; key: Keyboard.ArrowKey | Keyboard.EnterKey };

export type Action = Store.Action;

export const update = (
  { authUserId, store }: { authUserId: string; store: Store.Model },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "ClickedChat":
      const userIds = Object.values(model.selected);
      return [
        model,
        Cmd.None,
        [Store.Conversation.FindOneElseInsert(authUserId, userIds)],
      ];

    case "ClickedCancel":
      return [model, Route.back, []];

    case "InputtedSearch":
      return [
        {
          ...model,
          searchText: msg.searchText,
          highlightedIndex: "None",
        },
        Cmd.None,
        [Store.Profile.Search(msg.searchText)],
      ];

    case "ClickedSelectedDelete":
      const selectedNew = removeKey(msg.userId, model.selected);
      return [{ ...model, selected: selectedNew }, Cmd.None, []];

    case "PressedKeyDown":
      const profiles = Store.Profile.searchProfiles(model.searchText, store);

      switch (msg.key) {
        case "ArrowDown":
          return [
            {
              ...model,
              highlightedIndex:
                model.highlightedIndex === "None"
                  ? 0
                  : circularIndex(model.highlightedIndex + 1, profiles.length),
            },
            Cmd.None,
            [],
          ];

        case "ArrowUp":
          return [
            {
              ...model,
              highlightedIndex:
                model.highlightedIndex === "None"
                  ? 0
                  : circularIndex(model.highlightedIndex - 1, profiles.length),
            },
            Cmd.None,
            [],
          ];

        case "Enter":
          if (model.highlightedIndex === "None") {
            return [model, Cmd.None, []];
          }

          const profile = profiles[model.highlightedIndex];

          if (!profile) {
            return [model, Cmd.None, []];
          }

          return toggleSelected(profile.userId, model);

        case "ArrowLeft":
        case "ArrowRight":
          return [model, Cmd.None, []];
      }

    case "ClickedResult":
      const [modelNew, cmdNew, actions] = toggleSelected(msg.userId, model);
      return [{ ...modelNew, highlightedIndex: "None" }, cmdNew, actions];
  }
};

const toggleSelected = (
  userId: string,
  model: Model,
): [Model, Cmd.Cmd<Msg>, Action[]] => {
  if (userId in model.selected) {
    return [
      {
        ...model,
        searchText: "",
        selected: removeKey(userId, model.selected),
      },
      Cmd.None,
      [],
    ];
  }

  return [
    {
      ...model,
      searchText: "",
      selected: {
        ...model.selected,
        [userId]: userId,
      },
    },
    Cmd.None,
    [],
  ];
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Keyboard.keyDowns((key) =>
    Keyboard.isArrowKey(key) || Keyboard.isEnterKey(key)
      ? { type: "PressedKeyDown", key }
      : Keyboard.SkipFlag,
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
  (
    {
      store,
      currentUserProfile,
    }: {
      store: Store.Model;
      currentUserProfile: Store.Profile.Profile;
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    const mutation = store.mutations.Conversation.FindElseInsert;

    const searchQuery =
      store.queries.Profile.Search[model.searchText] ?? RemoteData.NotAsked;

    const profiles = Store.Profile.searchProfiles(
      model.searchText,
      store,
    ).filter((profile) => profile.userId !== currentUserProfile.userId);

    const selected = Object.keys(model.selected).flatMap((userId) => {
      const profile = store.Profile[userId];
      if (profile) {
        return [profile];
      }
      return [];
    });
    return (
      <UI.Page>
        <UI.Header
          left={
            <UI.HeaderBackButton
              onClick={() => dispatch({ type: "ClickedCancel" })}
            />
          }
          title="New message"
          right={
            <UI.Button
              size="large"
              disabled={Object.values(model.selected).length === 0}
              sx={{ marginRight: -1 }}
              onClick={() => dispatch({ type: "ClickedChat" })}
              loading={mutation.type === "Loading"}
            >
              Chat
            </UI.Button>
          }
        />

        <UI.Typography variant="h6" sx={{ fontWeight: "bold", paddingX: 2 }}>
          To
        </UI.Typography>

        <UI.Box
          sx={{
            display: "flex",
            alignItems: "center",
            paddingBottom: 2,
            paddingTop: 1,
            overflowX: "scroll",
          }}
        >
          {selected.map((profile) => (
            <UI.Chip
              sx={{ marginLeft: 1 }}
              key={profile.userId}
              label={profile.username}
              onDelete={() => {
                dispatch({
                  type: "ClickedSelectedDelete",
                  userId: profile.userId,
                });
              }}
            />
          ))}
          <UI.InputBase
            sx={{ paddingX: 2, flex: 1 }}
            autoFocus
            placeholder={selected.length === 0 ? "Search" : ""}
            value={model.searchText}
            onKeyDown={(event) => {
              //
            }}
            onChange={(event) => {
              const searchText = event.currentTarget.value;
              dispatch({
                type: "InputtedSearch",
                searchText,
              });
            }}
          />
        </UI.Box>

        <UI.Divider />

        <UI.List sx={{ overflowY: "scroll", flex: 1 }}>
          {searchQuery.type === "Success" && profiles.length === 0 && (
            <UI.Typography sx={{ p: 2 }} color="text.secondary">
              No account found.
            </UI.Typography>
          )}

          {profiles.map((profile, index) => (
            <SearchResultListItem
              key={profile.userId}
              profile={profile}
              onClick={() => {
                dispatch({
                  type: "ClickedResult",
                  userId: profile.userId,
                });
              }}
              selected={profile.userId in model.selected}
              highlighted={
                model.highlightedIndex !== "None" &&
                circularIndex(model.highlightedIndex, profiles.length) === index
              }
            />
          ))}

          {searchQuery.type === "Loading" && (
            <UI.Box
              sx={{
                width: "100%",
                p: 2,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <UI.CircularProgress />
            </UI.Box>
          )}
        </UI.List>
      </UI.Page>
    );
  };

const SearchResultListItem = ({
  profile: searchResult,
  onClick,
  highlighted,
  selected,
}: {
  highlighted: boolean;
  selected: boolean;
  profile: Store.Profile.Profile;
  onClick: () => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [highlighted]);
  return (
    <div ref={ref}>
      <UI.ListItemButton
        id={searchResult.userId}
        selected={highlighted}
        key={searchResult.userId}
        onMouseDown={onClick}
      >
        <UI.ListItemAvatar>
          <UI.Avatar src={searchResult.avatarUrl} />
        </UI.ListItemAvatar>
        <UI.ListItemText
          primary={searchResult.username}
          secondary={searchResult.name}
        />

        <UI.ListItemSecondaryAction>
          <UI.Checkbox checked={selected} />
        </UI.ListItemSecondaryAction>
      </UI.ListItemButton>
    </div>
  );
};

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

const circularIndex = (index: number, length: number): number => {
  return ((index % length) + length) % length;
};
