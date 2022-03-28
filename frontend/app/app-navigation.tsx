import { useReduxDevToolsExtension } from "@react-navigation/devtools";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { ReactNode } from "react";
import { useTheme } from "../ui";

export const AppNavigationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const theme = useTheme();

  const ref = useNavigationContainerRef();

  useReduxDevToolsExtension(ref);

  return (
    <NavigationContainer theme={theme} ref={ref}>
      {children}
    </NavigationContainer>
  );
};
