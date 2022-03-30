import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppLoading from "expo-app-loading";
import * as React from "react";
import { View } from "react-native";
import { Appbar, List, Portal } from "react-native-paper";
import { SignInScreen } from "../features/auth/sign-in/sign-in-screen";
import { SignOutButton } from "../features/auth/sign-out/sign-out-view";
import { ProfileCreateView } from "../features/profile/profile-create/profile-create-view";
import { ProfileDeleteButton } from "../features/profile/profile-delete/profile-delete-view";
import { DialogLoading, spacing, useTheme } from "../ui";
import { AppNavigationProvider } from "./app-navigation";
import { AppStoreProvider, useAppSelector } from "./app-store";
import { AppThemeProvider, useFontState } from "./app-theme";
import { StateInspector } from "reinspect";

type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
  ProfileUpdate: undefined;
  ProfileCreate: undefined;
  SignIn: undefined;
  Loading: undefined;
};

export const Stack = createNativeStackNavigator<AppStackParamList>();

export const useAppNavigation = () =>
  useNavigation<NavigationProp<AppStackParamList>>();

export const AppContainer = () => {
  const fontState = useFontState();

  if (fontState.type === "loading") {
    return <AppLoading />;
  }

  return (
    <StateInspector name="App">
      <AppStoreProvider>
        <AppThemeProvider>
          <AppNavigationProvider>
            <App />
          </AppNavigationProvider>
        </AppThemeProvider>
      </AppStoreProvider>
    </StateInspector>
  );
};

export const App = () => {
  const state = useAppSelector((state) => state);
  const navigation = useAppNavigation();
  const theme = useTheme();

  if (state.auth.type === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Portal>
          <DialogLoading visible title={"Checking if logged in..."} />
        </Portal>
      </View>
    );
  }

  if (state.auth.type === "signed-out") {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
      </Stack.Navigator>
    );
  }

  const { defaultName, userId } = state.auth;

  if (state.profile.type === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Portal>
          <DialogLoading visible title={"Loading profile..."} />
        </Portal>
      </View>
    );
  }

  if (state.profile.type === "not-found") {
    return (
      <Stack.Navigator
        screenOptions={{ headerShown: false, animationTypeForReplace: "pop" }}
      >
        <Stack.Screen
          name="ProfileCreate"
          component={thunk(ProfileCreateView, {
            onLogout: () => {},
            defaultName,
            userId,
          })}
        />
      </Stack.Navigator>
    );
  }

  const { profile } = state.profile;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Profile"
        component={thunk(ProfileScreen, {
          profile,
          onProfileUpdate: () => navigation.navigate("ProfileUpdate"),
        })}
      />

      <Stack.Screen name="Game" component={GameScreen} />
    </Stack.Navigator>
  );
};

const thunk =
  <TX, TY>(f: (x: TX) => TY, x: TX) =>
  () =>
    f(x);

const HomeScreen = () => {
  const navigation = useAppNavigation();

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Home" />
      </Appbar.Header>

      <List.Section>
        <List.Item
          onPress={() => {}}
          title="Game"
          left={() => <List.Icon icon="gamepad" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          onPress={() => {
            navigation.navigate("Profile");
          }}
          title="Profile"
          left={() => <List.Icon icon="account" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>
    </>
  );
};

const ProfileScreenHeader = () => {
  const navigation = useAppNavigation();

  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={navigation.goBack} />
      <Appbar.Content title="Profile" />
    </Appbar.Header>
  );
};

const ProfileScreen = ({
  onProfileUpdate,
  profile,
}: {
  onProfileUpdate: () => void;
  profile: { userId: string };
}) => {
  return (
    <>
      <ProfileScreenHeader />
      <List.Section>
        <List.Item
          onPress={onProfileUpdate}
          title="Edit"
          left={() => <List.Icon icon="pencil" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>

      <SignOutButton
        style={{
          marginHorizontal: spacing(1),
          marginBottom: spacing(2),
        }}
      />

      <ProfileDeleteButton
        style={{
          marginHorizontal: spacing(1),
        }}
        userId={profile.userId}
      />
    </>
  );
};

const GameScreen = () => {
  return (
    <>
      <List.Section>
        <List.Item
          onPress={() => {}}
          title="Create"
          left={() => <List.Icon icon="pencil" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          onPress={() => {}}
          title="Join"
          left={() => <List.Icon icon="magnify" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>
    </>
  );
};
