import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import { AppBarContent, AppBarHeader } from "../ui";
import * as GameState from "./game-state";
import { GameLink } from "./game-view-link";
import {
  TicTacToeIconSvg,
  TicTacToeView,
} from "./tic-tac-toe/tic-tac-toe-view";

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
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          overflow: "scroll",
        }}
      >
        {[1].map((_, index) => {
          return (
            <GameLink
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

  return (
    <>
      {gameState.name === "tic-tac-toe" && (
        <TicTacToeView
          onBack={onBack}
          onStop={() => {
            dispatch(GameState.actions.stop());
          }}
          board={gameState.state.board}
          dispatch={dispatch}
        />
      )}
    </>
  );
};
