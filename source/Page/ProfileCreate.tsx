import { Cmd } from "../Core"
import { ProfileAvatar, UserId, Username } from "../Data"
import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"

//
//
//
//
// Model
//
//
//
//

export type Model = {
  username: string
  avatarUrl: string
}

export const init = ({ defaultName }: { defaultName: string }): Model => {
  const username = defaultName.replace(" ", "").toLowerCase()
  return {
    username,
    avatarUrl: ProfileAvatar.toUrl({
      seed: ProfileAvatar.toSeed(username),
      style: "big-ears-neutral",
    }),
  }
}




//
//
//
//
// Update
//
//
//
//

export type Msg =
  | ["InputtedUsername", string]
  | ["ClickedSubmit"]
  | ["ClickedLogout"]

export type OutAction = Store.Action

export const update = (
  { userId }: { userId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "InputtedUsername":
      return [
        { ...model, username: msg[1] },
        Cmd.None,
        [],
      ]

    case "ClickedSubmit":
      const avatarUrl = ProfileAvatar.toUrl({
        seed: ProfileAvatar.toSeed(model.username),
        style: "avataaars",
      })

      const username = Username.decode(model.username)

      if (username.type === "Err") {
        // todo handle validation error
        return [model, Cmd.None, []]
      }

      const profile: Store.Profile.Profile = {
        name: "",
        username: username.value,
        userId,
        avatarUrl,
        themeMode: "System",
      }

      return [
        model,
        Cmd.None,
        [["Store", ["Profile", ["Create", { userId, profile }]]]],
      ]

    case "ClickedLogout":
      return [model, Route.push(["Logout"]), []]
  }
}

//
//
//
//
// View
//
//
//
//

export const View = ({
  model,
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => (
  <UI.FillBox>
    <UI.Header
      left={
        <UI.Button
          sx={{ marginLeft: -1 }}
          size="small"
          onClick={() => dispatch(["ClickedLogout"])}
        >
          Logout
        </UI.Button>
      }
      title="Create Profile"
    />

    <UI.Box sx={{ p: 2, width: "100%" }}>
      <UI.Avatar
        src={model.avatarUrl}
        sx={{
          marginX: "auto",
          width: "120px",
          height: "120px",
          marginBottom: 1,
        }}
      />

      <UI.Button
        sx={{
          display: "block",
          marginX: "auto",
          marginBottom: 2,
        }}
      >
        Change Avatar
      </UI.Button>

      <UI.TextField
        autoFocus
        value={model.username}
        sx={{ marginBottom: 2 }}
        label="Username"
        fullWidth
        onChange={(event) =>
          dispatch(["InputtedUsername", event.currentTarget.value])
        }
      />

      <UI.Button
        fullWidth
        size="large"
        variant="contained"
        onClick={() => dispatch(["ClickedSubmit"])}
      >
        Create Profile
      </UI.Button>
    </UI.Box>
  </UI.FillBox>
)
