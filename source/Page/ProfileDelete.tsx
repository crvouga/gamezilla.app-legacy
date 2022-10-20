import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"
import { Cmd, RemoteData } from "../Core"
import { UserId } from "../Data"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: [Model, Cmd.Cmd<Msg>, OutAction[]] = [{}, Cmd.None, []]

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedCancel"]
  | ["ClickedBackdrop"]
  | ["ClickedDelete"]
  | ["ClickedCloseFailure"]

export type OutAction = Store.Action

export const update = (
  { userId }: { userId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedCancel":
      return [model, Route.back, []]

    case "ClickedBackdrop":
      return [model, Route.back, []]

    case "ClickedDelete":
      return [
        model,
        Cmd.None,
        [["Store", ["Profile", ["DeleteForever", { userId }]]]],
      ]

    case "ClickedCloseFailure":
      return [model, Cmd.None, [["Store", ["Profile", ["ResetMutations"]]]]]
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
  profileId,
  dispatch,
}: {
  store: Store.Model
  profileId: UserId.UserId
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const mutation =
    store.mutations.Profile.DeleteForever[profileId] ?? RemoteData.NotAsked

  switch (mutation.type) {
    case "Loading":
      return (
        <UI.LoadingDialog
          open
          title="Deleting profile..."
        />
      )

    case "Failure":
      return (
        <UI.Backdrop open>
          <UI.Alert
            variant="filled"
            severity="error"
            sx={{ margin: 2 }}
          >
            <UI.AlertTitle>Failed to delete profile.</UI.AlertTitle>
            {mutation.problem}
            <UI.Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 2,
              }}
            >
              <UI.Button
                variant="outlined"
                size="large"
                color="inherit"
                startIcon={<UI.Icons.Close />}
                onClick={() => dispatch(["ClickedCloseFailure"])}
              >
                Close
              </UI.Button>
            </UI.Box>
          </UI.Alert>
        </UI.Backdrop>
      )

    case "NotAsked":
    case "Success":
      return (
        <UI.ConformationDialog
          open
          title="Delete profile forever?"
          confirmTitle="Delete"
          onCancel={() => dispatch(["ClickedCancel"])}
          onClose={() => dispatch(["ClickedBackdrop"])}
          onConfirm={() => dispatch(["ClickedDelete"])}
        />
      )
  }
}
