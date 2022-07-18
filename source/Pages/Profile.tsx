import * as Route from "Route";
import * as Store from "Store";
import * as UI from "UI";
import { Cmd, Option, Sub } from "Core";

//
//
//
// Model
//
//
//

export type Model = {
  userId: string;
};

export const init = ({
  userId,
}: {
  userId: string;
}): [Model, Cmd.Cmd<Msg>, OutAction[]] => [
  { userId },
  Cmd.None,
  [["Store", Store.Profile.Get(userId)]],
];

//
//
//
// Update
//
//
//

export type Msg = ["ClickedBack"] | ["ClickedSendMessage"];

type OutAction = ["Store", Store.Action];

export const update = (
  { currentUserId }: { currentUserId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back, []];

    case "ClickedSendMessage":
      return [
        model,
        Cmd.None,
        [
          [
            "Store",
            Store.Conversation.FindOneElseInsert(currentUserId, [model.userId]),
          ],
        ],
      ];
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const view =
  ({ store }: { store: Store.Model }, model: Model): UI.View<Msg> =>
  (dispatch) => {
    const maybeProfile = Option.fromNullable(store.Profile[model.userId]);

    switch (maybeProfile.type) {
      case "None":
        return (
          <UI.Page>
            <UI.Header
              left={
                <UI.HeaderBackButton
                  onClick={() => dispatch(["ClickedBack"])}
                />
              }
              title={"..."}
            />
            <UI.Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UI.CircularProgress />
            </UI.Box>
          </UI.Page>
        );

      case "Some":
        const profile = maybeProfile.value;
        return (
          <UI.Page>
            <UI.Header
              left={
                <UI.HeaderBackButton
                  onClick={() => dispatch(["ClickedBack"])}
                />
              }
              title={profile.username}
            />

            <UI.Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              <UI.Avatar
                sx={{ width: 120, height: 120, marginBottom: 1 }}
                src={profile.avatarUrl}
              />
              <UI.Typography variant="h3">{profile.username}</UI.Typography>
              <UI.Typography
                variant="h6"
                color="text.secondary"
                sx={{ marginBottom: 2 }}
              >
                {profile.name}
              </UI.Typography>

              <UI.Button fullWidth variant="contained" sx={{ marginBottom: 2 }}>
                Send Friend Request
              </UI.Button>
              <UI.Button
                fullWidth
                loading={
                  store.mutations.Conversation.FindElseInsert.type === "Loading"
                }
                variant="contained"
                onClick={() => dispatch(["ClickedSendMessage"])}
              >
                Send Message
              </UI.Button>
            </UI.Box>
          </UI.Page>
        );
    }
  };
