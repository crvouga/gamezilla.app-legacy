import { Backdrop } from "Components/Backdrop";
import { Button } from "Components/Button";
import { Container } from "Components/Container";
import * as Icons from "Components/Icons";
import { Item } from "Components/Item";
import { ModalConformation } from "Components/ModalConformation";
import { PageBar } from "Components/PageBar";
import { Surface } from "Components/Surface";
import React, { useState } from "react";
import { supabaseClient } from "supabase/supabase-client";

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

      <Container>
        <PageBar title="Home" />

        <Item
          onClick={() => dispatch({ type: "logout" })}
          start={<Icons.Logout />}
          center="Logout"
        />
      </Container>
    </>
  );
};
