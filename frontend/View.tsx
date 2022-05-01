import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import {
  Box,
  BoxProps,
  CircularProgress,
  CircularProgressProps,
  Typography,
  TypographyProps,
} from "@mui/material";
import { Html } from "elm-ts/lib/React";
import * as React from "react";

export const circularProgress =
  <TMsg,>({
    onClick,
    ...props
  }: CircularProgressProps & { onClick: TMsg }): Html<TMsg> =>
  (dispatch) => {
    return <CircularProgress {...props} onClick={() => dispatch(onClick)} />;
  };

export const box =
  <TMsg,>({ onClick, ...props }: BoxProps & { onClick: TMsg }): Html<TMsg> =>
  (dispatch) => {
    return <Box {...props} onClick={() => dispatch(onClick)} />;
  };

export const typography =
  <TMsg,>({
    onClick,
    ...props
  }: TypographyProps & { onClick: TMsg }): Html<TMsg> =>
  (dispatch) => {
    return <Typography {...props} onClick={() => dispatch(onClick)} />;
  };

export const loadingButton =
  <TMsg,>({
    onClick,
    ...props
  }: LoadingButtonProps & { onClick: TMsg }): Html<TMsg> =>
  (dispatch) => {
    return <LoadingButton {...props} onClick={() => dispatch(onClick)} />;
  };
