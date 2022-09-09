import { ReactNode, useLayoutEffect, useRef, useState } from "react"
import { Browser, Cmd, pipe, RemoteData } from "../Core"
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

export type Model = {
  text: string
  focused: FocusedModel
}

type FocusedModel =
  | {
    type: "Blurred"
  }
  | {
    type: "Focused"
    messageId: string
    copyStatus: "Failed" | "NotAsked" | "Succeeded" | "Loading"
  }


export const init = ({
  conversationId,
}: {
  conversationId: string
}): [Model, Cmd.Cmd<Msg>, OutAction[]] => [
    {
      text: "",
      focused: { type: "Blurred" },
    },
    Cmd.None,

    [["Store", ["Conversation", ["FindOne", { conversationId }]]]],
  ]

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedBack"]
  | ["ClickedSend"]
  | ["ClickedMessage", { messageId: string }]
  | ["ClosedMessageMenu", { messageId: string }]
  | ["ClickedDeleteMessage", { messageId: string }]
  | ["ClickedCopyMessageText", string]
  | ["InputtedText", string]
  | ["ClipboardCopy_Done", Browser.Clipboard.CopyResult]

export type OutAction = Store.Action

export const update = (
  { userId, conversationId }: { userId: UserId.UserId, conversationId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClipboardCopy_Done":
      return [{ ...model, focused: { type: "Blurred" } }, Cmd.None, []]

    case "ClickedCopyMessageText":
      return [
        model,
        pipe(
          Browser.Clipboard.copy(msg[1]),
          Cmd.perform((result) => ["ClipboardCopy_Done", result]),
        ),
        [],
      ]

    case "ClickedBack":
      return [model, Route.back, []]

    case "ClickedSend":
      const payload = {
        userId,
        conversationId,
        messageText: model.text,
      }

      return [model, Cmd.None, [["Store", ["Message", ["Send", payload]]]]]

    case "InputtedText":
      return [{ ...model, text: msg[1] }, Cmd.None, []]

    case "ClickedMessage":
      return [
        {
          ...model,
          focused: {
            type: "Focused",
            messageId: msg[1].messageId,
            copyStatus: "NotAsked",
          },
        },
        Cmd.None,
        [],
      ]

    case "ClosedMessageMenu":
      return [
        {
          ...model,
          focused: {
            type: "Blurred",
          },
        },
        Cmd.None,
        [],
      ]

    case "ClickedDeleteMessage":
      const { messageId } = msg[1]

      return [
        model,
        Cmd.None,
        [["Store", ["Message", ["Unsend", { messageId }]]]],
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
  store,
  authUser,
  model,
  dispatch,
  conversationId,
}: {
  store: Store.Model
  authUser: { userId: UserId.UserId }
  model: Model
  conversationId: string
  dispatch: (msg: Msg) => void
}) => {
  const query =
    store.queries.Conversation.FindOne[conversationId] ??
    RemoteData.NotAsked

  const conversation = pipe(
    Store.Conversation.toConversation(conversationId, store),
    (conversation) => ({
      ...conversation,
      profiles: conversation.profiles.filter(
        (item) => item.userId !== authUser.userId,
      ),
    }),
  )

  const messageInsertMutation =
    store.mutations.Message.Send[conversationId] ?? RemoteData.NotAsked

  return (
    <UI.FillBox>
      <UI.Toolbar>
        <UI.Box sx={{ flex: 1 }}>
          <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
        </UI.Box>

        <UI.Box
          sx={{
            flex: 3,
            paddingY: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UI.AvatarGroup>
            {conversation.profiles.map((item) => (
              <UI.Avatar
                key={item.userId}
                src={item.avatarUrl}
              />
            ))}
          </UI.AvatarGroup>
          <UI.Typography
            align="center"
            noWrap
          >
            {conversation.profiles
              .map((profile) => profile.username)
              .join(", ")}
          </UI.Typography>
        </UI.Box>
        <UI.Box sx={{ flex: 1 }}></UI.Box>
      </UI.Toolbar>

      <MessageContainer
        isLoading={query.type === "Loading"}
        scrollKey={String(conversation.messages.length)}
      >
        <UI.Box sx={{ flex: 1 }}></UI.Box>

        {conversation.messages.map((message) => (
          <ChatMessage
            key={message.messageId}
            message={message}
            currentUserId={authUser.userId}
            dispatch={dispatch}
            model={model}
            store={store}
          />
        ))}
      </MessageContainer>

      <ChatInput
        value={model.text}
        onChange={(text) => dispatch(["InputtedText", text])}
        onSend={() => dispatch(["ClickedSend"])}
        isSending={messageInsertMutation.type === "Loading"}
      />
    </UI.FillBox>
  )
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  isSending,
}: {
  value: string
  onChange: (valueNew: string) => void
  onSend: () => void
  isSending: boolean
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const theme = UI.useTheme()
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey["100"]
      : theme.palette.grey["900"]
  const textColor = theme.palette.getContrastText(backgroundColor)
  return (
    <UI.Paper
      variant="outlined"
      sx={{
        width: "100%",
        display: "flex",
        paddingX: 2,
        paddingY: 1 / 2,
        backgroundColor,
        borderRadius: theme.spacing(4),
      }}
    >
      <UI.InputBase
        ref={inputRef}
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value)
        }}
        sx={{ color: textColor, paddingLeft: 1, flex: 1 }}
        placeholder="Message..."
      />

      <UI.Grow in={value.length > 0}>
        <UI.Button
          variant="text"
          size="large"
          disabled={value.length === 0}
          onClick={() => {
            onSend()

            if (inputRef.current) {
              inputRef.current.focus()
            }
          }}
          loading={isSending}
        >
          Send
        </UI.Button>
      </UI.Grow>
    </UI.Paper>
  )
}

