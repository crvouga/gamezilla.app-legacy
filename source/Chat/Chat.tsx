import { Cmd, RemoteData } from "../Core"
import { UserId } from "../Data"
import * as ProfileStore from "../Profile/Profile.Store"
import * as Route from "../Route"
import * as UI from "../UI"
import * as ChatStore from "./Chat.Store"

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
  userId: UserId
}): [Model, Cmd<Msg>, OutAction[]] => {
  return [
    {},
    Cmd.None,
    [["Chat", ["Conversation", ["FindManyByUserId", { userId }]]]],
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
  | ["ClickedConversationItem", { conversationId: string }]

type OutAction = ChatStore.Action

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
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

export const View = ({
  chatStore,
  profileStore,
  $d,
  currentUserId,
}: {
  chatStore: ChatStore.Model
  profileStore: ProfileStore.Model
  currentUserId: UserId
  model: Model
  $d: (msg: Msg) => void
}) => {
  const query =
    chatStore.queries.Conversation.FindManyByUserId[currentUserId] ??
    RemoteData.NotAsked

  const conversations = Object.values(chatStore.UsersConversations)
    .filter((item) => item.userId === currentUserId)
    .flatMap((item) => {
      const profiles = Object.values(profileStore.profiles)
        .filter((profile) => profile.userId === item.userId)
        .filter((profile) => profile.userId !== currentUserId)

      if (profiles.length === 0) {
        return []
      }

      return [
        {
          ...item,
          profiles: profiles,
        },
      ]
    })

  return (
    <UI.FillBox>
      <UI.Header title="Chat" />
      <UI.Box sx={{ paddingX: 2 }}>
        <UI.Button
          fullWidth
          variant="contained"
          onClick={() => $d(["ClickedSendMessage"])}
        >
          Send Message
        </UI.Button>
      </UI.Box>

      <UI.List sx={{ overflowY: "scroll" }}>
        {conversations.map((item) => (
          <UI.ListItemButton
            key={item.conversationId}
            onClick={() => $d(["ClickedConversationItem", item])}
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
