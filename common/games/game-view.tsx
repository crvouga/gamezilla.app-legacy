import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { TouchableHighlight, View } from "react-native";
import { Dialog, IconButton, Portal, Text } from "react-native-paper";
import {
  AppBar,
  AppBarBackAction,
  AppBarContent,
  AppBarHeader,
  Button,
  spacing,
} from "../ui";
import * as GameState from "./game-state";
import {
  TicTacToeIconSvg,
  ViewTicTacToe,
} from "./tic-tac-toe/tic-tac-toe-view";

const GameStartLink = ({
  onPress,
  title,
  icon,
}: {
  onPress: () => void;
  title: string;
  icon: React.ReactNode;
}) => {
  return (
    <View
      style={{
        width: `${(1 / 3) * 100}%`,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing(2),
      }}
    >
      <TouchableHighlight onPress={onPress}>
        <View style={{ width: "100%" }}>
          <View
            style={{
              overflow: "hidden",
              width: "100%",
              borderRadius: 12,
              marginBottom: spacing(1),
            }}
          >
            {icon}
          </View>

          <Text
            style={{ textAlign: "center", width: "100%", overflow: "hidden" }}
          >
            {title}
          </Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

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

      <View
        style={{
          flexDirection: "row",
          flex: 1,
          width: "100%",
          flexWrap: "wrap",
          overflow: "scroll",
        }}
      >
        {[
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2, 3, 4,
          5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
        ].map((_, index) => {
          return (
            <GameStartLink
              key={index}
              title="Tic Tac Toe"
              icon={<TicTacToeIconSvg />}
              onPress={() => {
                dispatch(GameState.actions.start("tic-tac-toe"));
              }}
            />
          );
        })}
      </View>
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
