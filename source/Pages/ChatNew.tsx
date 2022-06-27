import * as Route from "Route"
import * as Store from "Store"
import * as View from "View"
import { Cmd, Keyboard, Sub, pipe } from "Core"
import { useEffect, useRef } from "react"

//
//
//
// Model
//
//
//

export type Model = {
  searchText: string
  selected: { [userId: string]: string }
  highlightedIndex: "None" | number
}

//
//
//
// Init
//
//
//

export const init = (): [Model, Cmd.Cmd<Msg>, Action[]] => {
  const searchText = ""
  return [
    {
      searchText,
      selected: {},
      highlightedIndex: "None",
    },
    Cmd.none,
    [Store.Profile.Search(searchText)],
  ]
}

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
  | { type: "ClickedCreate" }
  | { type: "PressedKeyDown"; key: Keyboard.ArrowKey | Keyboard.EnterKey }

export type Action = Store.Action

export const update = (
  { authUserId, store }: { authUserId: string; store: Store.Model },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "ClickedCreate":
      const userIds = Object.values(model.selected)
      return [model, Cmd.none, [Store.Conversation.Create(authUserId, userIds)]]

    case "ClickedCancel":
      return [model, Route.back(), []]

    case "InputtedSearch":
      return [
        {
          ...model,
          searchText: msg.searchText,
          highlightedIndex: "None",
        },
        Cmd.none,
        [Store.Profile.Search(msg.searchText)],
      ]

    case "ClickedSelectedDelete":
      const selectedNew = removeKey(msg.userId, model.selected)
      return [{ ...model, selected: selectedNew }, Cmd.none, []]

    case "PressedKeyDown":
      const profiles = Store.Profile.searchProfiles(model.searchText, store)

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
            Cmd.none,
            [],
          ]

        case "ArrowUp":
          return [
            {
              ...model,
              highlightedIndex:
                model.highlightedIndex === "None"
                  ? 0
                  : circularIndex(model.highlightedIndex - 1, profiles.length),
            },
            Cmd.none,
            [],
          ]

        case "Enter":
          if (model.highlightedIndex === "None") {
            return [model, Cmd.none, []]
          }

          const profile = profiles[model.highlightedIndex]

          if (!profile) {
            return [model, Cmd.none, []]
          }

          return toggleSelected(profile.userId, model)

        case "ArrowLeft":
        case "ArrowRight":
          return [model, Cmd.none, []]
      }

    case "ClickedResult":
      const [modelNew, cmdNew, actions] = toggleSelected(msg.userId, model)
      return [{ ...modelNew, highlightedIndex: "None" }, cmdNew, actions]
  }
}

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
      Cmd.none,
      [],
    ]
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
    Cmd.none,
    [],
  ]
}

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
  )
}

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
      store: Store.Model
      currentUserProfile: Store.Profile.Profile
    },
    model: Model,
  ): View.View<Msg> =>
  (dispatch) => {
    const mutation = Store.Conversation.toCreateMutation(store)

    const profileSearchQuery = Store.Profile.toSearchQuery(
      model.searchText,
      store,
    )

    const profiles = Store.Profile.searchProfiles(
      model.searchText,
      store,
    ).filter((profile) => profile.userId !== currentUserProfile.userId)

    const selected = Object.keys(model.selected).flatMap((userId) => {
      const profile = store.Profile[userId]
      if (profile) {
        return [profile]
      }
      return []
    })
    return (
      <View.Page>
        {/* <View.LinearProgress /> */}

        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "ClickedCancel" })}
            />
          }
          title="New message"
          right={
            <View.Button
              size="large"
              disabled={Object.values(model.selected).length === 0}
              sx={{ marginRight: -1 }}
              onClick={() => dispatch({ type: "ClickedCreate" })}
              loading={mutation.type === "Loading"}
            >
              Chat
            </View.Button>
          }
        />

        <View.Typography variant="h6" sx={{ fontWeight: "bold", paddingX: 2 }}>
          To
        </View.Typography>

        <View.Box
          sx={{
            display: "flex",
            alignItems: "center",
            paddingBottom: 2,
            paddingTop: 1,
          }}
        >
          {selected.map((profile) => (
            <View.Chip
              sx={{ marginLeft: 1 }}
              key={profile.userId}
              label={profile.username}
              onDelete={() => {
                dispatch({
                  type: "ClickedSelectedDelete",
                  userId: profile.userId,
                })
              }}
            />
          ))}
          <View.InputBase
            sx={{ paddingLeft: 2, flex: 1 }}
            autoFocus
            placeholder={selected.length === 0 ? "Search" : ""}
            value={model.searchText}
            onKeyDown={(event) => {
              // console.log(event);
            }}
            onChange={(event) => {
              const searchText = event.currentTarget.value
              dispatch({
                type: "InputtedSearch",
                searchText,
              })
            }}
          />
        </View.Box>

        <View.Divider />

        <View.List sx={{ overflowY: "scroll", flex: 1 }}>
          {profileSearchQuery.type === "Success" && profiles.length === 0 && (
            <View.Typography sx={{ p: 2 }} color="text.secondary">
              No account found.
            </View.Typography>
          )}

          {profiles.map((profile, index) => (
            <SearchResultListItem
              key={profile.userId}
              profile={profile}
              onClick={() => {
                dispatch({
                  type: "ClickedResult",
                  userId: profile.userId,
                })
              }}
              selected={profile.userId in model.selected}
              highlighted={
                model.highlightedIndex !== "None" &&
                circularIndex(model.highlightedIndex, profiles.length) === index
              }
            />
          ))}

          {profileSearchQuery.type === "Loading" && (
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
    )
  }

const SearchResultListItem = ({
  profile: searchResult,
  onClick,
  highlighted,
  selected,
}: {
  highlighted: boolean
  selected: boolean
  profile: Store.Profile.Profile
  onClick: () => void
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [highlighted])
  return (
    <div ref={ref}>
      <View.ListItemButton
        id={searchResult.userId}
        selected={highlighted}
        key={searchResult.userId}
        onMouseDown={onClick}
      >
        <View.ListItemAvatar>
          <View.Avatar src={searchResult.avatarUrl} />
        </View.ListItemAvatar>
        <View.ListItemText
          primary={searchResult.username}
          secondary={searchResult.name}
        />

        <View.ListItemSecondaryAction>
          <View.Checkbox checked={selected} />
        </View.ListItemSecondaryAction>
      </View.ListItemButton>
    </div>
  )
}

//
//
//
// Helpers
//
//
//

const removeKey = <T,>(key: keyof T, a: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = a
  return rest
}

const circularIndex = (index: number, length: number): number => {
  return ((index % length) + length) % length
}
