import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { Dialog, IconButton, List, Portal } from "react-native-paper";
import {
  AppBar,
  AppBarBackAction,
  AppBarContent,
  AppBarHeader,
  Button,
} from "../ui";
import * as GameState from "./game-state";
import { ViewTicTacToe } from "./tic-tac-toe/TicTacToe";

export const GameStart = ({
  dispatch,
  state,
  onNavigateGame,
}: {
  state: GameState.IState;
  dispatch: (action: GameState.IAction) => void;
  onNavigateGame: () => void;
}) => {
  return (
    <>
      <AppBarHeader>
        <AppBarContent title="Play" />
      </AppBarHeader>

      <List.Item
        title="Tic Tac Toe"
        onPress={() => {
          dispatch(GameState.actions.start("tic-tac-toe"));
        }}
      />

      {/* <List.Item
        title="Chess"
        onPress={() => {
          dispatch(GameState.actions.start("chess"));
        }}
      />

      <List.Item
        title="Connect Four"
        onPress={() => {
          dispatch(GameState.actions.start("connect-four"));
        }}
      />

      <List.Item
        title="Checkers"
        onPress={() => {
          dispatch(GameState.actions.start("checkers"));
        }}
      />

      <List.Item
        title="Battleship"
        onPress={() => {
          dispatch(GameState.actions.start("battleship"));
        }}
      /> */}
    </>
  );
};

export const Game = ({
  dispatch,
  gameState,
  onBack,
}: {
  gameState: GameState.IGameState;
  dispatch: (action: GameState.IAction) => void;
  onBack: () => void;
}) => {
  useFocusEffect(
    React.useCallback(() => {
      dispatch(GameState.actions.focused());
      return () => {
        dispatch(GameState.actions.blurred());
      };
    }, [])
  );

  if (gameState.name === "tic-tac-toe") {
    return (
      <>
        <AppBar
          left={<AppBarBackAction onPress={onBack} />}
          title={GameState.formatGameName(gameState.name)}
          right={
            <StopGameButton
              onStop={() => {
                dispatch(GameState.actions.stopped());
              }}
            />
          }
        />

        <ViewTicTacToe board={gameState.state.board} dispatch={dispatch} />
      </>
    );
  }

  return (
    <>
      <AppBar
        left={<AppBarBackAction onPress={onBack} />}
        title={GameState.formatGameName(gameState.name)}
        right={
          <StopGameButton
            onStop={() => {
              dispatch(GameState.actions.stopped());
            }}
          />
        }
      />
    </>
  );
};

const StopGameButton = ({ onStop }: { onStop: () => void }) => {
  const [status, setStatus] = React.useState<"idle" | "visible">("idle");

  const onDismiss = () => {
    setStatus("idle");
  };

  return (
    <>
      <IconButton
        icon={"power"}
        onPress={() => {
          setStatus("visible");
        }}
      />
      <Portal>
        <Dialog visible={status === "visible"} onDismiss={onDismiss}>
          <Dialog.Title>Stop Game?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={onDismiss} title="Cancel" />
            <Button onPress={onStop} title="Stop" />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