const MessageContainer = ({
  scrollKey,
  children,
  isLoading,
}: {
  isLoading: boolean
  scrollKey: string
  children: ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [scrollKey])

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [])

  return (
    <UI.Box
      ref={containerRef}
      sx={{
        flex: 1,
        overflowY: "scroll",
        width: "100%",
        paddingBottom: 2,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 0,
      }}
    >
      {children}
      <div ref={ref} />
      {isLoading && (
        <UI.Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UI.CircularProgress />
        </UI.Box>
      )}
    </UI.Box>
  )
}
const ChatMessage = ({
  message,
  currentUserId,
  model,
  store,
  dispatch,
}: {
  message: Store.Message.Message
  currentUserId: UserId.UserId
  model: Model
  dispatch: (msg: Msg) => void
  store: Store.Model
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dispatch(["ClickedMessage", message])
  }

  const variant = currentUserId === message.userId ? "sented" : "recieved"

  const theme = UI.useTheme()
  const backgroundColor =
    variant === "sented"
      ? theme.palette.primary.main
      : theme.palette.grey["200"]
  const textColor = theme.palette.getContrastText(backgroundColor)

  const [anchorRef, setAnchorRef] = useState<null | HTMLElement>(null)

  return (
    <UI.Box
      sx={{
        paddingY: 1 / 2,
        paddingX: 1,
        width: "100%",
        display: "flex",
        justifyContent: variant === "recieved" ? "flex-start" : "flex-end",
      }}
    >
      <UI.Typography
        ref={(ref) => setAnchorRef(ref)}
        onClick={handleClick}
        onContextMenu={handleClick}
        sx={{
          // filter:
          //   model.focused.type === "Focused" &&
          //   model.focused.messageId !== message.messageId
          //     ? "blur(4px)"
          //     : undefined,
          borderRadius: theme.spacing(2),
          display: "inline-block",
          padding: 1,
          backgroundColor,
          color: textColor,
          cursor: model.focused.type === "Blurred" ? "pointer" : "default",
          maxWidth: "80%",
          wordBreak: "break-all",
        }}
      >
        {message.message}
      </UI.Typography>
      <UI.Menu
        anchorEl={anchorRef}
        open={
          model.focused.type === "Focused" &&
          model.focused.messageId === message.messageId
        }
        onClose={() => dispatch(["ClosedMessageMenu", message])}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: variant === "sented" ? "left" : "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: variant === "sented" ? "right" : "left",
        }}
      >
        <UI.Box sx={{ display: "flex", flexDirection: "column" }}>
          <UI.Button
            loading={
              model.focused.type === "Focused" &&
              model.focused.copyStatus === "Loading"
            }
            onClick={() =>
              dispatch(["ClickedCopyMessageText", message.message])
            }
          >
            {model.focused.type === "Focused" &&
              model.focused.copyStatus === "Succeeded"
              ? "Copied"
              : "Copy Text"}
          </UI.Button>
          {variant === "sented" && (
            <UI.Button
              loading={
                store.mutations.Message.Unsend[message.messageId]?.type ===
                "Loading"
              }
              onClick={() => dispatch(["ClickedDeleteMessage", message])}
            >
              Delete Forever
            </UI.Button>
          )}
        </UI.Box>
      </UI.Menu>
    </UI.Box>
  )
}
