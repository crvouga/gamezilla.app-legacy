import React from "react";
import * as Icons from "../../../Components/Icons";
import { Item } from "../../../Components/Item";
import { PageBar } from "../../../Components/PageBar";

export const HomePage = ({
  onEditProfile,
  onSearchUsers,
  onLogout,
}: {
  onEditProfile: () => void;
  onSearchUsers: () => void;
  onLogout: () => void;
}) => {
  return (
    <>
      <PageBar center="Home" />

      <Item
        onClick={onEditProfile}
        start={<Icons.Edit />}
        center="Edit Profile"
        end={<Icons.CheveronRight />}
      />

      <Item
        onClick={onSearchUsers}
        start={<Icons.Search />}
        center="Search Users"
        end={<Icons.CheveronRight />}
      />

      <Item onClick={onLogout} start={<Icons.Logout />} center="Logout" />
    </>
  );
};
