import * as Route from "Route";
import * as Store from "Store";
import * as View from "View";
import { Cmd, Html, RemoteData } from "Core";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { refCount } from "rxjs";

//
//
//
// Model
//
//
//

export type Model = {
  text: string;
  focusedMessageId?: string;
};

export const init = ({
  conversationId,
}: {
  conversationId: string;
}): [Model, Cmd.Cmd<Msg>, OutAction[]] => [
  {
    text: "",
  },
  Cmd.None,
  [Store.Conversation.FindOne(conversationId)],
];

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "ClickedBack" }
  | { type: "ClickedSend" }
  | { type: "ClickedMessage"; messageId: string }
  | { type: "ClosedMessageMenu"; messageId: string }
  | { type: "ClickedDeleteMessage"; messageId: string }
  | { type: "InputtedText"; text: string };

export type OutAction = Store.Action;

export const update = (
  { userId, conversationId }: { userId: string; conversationId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back, []];

    case "ClickedSend":
      return [
        model,
        Cmd.None,
        [
          Store.Message.Insert({
            userId,
            conversationId,
            messageText: model.text,
          }),
        ],
      ];

    case "InputtedText":
      return [{ ...model, text: msg.text }, Cmd.None, []];

    case "ClickedMessage":
      return [{ ...model, focusedMessageId: msg.messageId }, Cmd.None, []];

    case "ClosedMessageMenu":
      return [{ ...model, focusedMessageId: undefined }, Cmd.None, []];

    case "ClickedDeleteMessage":
      return [model, Cmd.None, []];
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
  (
    {
      store,
      conversationId,
      authUser,
    }: {
      store: Store.Model;
      conversationId: string;
      authUser: { userId: string };
    },
    model: Model,
  ): View.View<Msg> =>
  (dispatch) => {
    const query =
      store.queries.Conversation.FindOne[conversationId] ?? RemoteData.NotAsked;

    const conversation = Store.Conversation.toConversation(
      conversationId,
      store,
    );

    const messageInsertMutation =
      store.mutations.Message.Insert[conversationId] ?? RemoteData.NotAsked;

    return (
      <View.Page>
        <View.Toolbar>
          <View.HeaderBackButton
            onClick={() => dispatch({ type: "ClickedBack" })}
          />

          <View.Typography align="left" noWrap>
            {conversation.profiles
              .map((profile) => profile.username)
              .join(", ")}
          </View.Typography>

          <View.Box sx={{ paddingX: 2 }}></View.Box>
        </View.Toolbar>

        {query.type === "Loading" && (
          <View.Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              flex: 1,
            }}
          >
            <View.CircularProgress />
          </View.Box>
        )}

        {query.type === "Success" && (
          <MessageContainer scrollKey={String(conversation.messages.length)}>
            {viewHeader(conversation)(dispatch)}

            <View.Box sx={{ flex: 1 }}></View.Box>

            {conversation.messages.map((message) => (
              <View.Box
                key={message.messageId}
                sx={{
                  paddingY: 1 / 2,
                  paddingX: 1,
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <ChatBubble
                  status={
                    model.focusedMessageId
                      ? message.messageId === model.focusedMessageId
                        ? "focused"
                        : "blurred"
                      : "idle"
                  }
                  variant={
                    message.userId === authUser.userId ? "sented" : "received"
                  }
                  onMenuClose={() =>
                    dispatch({
                      type: "ClosedMessageMenu",
                      messageId: message.messageId,
                    })
                  }
                  onClick={() =>
                    dispatch({
                      type: "ClickedMessage",
                      messageId: message.messageId,
                    })
                  }
                  message={message.message}
                />
              </View.Box>
            ))}
          </MessageContainer>
        )}

        <ChatInput
          value={model.text}
          onChange={(text) => dispatch({ type: "InputtedText", text })}
          onSend={() => dispatch({ type: "ClickedSend" })}
          isSending={messageInsertMutation.type === "Loading"}
        />
      </View.Page>
    );
  };

const ChatInput = ({
  value,
  onChange,
  onSend,
  isSending,
}: {
  value: string;
  onChange: (valueNew: string) => void;
  onSend: () => void;
  isSending: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const theme = View.useTheme();
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey["100"]
      : theme.palette.grey["900"];
  const textColor = theme.palette.getContrastText(backgroundColor);
  return (
    <View.Paper
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
      <View.InputBase
        ref={inputRef}
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
        sx={{ color: textColor, paddingLeft: 1, flex: 1 }}
        placeholder="Message..."
      />

      <View.Grow in={value.length > 0}>
        <View.Button
          variant="text"
          size="large"
          disabled={value.length === 0}
          onClick={() => {
            onSend();

            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
          loading={isSending}
        >
          Send
        </View.Button>
      </View.Grow>
    </View.Paper>
  );
};

const MessageContainer = ({
  scrollKey,
  children,
}: {
  scrollKey: string;
  children: ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollKey]);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  return (
    <View.Box
      ref={containerRef}
      sx={{
        flex: 1,
        overflowY: "scroll",
        width: "100%",
        paddingBottom: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
      <div ref={ref} />
    </View.Box>
  );
};

const viewHeader =
  (conversation: { profiles: Store.Profile.Profile[] }): View.View<Msg> =>
  () =>
    (
      <View.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          marginX: 4,
          textOverflow: "ellipsis",
        }}
      >
        <View.AvatarGroup
          sx={{ marginBottom: 2 }}
          max={4}
          componentsProps={{
            additionalAvatar: { sx: { width: 64, height: 64 } },
          }}
        >
          {conversation.profiles.map((profile) => (
            <View.Avatar
              key={profile.userId}
              src={profile.avatarUrl}
              sx={{ width: 64, height: 64 }}
            />
          ))}
        </View.AvatarGroup>

        <View.Typography
          variant="h5"
          align="center"
          noWrap
          sx={{ width: "100%" }}
        >
          {conversation.profiles.map((profile) => profile.username).join(", ")}
        </View.Typography>
      </View.Box>
    );

const ChatBubble = ({
  status,
  message,
  variant,
  onClick,
  onMenuClose,
}: {
  status: "focused" | "blurred" | "idle";
  message: string;
  variant: "sented" | "received";
  onClick: () => void;
  onMenuClose: () => void;
}) => {
  const theme = View.useTheme();
  const backgroundColor =
    variant === "sented"
      ? theme.palette.primary.main
      : theme.palette.grey["200"];
  const textColor = theme.palette.getContrastText(backgroundColor);

  const anchorRef = useRef<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };

  return (
    <>
      <View.Typography
        ref={anchorRef}
        onClick={handleClick}
        onContextMenu={handleClick}
        sx={{
          opacity: status === "blurred" ? 0.5 : 1,
          borderRadius: theme.spacing(2),
          display: "inline-block",
          padding: 1,
          backgroundColor,
          color: textColor,
        }}
      >
        {message}
      </View.Typography>
      <View.Menu
        anchorEl={anchorRef.current}
        open={status === "focused"}
        onClose={onMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
      >
        <View.MenuItem sx={{ color: theme.palette.error.main }}>
          Delete Forever
        </View.MenuItem>
      </View.Menu>
    </>
  );
};
