import { cmd } from "Core"
import * as Navigation from "Core/Navigation"
import * as ProfileAvatar from "ProfileAvatar"
import * as Route from "Route"
import * as Store from "Store"
import * as View from "View"

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
  form: Form
}

export const init = ({ defaultName }: { defaultName: string }): Model => {
  return {
    form: initForm({ defaultName }),
  }
}

type Form = {
  username: string
  name: string
  avatarUrl: string
}

const initForm = ({ defaultName }: { defaultName: string }): Form => {
  const username = defaultName.replace(" ", "").toLowerCase()

  return {
    username,
    name: defaultName,
    avatarUrl: ProfileAvatar.toUrl({
      seed: ProfileAvatar.toSeed(username),
      style: "adventurer-neutral",
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
  | { type: "EnteredUsername"; username: string }
  | { type: "EnteredName"; name: string }
  | { type: "UserClickedSubmitButton" }
  | { type: "UserClickedLogoutButton" }

export type Action = Store.GroupedMsg

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "EnteredName":
      return [{ ...model, form: { ...model.form, ...msg } }, cmd.none, []]

    case "EnteredUsername":
      return [{ ...model, form: { ...model.form, ...msg } }, cmd.none, []]

    case "UserClickedSubmitButton":
      return [model, cmd.none, [Store.Profile.Create(userId, model.form)]]

    case "UserClickedLogoutButton":
      return [model, Navigation.push(Route.encode({ type: "Logout" })), []]
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

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch({ type: "UserClickedLogoutButton" })}
            >
              Logout
            </View.Button>
          }
          title="Create Profile"
        />

        <View.Box sx={{ p: 2, width: "100%" }}>
          <View.Avatar
            src={model.form.avatarUrl}
            sx={{
              marginX: "auto",
              width: "150px",
              height: "150px",
              marginBottom: 1,
            }}
          />

          <View.Button
            sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          >
            Change Avatar
          </View.Button>

          <View.TextField
            value={model.form.username}
            sx={{ marginBottom: 2 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "EnteredUsername",
                username: event.currentTarget.value,
              })
            }
          />

          <View.TextField
            value={model.form.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={({ currentTarget: { value: name } }) =>
              dispatch({ type: "EnteredName", name })
            }
          />

          <View.Button
            fullWidth
            size="large"
            variant="contained"
            onClick={() => dispatch({ type: "UserClickedSubmitButton" })}
          >
            Create Profile
          </View.Button>
        </View.Box>
      </View.Page>
    )
