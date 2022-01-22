import React from "react";
import { Link } from "react-location";
import { Icons, Item, PageBar } from "../components";

export const HomePage = ({ profile }: { profile: { avatarUrl?: string } }) => {
  return (
    <>
      <PageBar center="Home" />

      <Link to="/tic-tac-toe">
        <Item center="Tic Tac Toe" end={<Icons.CheveronRight />} />
      </Link>

      <Link to="/profile/edit">
        <Item
          start={<Icons.Edit />}
          center="Edit Profile"
          end={<Icons.CheveronRight />}
        />
      </Link>

      <Link to="/logout">
        <Item start={<Icons.Logout />} center="Logout" />
      </Link>
    </>
  );
};
