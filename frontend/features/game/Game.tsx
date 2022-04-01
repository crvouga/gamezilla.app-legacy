import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { Animated, TouchableHighlight, View } from "react-native";
import { Dialog, IconButton, List, Portal, Text } from "react-native-paper";
import {
  AppBar,
  AppBarBackAction,
  AppBarContent,
  AppBarHeader,
  Button,
  Icon,
  spacing,
  useTheme,
} from "../../ui";
import * as GameState from "./game-state";
import { TicTacToe } from "./tic-tac-toe/TicTacToe";

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

  const fadeRef = React.useRef(new Animated.Value(1));

  React.useEffect(() => {
    const run = (animation: "fade-in" | "fade-out") => {
      Animated.timing(fadeRef.current, {
        toValue: animation === "fade-in" ? 1 : 2 / 3,
        duration: 1000 * (2 / 3),
        useNativeDriver: true,
      }).start(() => {
        run(animation === "fade-out" ? "fade-in" : "fade-out");
      });
    };

    run("fade-out");
  }, [fadeRef.current]);

  return (
    <>
      {state.type === "started" && state.status === "blurred" && (
        <TouchableHighlight onPress={onNavigateGame}>
          <View
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: spacing(2),
              paddingVertical: spacing(1),
            }}
          >
            <Animated.View
              style={{
                opacity: fadeRef.current,
                flex: 1,
                flexDirection: "row",
              }}
            >
              <Text style={{ flex: 1 }}>{`Back to ${GameState.formatGameId(
                state.gameId
              )}`}</Text>

              <Icon name="chevron-right" size={18} />
            </Animated.View>
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

  if (gameId === "tic-tac-toe") {
    return (
      <>
        <AppBar
          left={<AppBarBackAction onPress={onBack} />}
          title={GameState.formatGameId(gameId)}
          right={
            <StopGameButton
              onStop={() => {
                dispatch(GameState.actions.stopped());
              }}
            />
          }
        />

        <TicTacToe />
      </>
    );
  }

  return (
    <>
      <AppBar
        left={<AppBarBackAction onPress={onBack} />}
        title={GameState.formatGameId(gameId)}
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
