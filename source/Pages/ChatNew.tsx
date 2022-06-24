import { cmd, sub } from "Core"
import { Cmd } from "Core/Cmd"
import * as Navigation from "Core/Navigation"
import * as Keyboard from "Core/Keyboard"
import { Sub } from "Core/Sub"
import * as Store from "Store"
import * as View from "View"
import { pipe } from "fp-ts/lib/function"
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
  selected: { [userId: string]: SearchResult }
  highlightedIndex: "None" | number
}

type SearchResult = {
  userId: string
  username: string
  avatarUrl: string
  name: string
}

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
    highlightedIndex: "None",
  },
  cmd.none,
]

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
  | { type: "UserClickedCreateButton" }
  | { type: "UserPressedKeyDown"; key: Keyboard.ArrowKey | Keyboard.EnterKey }

export type Action = Store.GroupedMsg

export const update = (
  store: Store.Model,
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "UserClickedCreateButton":
      return [model, cmd.none, []]

    case "UserClickedCancelButton":
      return [model, Navigation.back(), []]

    case "UserEnteredSearchText":
      return [
        {
          ...model,
          searchText: msg.searchText,
          highlightedIndex: "None",
        },
        cmd.none,
        [Store.Profile.Search(msg.searchText)],
      ]

    case "UserClickedSelectedDeleteButton":
      const selectedNew = removeKey(msg.userId, model.selected)
      return [{ ...model, selected: selectedNew }, cmd.none, []]

    case "UserPressedKeyDown":
      const searchResults = Store.searchProfiles(model.searchText, store)

      switch (msg.key) {
        case "ArrowDown":
          return [
            {
              ...model,
              highlightedIndex:
                model.highlightedIndex === "None"
                  ? 0
                  : circularIndex(
                      model.highlightedIndex + 1,
                      searchResults.length,
                    ),
            },
            cmd.none,
            [],
          ]

        case "ArrowUp":
          return [
            {
              ...model,
              highlightedIndex:
                model.highlightedIndex === "None"
                  ? 0
                  : circularIndex(
                      model.highlightedIndex - 1,
                      searchResults.length,
                    ),
            },
            cmd.none,
            [],
          ]

        case "Enter":
          if (model.highlightedIndex === "None") {
            return [model, cmd.none, []]
          }

          const selectedResult = searchResults[model.highlightedIndex]

          if (!selectedResult) {
            return [model, cmd.none, []]
          }

          return toggleSelected(selectedResult, model)

        case "ArrowLeft":
        case "ArrowRight":
          return [model, cmd.none, []]
      }

    case "UserClickedSearchResult":
      const [modelNew, cmdNew, actions] = toggleSelected(
        msg.searchResult,
        model,
      )
      return [{ ...modelNew, highlightedIndex: "None" }, cmdNew, actions]
  }
}

const toggleSelected = (
  searchResult: SearchResult,
  model: Model,
): [Model, Cmd<Msg>, Action[]] => {
  if (searchResult.userId in model.selected) {
    return [
      {
        ...model,
        searchText: "",
        selected: removeKey(searchResult.userId, model.selected),
      },
      cmd.none,
      [],
    ]
  }

  return [
    {
      ...model,
      searchText: "",
      selected: {
        ...model.selected,
        [searchResult.userId]: searchResult,
      },
    },
    cmd.none,
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

export const subscriptions = (model: Model): Sub<Msg> => {
  return pipe(
    Keyboard.keyDowns((key) =>
      Keyboard.isArrowKey(key) || Keyboard.isEnterKey(key)
        ? { type: "UserPressedKeyDown", key }
        : Keyboard.SkipFlag,
    ),
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
  (store: Store.Model, model: Model): View.View<Msg> =>
  (dispatch) => {
    const searchQuery = Store.toProfileSearchQuery(model.searchText, store)
    const searchResults = Store.searchProfiles(model.searchText, store)
    return (
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
              disabled={Object.values(model.selected).length === 0}
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

        <View.Box
          sx={{
            display: "flex",
            alignItems: "center",
            paddingBottom: 2,
            paddingTop: 1,
          }}
        >
          {Object.values(model.selected).map((searchResult) => (
            <View.Chip
              sx={{ marginLeft: 1 }}
              key={searchResult.userId}
              label={searchResult.username}
              onDelete={() => {
                dispatch({
                  type: "UserClickedSelectedDeleteButton",
                  userId: searchResult.userId,
                })
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
              const searchText = event.currentTarget.value
              dispatch({ type: "UserEnteredSearchText", searchText })
            }}
          />
        </View.Box>

        <View.Divider />

        <View.List sx={{ overflowY: "scroll", flex: 1 }}>
          {searchResults.length === 0 && (
            <View.Typography sx={{ p: 2 }} color="text.secondary">
              No account found.
            </View.Typography>
          )}

          {searchResults.map((searchResult, index) => (
            <SearchResultListItem
              key={searchResult.userId}
              searchResult={searchResult}
              onClick={() => {
                dispatch({ type: "UserClickedSearchResult", searchResult })
              }}
              selected={searchResult.userId in model.selected}
              highlighted={
                model.highlightedIndex !== "None" &&
                circularIndex(model.highlightedIndex, searchResults.length) ===
                  index
              }
            />
          ))}

          {searchQuery.type === "Loading" && (
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
  searchResult,

  onClick,
  highlighted,
  selected,
}: {
  highlighted: boolean
  selected: boolean
  searchResult: SearchResult
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
