import * as Icons from "src/Components/Icons";
import { Item } from "src/Components/Item";
import { ModalConformation } from "src/Components/ModalConformation";
import { PageBar } from "src/Components/PageBar";
import React, { useState } from "react";
import { supabaseClient } from "src/supabase";
import { useRouter } from "./useRouter";

type State =
  | {
      type: "idle";
    }
  | {
      type: "confirming-logout";
    };

type Message =
  | {
      type: "logout";
    }
  | {
      type: "comfirmed-logout";
    }
  | {
      type: "cancelled-logout";
    };

export const HomePage = () => {
  const [state, setState] = useState<State>({ type: "idle" });
  const router = useRouter();

  const dispatch = async (message: Message) => {
    switch (message.type) {
      case "cancelled-logout":
        setState({ type: "idle" });
        return;

      case "comfirmed-logout":
        await supabaseClient.auth.signOut();
        return;

      case "logout":
        setState({ type: "confirming-logout" });
        return;
    }
  };

  return (
    <>
      {state.type === "confirming-logout" && (
        <ModalConformation
          title="Logout of Gamezilla?"
          left={{
            title: "Cancel",
            onClick: () => dispatch({ type: "cancelled-logout" }),
          }}
          right={{
            title: "Logout",
            onClick: () => dispatch({ type: "comfirmed-logout" }),
          }}
        />
      )}

      <PageBar center="Home" />

      <Item
        onClick={() => {
          router.push({ route: "edit-profile" });
        }}
        start={<Icons.Edit />}
        center="Edit Profile"
        end={<Icons.CheveronRight />}
      />

      <Item
        onClick={() => {
          router.push({ route: "search-users" });
        }}
        start={<Icons.Search />}
        center="Search Users"
        end={<Icons.CheveronRight />}
      />

      <Item
        onClick={() => {
          dispatch({ type: "logout" });
        }}
        start={<Icons.Logout />}
        center="Logout"
      />
    </>
  );
};
