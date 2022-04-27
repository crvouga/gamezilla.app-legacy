import { ChevronLeft } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { createAction } from "@reduxjs/toolkit";
import { takeEvery } from "redux-saga/effects";
import {
  IAvatarSeed,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarUrl,
} from "../../common/account/profile-avatar";

/*



State



*/

export type IState = {
  type: "Idle" | "Submitting";
  username: string;
  name: string;
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
};

export const toInitialState = ({
  defaultName,
}: {
  defaultName: string;
}): IState => {
  const username = defaultName.replace(" ", "").toLowerCase();

  return {
    type: "Idle",
    username: username,
    name: defaultName,
    avatarSeed: toAvatarSeed(defaultName),
    avatarStyle: "adventurer-neutral",
  };
};

/*



Actions



 */

export type IAction =
  | {
      type: "ChangedName";
      payload: string;
    }
  | {
      type: "ChangedUsername";
      payload: string;
    }
  | {
      type: "Submit";
    };

/*


Reducer


*/

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "ChangedName":
      return { ...state, name: action.payload };

    case "ChangedUsername":
      return { ...state, username: action.payload };

    case "Submit":
      return { ...state, type: "Submitting" };

    default:
      return state;
  }
};

/*
 


Middleware



*/

export function* saga() {
  yield takeEvery("CreateProfile", function* (action) {
    // supabaseClient
    //   .from<definitions["profile"]>("profile")
    //   .insert({
    //     username,
    //     name,
    //     user,
    //   });
  });
}

/*


View


*/

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar sx={{ marginBottom: 2 }}>
        <IconButton edge="start" sx={{ marginRight: 2 }}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">Create Profile</Typography>
      </Toolbar>

      <Avatar
        sx={{ marginX: "auto", marginBottom: 1, width: 144, height: 144 }}
        src={toAvatarUrl(state)}
      />

      <Button variant="text" sx={{ marginX: "auto", marginBottom: 1 }}>
        Change Avatar
      </Button>

      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          label={"Name"}
          value={state.name}
          sx={{ marginBottom: 4 }}
          onChange={(event) => {
            dispatch({
              type: "ChangedName",
              payload: event.target.value,
            });
          }}
        />

        <TextField
          fullWidth
          label={"Username"}
          value={state.username}
          sx={{ marginBottom: 4 }}
          onChange={(event) => {
            dispatch({
              type: "ChangedUsername",
              payload: event.target.value,
            });
          }}
        />

        <LoadingButton
          variant="contained"
          fullWidth
          loading={state.type === "Submitting"}
          onClick={() => {
            dispatch({ type: "Submit" });
          }}
        >
          Create Profile
        </LoadingButton>
      </Box>
    </Box>
  );
};
