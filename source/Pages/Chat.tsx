import * as Route from "Route";
import * as Store from "Store";
import * as View from "View";
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
  ): View.View<Msg> =>
  (dispatch) => {
    const query =
      store.queries.Conversation.FindManyByUserId[profile.userId] ??
      RemoteData.NotAsked;

    return (
      <View.Page>
        <View.Header title="Chat" />
        <View.Box sx={{ p: 2 }}>
          <View.Button
            fullWidth
            variant="contained"
            onClick={() => dispatch({ type: "ClickedSendMessage" })}
          >
            Send Message
          </View.Button>
        </View.Box>

        <View.List sx={{ overflowY: "scroll" }}>
          {Object.values(store.ProfilesConversations)
            .filter((item) => item.userId === profile.userId)
            .map((item) =>
              Store.Conversation.toConversation(item.conversationId, store),
            )
            .map((item) => (
              <View.ListItemButton
                key={item.conversationId}
                onClick={() =>
                  dispatch({
                    type: "ClickedConversationItem",
                    conversationId: item.conversationId,
                  })
                }
              >
                <View.ListItemAvatar>
                  <View.AvatarGroup>
                    {item.profiles.map((profile) => (
                      <View.Avatar
                        key={profile.userId}
                        src={profile.avatarUrl}
                      />
                    ))}
                  </View.AvatarGroup>
                </View.ListItemAvatar>
                <View.ListItemText
                  primary={item.profiles
                    .map((item) => item.username)
                    .join(", ")}
                />
              </View.ListItemButton>
            ))}
        </View.List>

        {query.type === "Loading" && (
          <View.Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <View.CircularProgress />
          </View.Box>
        )}
      </View.Page>
    );
  };
