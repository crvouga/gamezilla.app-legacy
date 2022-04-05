import * as React from "react";
import { Animated, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
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
        <TouchableRipple onPress={onPress}>
          <View
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: spacing(2),
              paddingVertical: spacing(1),
              flexDirection: "row",
            }}
          >
            {/* <Animated.View
              style={{
                opacity: fadeRef.current,
                flex: 1,
                flexDirection: "row",
              }}
            > */}
            <Text style={{ flex: 1 }}>{`Back to ${GameState.formatGameName(
              state.game.name
            )}`}</Text>

            <Icon name="chevron-right" size={18} />
            {/* </Animated.View> */}
          </View>
        </TouchableRipple>
      )}
    </>
  );
};
