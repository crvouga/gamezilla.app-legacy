import React from "react";
import { AppBar } from "../../../ui-components";
import { IState } from "./create-logic";

export const GameCreateView = ({ state }: { state: IState }) => {
  return (
    <>
      <AppBar title="Create" />
    </>
  );
};
