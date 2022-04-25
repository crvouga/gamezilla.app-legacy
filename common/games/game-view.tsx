import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import { AppBarContent, AppBarHeader } from "../ui";
import { ConnectFourSvgIcon } from "./connect-four/connect-four-icon-svg";
import { ConnectFourView } from "./connect-four/connect-four-view";
import { IGame, IState, IAction, actions } from "./game";
import { GameLink } from "./game-view-link";
import {
  TicTacToeIconSvg,
  TicTacToeView,
} from "./tic-tac-toe/tic-tac-toe-view";

export const GameStartView = ({
  dispatch,
  state,
  onNavigateGame,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
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
        <GameLink
          title="Tic Tac Toe"
          icon={<TicTacToeIconSvg />}
          onPress={() => {
            dispatch(actions.started("tic-tac-toe"));
          }}
        />

        <GameLink
          title="Connect Four"
          icon={<ConnectFourSvgIcon />}
          onPress={() => {
            dispatch(actions.started("connect-four"));
          }}
        />
      </View>
    </>
  );
};

export const GameView = ({
  dispatch,
  state,
  onBack,
}: {
  state: IGame;
  dispatch: (action: IAction) => void;
  onBack: () => void;
}) => {
  useFocusEffect(
    React.useCallback(() => {
      dispatch(actions.focused());
      return () => {
        dispatch(actions.blurred());
      };
    }, [])
  );

  const onStop = () => {
    dispatch(actions.stopped());
  };

  switch (state.type) {
    case "connect-four":
      return (
        <ConnectFourView
          dispatch={dispatch}
          state={state.state}
          onBack={onBack}
          onStop={onStop}
        />
      );

    case "tic-tac-toe":
      return (
        <TicTacToeView
          onBack={onBack}
          onStop={onStop}
          state={state.state}
          dispatch={dispatch}
        />
      );
  }
};
