import { LoadingButton } from "@mui/lab";
import { Box, Button, Drawer, Typography } from "@mui/material";
import React from "react";
import { useAppDispatch } from "../../app-store";
import * as Game from "./game-state";

const GameLeave = () => {
  const dispatch = useAppDispatch();

  const onCancel = () => {};

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
          onClick={() => {
            dispatch(Game.Actions.leave());
          }}
        >
          Leave
        </LoadingButton>
      </Box>
    </Drawer>
  );
};

export default GameLeave;
