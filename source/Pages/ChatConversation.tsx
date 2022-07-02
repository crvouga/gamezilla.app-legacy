import * as Route from "Route";
import * as Store from "Store";
import * as View from "View";
import { Cmd, Html, RemoteData } from "Core";
import { ReactNode, useEffect, useLayoutEffect, useRef } from "react";
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
        [Store.Message.Insert({ userId, conversationId, message: model.text })],
      ];

    case "InputtedText":
      return [{ ...model, text: msg.text }, Cmd.None, []];
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

        <MessageContainer scrollKey={String(conversation.messages.length)}>
          {viewHeader(conversation)(dispatch)}

          {query.type === "Loading" && (
            <View.Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <View.CircularProgress />
            </View.Box>
          )}

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
              <Bubble
                variant={
                  message.userId === authUser.userId ? "sented" : "received"
                }
                message={message.message}
              />
            </View.Box>
          ))}
        </MessageContainer>

        <View.Divider />

        <View.Box
          sx={{ width: "100%", display: "flex", paddingX: 2, paddingY: 1 }}
        >
          <View.InputBase
            value={model.text}
            onChange={(event) => {
              const textNew = event.currentTarget.value;
              dispatch({ type: "InputtedText", text: textNew });
            }}
            sx={{ flex: 1 }}
            placeholder="Message..."
          />

          <View.Button
            variant="contained"
            size="large"
            disabled={model.text.length === 0}
            onClick={() => dispatch({ type: "ClickedSend" })}
            loading={messageInsertMutation.type === "Loading"}
          >
            Send
          </View.Button>
        </View.Box>
      </View.Page>
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

  useEffect(() => {
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
      sx={{ flex: 1, overflowY: "scroll", width: "100%", paddingBottom: 4 }}
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

const Bubble = ({
  message,
  variant,
}: {
  message: string;
  variant: "sented" | "received";
}) => {
  const theme = View.useTheme();
  const backgroundColor =
    variant === "sented"
      ? theme.palette.primary.main
      : theme.palette.background.paper;
  const textColor = theme.palette.getContrastText(backgroundColor);

  return (
    <View.Typography
      sx={{
        borderRadius: 2,
        display: "inline-block",
        padding: 1,
        backgroundColor,
        color: textColor,
      }}
    >
      {message}
    </View.Typography>
  );
};
