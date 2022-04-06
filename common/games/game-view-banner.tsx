import * as React from "react";
import { Animated, SafeAreaView, TouchableHighlight, View } from "react-native";
import { Text } from "react-native-paper";
import { Icon, spacing, useTheme } from "../ui";
import * as GameState from "./game-state";

export const GameBanner = ({
  dispatch,
  state,
  onPress,
}: {
  state: GameState.IState;
  dispatch: (action: GameState.IAction) => void;
  onPress: () => void;
}) => {
  const theme = useTheme();

  return (
    <>
      {state.type === "started" && (
        <Animated.View>
          <TouchableHighlight onPress={onPress}>
            <SafeAreaView
              style={{
                backgroundColor: theme.colors.primary,
              }}
            >
              <View
                style={{
                  paddingHorizontal: spacing(2),
                  paddingVertical: spacing(1),
                  flexDirection: "row",
                }}
              >
                <Text style={{ flex: 1 }}>{`Back to ${GameState.formatGameName(
                  state.game.name
                )}`}</Text>

                <Icon name="chevron-right" size={18} />
              </View>
            </SafeAreaView>
          </TouchableHighlight>
        </Animated.View>
      )}
    </>
  );
};
