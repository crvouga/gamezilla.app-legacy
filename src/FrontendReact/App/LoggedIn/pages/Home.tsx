import React from "react";
import * as Icons from "../../../Components/Icons";
import { Item } from "../../../Components/Item";
import { PageBar } from "../../../Components/PageBar";

export const HomePage = ({
  onEditProfile,
  onLogout,
  onTicTacToe,
}: {
  onEditProfile: () => void;
  onLogout: () => void;
  onTicTacToe: () => void;
}) => {
  return (
    <>
      <PageBar center="Home" />

      <Item
        onClick={onTicTacToe}
        center="Tic Tac Toe"
        end={<Icons.CheveronRight />}
      />

      <Item
        onClick={onEditProfile}
        start={<Icons.Edit />}
        center="Edit Profile"
        end={<Icons.CheveronRight />}
      />

      <Item onClick={onLogout} start={<Icons.Logout />} center="Logout" />
    </>
  );
};
