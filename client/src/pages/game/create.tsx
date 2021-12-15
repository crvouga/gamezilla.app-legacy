import {
  CircularProgress,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { game } from "../../game/game";
import { useNavigate } from "react-router-dom";

export const GameCreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const create = game.actions.create();
    dispatch(create);
    setTimeout(() => {
      navigate(`/game/${create.payload.gameId}`);
    }, 2000);
  }, [navigate, dispatch]);

  return (
    <>
      <Dialog open>
        <DialogContent sx={{ display: "flex", alignItems: "center" }}>
          <CircularProgress sx={{ marginRight: 2 }} />
          <Typography>Creating Game</Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};
