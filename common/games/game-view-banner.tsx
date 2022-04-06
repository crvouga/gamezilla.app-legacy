import * as React from "react";
import {
  Animated,
  Platform,
  SafeAreaView,
  TouchableHighlight,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { Icon, spacing, useTheme } from "../ui";
import * as GameState from "./game-state";

import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const safeAreaInsets = useSafeAreaInsets();

  const heightValue = React.useRef(new Animated.Value(0)).current;

  const status =
    Platform.OS === "web" &&
    state.type === "started" &&
    state.status === "blurred"
      ? "opened"
      : Platform.OS !== "web" && state.type === "started"
      ? "opened"
      : "closed";

  React.useEffect(() => {
    Animated.timing(heightValue, {
      toValue: status === "opened" ? 36 + safeAreaInsets.top : 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {});
  }, [status]);

  return (
    <>
      <Animated.View style={{ height: heightValue, width: "100%" }}>
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
                backgroundColor: theme.colors.primary,
              }}
            >
              <Text style={{ flex: 1 }}>{`Back to ${
                state.type === "started"
                  ? GameState.formatGameName(state.game.name)
                  : "..."
              }`}</Text>

              <Icon name="chevron-right" size={18} />
            </View>
          </SafeAreaView>
        </TouchableHighlight>
      </Animated.View>
    </>
  );
};
