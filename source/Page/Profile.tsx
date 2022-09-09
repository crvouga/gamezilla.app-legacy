import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"
import { Cmd, Sub } from "../Core"
import { UserId } from "../Data"

//
//
//
// Model
//
//
//

export type Model = {
  userId: UserId.UserId
}

export const init = ({
  userId,
}: {
  userId: UserId.UserId
}): [Model, Cmd.Cmd<Msg>, OutAction[]] => [
  { userId },
  Cmd.None,
  [["Store", ["Profile", ["FindMany", { userIds: [userId] }]]]],
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
  | ["ClickedSendMessage"]
  | ["ClickedEditProfile"]
  | ["ClickedAccountMenu"]

type OutAction = Store.Action

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedBack": {
      return [model, Route.back, []]
    }

    case "ClickedEditProfile": {
      return [model, Route.push(["ProfileUpdate"]), []]
    }

    case "ClickedAccountMenu": {
      return [model, Route.push(["Account"]), []]
    }

    case "ClickedSendMessage": {
      const userIds = [model.userId, currentUserId]

      const action: OutAction = [
        "Store",
        ["Conversation", ["FindOneElseInsert", { userIds }]],
      ]

      return [model, Cmd.None, [action]]
    }
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_: Model): Sub.Sub<Msg> => {
  return Sub.None
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
  currentUserId,
  model,
  dispatch,
}: {
  store: Store.Model
  currentUserId: UserId.UserId
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const profile = store.Profile[model.userId]

  if (!profile) {
    return (
      <UI.FillBox>
        <UI.Header title={"..."} />
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
      </UI.FillBox>
    )
  }

  if (profile.userId === currentUserId) {
    return (
      <UI.FillBox>
        <UI.Header
          title={profile.username}
          right={
            <UI.IconButton
              edge="end"
              onClick={() => dispatch(["ClickedAccountMenu"])}
            >
              <UI.Icons.Menu />
            </UI.IconButton>
          }
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
          <UI.Button
            fullWidth
            variant="contained"
            sx={{ marginBottom: 2 }}
            onClick={() => dispatch(["ClickedEditProfile"])}
          >
            Edit Profile
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }

  return (
    <UI.FillBox>
      <UI.Header
        left={<UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />}
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

        <UI.Button
          fullWidth
          variant="contained"
          sx={{ marginBottom: 2 }}
        >
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
    </UI.FillBox>
  )
}
