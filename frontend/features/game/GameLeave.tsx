import { LoadingButton } from "@mui/lab";
import { Box, Button, Drawer, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dispatch } from "redux";
import * as Game from "./game-state";

const GameLeave = ({
  dispatch,
}: {
  dispatch: (action: Game.IAction) => void;
}) => {
  const navigate = useNavigate();

  const onLeave = () => {
    dispatch({
      namespace: "game",
      type: Game.ActionType.Leave,
    });
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <Drawer open anchor="bottom" onBackdropClick={onCancel}>
      <Typography sx={{ p: 2 }} align="center" variant="h5">
        Leave Game?
      </Typography>

      <Box
        sx={{
          width: "100%",
          p: 2,
          display: "flex",
        }}
      >
        <Button
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <LoadingButton
          sx={{ flex: 1 }}
          variant="contained"
          size="large"
          onClick={onLeave}
        >
          Leave
        </LoadingButton>
      </Box>
    </Drawer>
  );
};

export default GameLeave;
