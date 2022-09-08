import { Cmd, RemoteData } from "../Core"
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

export type Model = {}

export const init = ({
  userId,
}: {
  userId: UserId.UserId
}): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  return [
    {},
    Cmd.None,
    [["Store", ["Conversation", ["FindManyByUserId", { userId }]]]],
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
  | ["ClickedBack"]
  | ["ClickedSendMessage"]
  | ["ClickedConversationItem", string]

type OutAction = Store.Action

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back]

    case "ClickedSendMessage":
      return [model, Route.push(["ChatNew"])]

    case "ClickedConversationItem":
      return [model, Route.push(["ChatConversation", msg[1]])]
  }
}

//
//
//
// View
//
//
//

export const View =
  (
    {
      store,
      profile,
      dispatch
    }: {
      store: Store.Model;
      profile: { userId: UserId.UserId }
      model: Model,
      dispatch: (msg: Msg) => void
    },

  ) => {
    const query =
      store.queries.Conversation.FindManyByUserId[profile.userId] ??
      RemoteData.NotAsked

    const conversations = Object.values(store.ProfilesConversations)
      .filter((item) => item.userId === profile.userId)
      .map((item) =>
        Store.Conversation.toConversation(item.conversationId, store),
      )
      .map((item) => ({
        ...item,
        profiles: item.profiles.filter(
          (item) => item.userId !== profile.userId,
        ),
      }))
      .filter((item) => item.profiles.length > 0)

    return (
      <UI.FillBox>
        <UI.Header title="Chat" />
        <UI.Box sx={{ paddingX: 2 }}>
          <UI.Button
            fullWidth
            variant="contained"
            onClick={() => dispatch(["ClickedSendMessage"])}
          >
            Send Message
          </UI.Button>
        </UI.Box>

        <UI.List sx={{ overflowY: "scroll" }}>
          {conversations.map((item) => (
            <UI.ListItemButton
              key={item.conversationId}
              onClick={() =>
                dispatch(["ClickedConversationItem", item.conversationId])
              }
            >
              <UI.ListItemAvatar>
                <UI.AvatarGroup max={2}>
                  {item.profiles.map((profile) => (
                    <UI.Avatar
                      key={profile.userId}
                      src={profile.avatarUrl}
                    />
                  ))}
                </UI.AvatarGroup>
              </UI.ListItemAvatar>
              <UI.ListItemText
                primary={item.profiles.map((item) => item.username).join(", ")}
              />
            </UI.ListItemButton>
          ))}
        </UI.List>

        {query.type === "Loading" && (
          <UI.Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <UI.CircularProgress />
          </UI.Box>
        )}
      </UI.FillBox>
    )
  }
