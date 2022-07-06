import * as Route from "Route";
import * as Store from "Store";
import * as UI from "UI";
import { Cmd, RemoteData, pipe } from "Core";

//
//
//
// Model
//
//
//

export type Model = {};

export const init = ({
  userId,
}: {
  userId: string;
}): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  return [{}, Cmd.None, [Store.Conversation.FindManyByUserId(userId)]];
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "ClickedBack" }
  | { type: "ClickedSendMessage" }
  | { type: "ClickedConversationItem"; conversationId: string };

type OutAction = Store.Action;

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back];

    case "ClickedSendMessage":
      return [model, Route.push({ type: "ChatNew" })];

    case "ClickedConversationItem":
      return [
        model,
        Route.push({
          type: "ChatConversation",
          conversationId: msg.conversationId,
        }),
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
  (
    { store, profile }: { store: Store.Model; profile: { userId: string } },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    const query =
      store.queries.Conversation.FindManyByUserId[profile.userId] ??
      RemoteData.NotAsked;

    return (
      <UI.Page>
        <UI.Header title="Chat" />
        <UI.Box sx={{ p: 2 }}>
          <UI.Button
            fullWidth
            variant="contained"
            onClick={() => dispatch({ type: "ClickedSendMessage" })}
          >
            Send Message
          </UI.Button>
        </UI.Box>

        <UI.List sx={{ overflowY: "scroll" }}>
          {Object.values(store.ProfilesConversations)
            .filter((item) => item.userId === profile.userId)
            .map((item) =>
              Store.Conversation.toConversation(item.conversationId, store),
            )
            .map((item) => (
              <UI.ListItemButton
                key={item.conversationId}
                onClick={() =>
                  dispatch({
                    type: "ClickedConversationItem",
                    conversationId: item.conversationId,
                  })
                }
              >
                <UI.ListItemAvatar>
                  <UI.AvatarGroup>
                    {item.profiles.map((profile) => (
                      <UI.Avatar key={profile.userId} src={profile.avatarUrl} />
                    ))}
                  </UI.AvatarGroup>
                </UI.ListItemAvatar>
                <UI.ListItemText
                  primary={item.profiles
                    .map((item) => item.username)
                    .join(", ")}
                />
              </UI.ListItemButton>
            ))}
        </UI.List>

        {query.type === "Loading" && (
          <UI.Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <UI.CircularProgress />
          </UI.Box>
        )}
      </UI.Page>
    );
  };
