import { Cmd } from "../Core"
import * as Route from "../Route"
import * as ProfileStore from "./Profile.Store"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedBack"]
  | ["ClickedName"]
  | ["ClickedUsername"]
  | ["ClickedAvatar"]
  | ["ClickedChangedAvatar"]
  | ["ClickedTheme"]

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedAvatar":
      return [model, Route.push(["ProfileUpdateAvatar"])]

    case "ClickedChangedAvatar":
      return [model, Route.push(["ProfileUpdateAvatar"])]

    case "ClickedBack":
      return [model, Route.back]

    case "ClickedName":
      return [model, Route.push(["ProfileUpdateName"])]

    case "ClickedUsername":
      return [model, Route.push(["ProfileUpdateUsername"])]

    case "ClickedTheme":
      return [model, Route.push(["ProfileUpdateTheme"])]
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
  profile,
  $send,
}: {
  profile: ProfileStore.Profile
  model: Model
  $send: (msg: Msg) => void
}) => (
  <UI.FillBox>
    <UI.Header
      left={<UI.HeaderBackButton onClick={() => $send(["ClickedBack"])} />}
      title="Update Profile"
    />

    <UI.Avatar
      src={profile.avatarUrl}
      sx={{
        marginX: "auto",
        width: "150px",
        height: "150px",
        marginBottom: 1,
      }}
      onClick={() => $send(["ClickedAvatar"])}
    />

    <UI.Button
      sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
      onClick={() => $send(["ClickedChangedAvatar"])}
    >
      Change Avatar
    </UI.Button>

    <UI.List>
      <UI.Field
        label="Username"
        value={profile.username}
        onClick={() => $send(["ClickedUsername"])}
      />

      {/* <UI.Field
        label="Name"
        value={profile.name}
        onClick={() => $send(["ClickedName"])}
      /> */}

      <UI.Field
        label="Theme"
        value={profile.themeMode}
        onClick={() => $send(["ClickedTheme"])}
      />
    </UI.List>
  </UI.FillBox>
)
