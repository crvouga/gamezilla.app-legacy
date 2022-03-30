import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { Appbar, List } from "react-native-paper";
import * as GameState from "./game-state";

type IStackParamList = {
  Open: undefined;
  Game: undefined;
};

const Stack = createNativeStackNavigator<IStackParamList>();

export const Game = ({
  dispatch,
  state,
}: {
  state: GameState.IState;
  dispatch: (action: GameState.IAction) => void;
}) => {
  if (state.type === "closed") {
    const OpenScreen = () => {
      return (
        <>
          <Appbar.Header>
            <Appbar.Content title="Game" />
          </Appbar.Header>

          <List.Item
            title="Tic Tac Toe"
            onPress={() => {
              dispatch(GameState.actions.open("tic-tac-toe"));
            }}
            right={() => <List.Icon icon="launch" />}
          />
        </>
      );
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Open" component={OpenScreen} />
      </Stack.Navigator>
    );
  }

  const GameScreen = () => {
    return (
      <>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              dispatch(GameState.actions.close());
            }}
          />
          <Appbar.Content title={state.gameId} />
        </Appbar.Header>
      </>
    );
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Game" component={GameScreen} />
    </Stack.Navigator>
  );
};
