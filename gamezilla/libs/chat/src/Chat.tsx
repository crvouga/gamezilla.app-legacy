
import { Cmd, RemoteData } from "@gamezilla/core"
import { UserId } from "@gamezilla/shared"
import { Ctx, Route } from "@gamezilla/shared"
import { Avatar, AvatarGroup, Box, Button, FillBox, Header, Icons, List, ListItemAvatar, ListItemButton, ListItemText, ViewEmptyState, ViewLoadingState } from "@gamezilla/ui"
import * as ChatStore from "./Chat.Store"
//
//
//
// Model
//
//
//
export type Model = null

export const init = ({
  userId,
}: {
  userId: UserId
}): [Model, Cmd<Msg>, OutAction[]] => {
  return [
    null,
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
  $send,
  ctx,
}: {
  chatStore: ChatStore.Model
  ctx: Ctx,
  model: Model
  $send: (msg: Msg) => void
}) => {
  const { currentUserId, profiles } = ctx
  const query =
    chatStore.queries.Conversation.FindManyByUserId[currentUserId] ??
    RemoteData.NotAsked

  const conversations = Object.values(chatStore.UsersConversations)
    .filter((item) => item.userId === currentUserId)
    .flatMap((item) => {
      const filtered = Object.values(profiles)
        .filter((profile) => profile.userId === item.userId)
        .filter((profile) => profile.userId !== currentUserId)

      if (filtered.length === 0) {
        return []
      }

      return [
        {
          ...item,
          profiles: filtered,
        },
      ]
    })

  if (query.type === 'Loading') {
    return (
      <FillBox>
        <Header title="Chat" />
        <ViewLoadingState title="Loading conversations..." />
      </FillBox>
    )
  }

  if (conversations.length === 0) {
    return (
      <FillBox>
        <Header title="Chat" />
        <ViewEmptyState
          actionIcon={<Icons.Send />}
          actionTitle="Send Message"
          onAction={() => $send(["ClickedSendMessage"])}
          renderIcon={props => <Icons.Chat {...props} />}
          title="No conversations"
        />
      </FillBox>
    )
  }

  return (
    <FillBox>
      <Header title="Chat" />
      <Box sx={{ paddingX: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => $send(["ClickedSendMessage"])}
        >
          Send Message
        </Button>
      </Box>

      <List sx={{ overflowY: "scroll" }}>
        {conversations.map((item) => (
          <ListItemButton
            key={item.conversationId}
            onClick={() => $send(["ClickedConversationItem", item])}
          >
            <ListItemAvatar>
              <AvatarGroup max={2}>
                {item.profiles.map((profile) => (
                  <Avatar key={profile.userId} src={profile.avatarUrl} />
                ))}
              </AvatarGroup>
            </ListItemAvatar>
            <ListItemText
              primary={item.profiles.map((item) => item.username).join(", ")}
            />
          </ListItemButton>
        ))}
      </List>
    </FillBox>
  )
}
