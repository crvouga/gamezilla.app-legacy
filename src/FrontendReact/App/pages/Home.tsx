import React from "react";
import * as Icons from "../../Components/Icons";
import { Item } from "../../Components/Item";
import { PageBar } from "../../Components/PageBar";
import { Link } from "react-router-dom";
export const HomePage = () => {
  return (
    <>
      <PageBar center="Home" />

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
