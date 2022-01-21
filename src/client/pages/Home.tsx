import React from "react";
import * as Icons from "../components/Icons";
import { Item } from "../components/Item";
import { PageBar } from "../components/PageBar";
import { Link } from "react-router-dom";
import { Avatar } from "../components";

export const HomePage = ({ profile }: { profile: { avatarUrl?: string } }) => {
  return (
    <>
      <PageBar
        center="Home"
        right={<Avatar className="w-8 h-8" src={profile.avatarUrl} />}
      />

      <Link to="/tic-tac-toe">
        <Item center="Tic Tac Toe" end={<Icons.CheveronRight />} />
      </Link>

      <Link to="/edit/profile">
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
