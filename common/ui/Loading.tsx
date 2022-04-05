import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { zIndex } from "./theme";

export const Loading = ({ visible }: { visible: boolean }) => {
  const fadeRef = useRef(new Animated.Value(0));

  const [status, setStatus] = useState<"mounted" | "unmounted">("unmounted");

  useEffect(() => {
    setStatus(visible ? "mounted" : "unmounted");

    Animated.timing(fadeRef.current, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStatus(visible ? "mounted" : "unmounted");
    });
  }, [fadeRef.current, visible]);

  if (status === "unmounted") {
    return <></>;
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: zIndex("modal"),
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeRef.current,
      }}
    >
      <ActivityIndicator size={48} />
    </Animated.View>
  );
};
