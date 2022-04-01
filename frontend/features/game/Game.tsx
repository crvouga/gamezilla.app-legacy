import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { TouchableHighlight, View } from "react-native";
import { List, Text } from "react-native-paper";
import {
  AppBar,
  AppBarBackAction,
  AppBarContent,
  AppBarHeader,
  Button,
  spacing,
  useTheme,
} from "../../ui";
import * as GameState from "./game-state";

export const GameStartedBanner = ({
  dispatch,
  state,
  onNavigateGame,
}: {
  state: GameState.IState;
  dispatch: (action: GameState.IAction) => void;
  onNavigateGame: () => void;
}) => {
  const theme = useTheme();

  return (
    <>
      {state.type === "started" && state.status === "blurred" && (
        <TouchableHighlight onPress={onNavigateGame}>
          <View
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: spacing(2),
              paddingVertical: spacing(1),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ flex: 1 }}>{state.gameId}</Text>
          </View>
        </TouchableHighlight>
      )}
    </>
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

      <List.Item
        title="Tic Tac Toe"
        onPress={() => {
          dispatch(GameState.actions.start("tic-tac-toe"));
        }}
      />

      <List.Item
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
      />
    </>
  );
};

export const Game = ({
  dispatch,
  gameId,
  onBack,
}: {
  gameId: GameState.IGameId;
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

  return (
    <>
      <AppBar left={<AppBarBackAction onPress={onBack} />} title={gameId} />

      <Button
        onPress={() => {
          dispatch(GameState.actions.stopped());
        }}
        title="Stop Game"
      />
    </>
  );
};
