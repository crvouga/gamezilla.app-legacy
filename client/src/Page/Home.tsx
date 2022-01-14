import { Backdrop } from "Components/Backdrop";
import { Button } from "Components/Button";
import { Container } from "Components/Container";
import { Item, ItemCenter } from "Components/Item";
import { PageBar, PageBarTitle } from "Components/PageBar";
import { Surface } from "Components/Surface";
import React, { useState } from "react";
import { supabaseClient } from "supabase-client";

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
        <Backdrop>
          <Surface>
            <h1 className="text-xl font-medium mb-2">Logout of Gamezilla?</h1>
            <div className="flex justify-center items-center">
              <Button onClick={() => dispatch({ type: "cancelled-logout" })}>
                Cancel
              </Button>
              <Button onClick={() => dispatch({ type: "comfirmed-logout" })}>
                Logout
              </Button>
            </div>
          </Surface>
        </Backdrop>
      )}

      <Container>
        <PageBar>
          <PageBarTitle>Home</PageBarTitle>
        </PageBar>
        <Item onClick={() => dispatch({ type: "logout" })}>
          <ItemCenter>Logout</ItemCenter>
        </Item>
      </Container>
    </>
  );
};
