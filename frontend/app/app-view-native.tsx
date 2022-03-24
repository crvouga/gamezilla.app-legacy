import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { Appbar, List, Portal } from "react-native-paper";
import { useAuthState } from "../features/auth/auth-state/use-auth-state";
import { SignInView } from "../features/auth/sign-in/sign-in-view-native";
import { SignOutView } from "../features/auth/sign-out/sign-out-view-native";
import { ProfileCreateScreen } from "../features/profile/profile-create/profile-create-screen";
import { useAppSelector } from "../main-store";
import { DialogLoading } from "../ui/DialogLoading";
import { ThemeProvider } from "../ui/ThemeProvider";

export const AppView = () => {
  const authState = useAuthState();

  return (
    <ThemeProvider>
      <Portal>
        <DialogLoading
          visible={authState.type === "loading"}
          title="Checking if logged in..."
        />
      </Portal>

      {authState.type === "signed-in" && (
        <SignedInView
          userId={authState.userId}
          defaultName={authState.defaultName}
        />
      )}

      {authState.type === "signed-out" && (
        <>
          <SignInView />
        </>
      )}
    </ThemeProvider>
  );
};

const SignedInView = ({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) => {
  const profileState = useAppSelector((state) => state.profile.subscribe);

  return (
    <>
      <Portal>
        <DialogLoading
          visible={profileState.type === "loading"}
          title="Loading profile..."
        />
      </Portal>

      {profileState.type === "found" && <ProfileFoundView />}

      {profileState.type === "not-found" && (
        <ProfileNotFoundView userId={userId} defaultName={defaultName} />
      )}
    </>
  );
};

type ProfileNotFoundStackParamList = {
  CreateProfile: undefined;
  SignOut: undefined;
};

const ProfileNotFoundStack =
  createNativeStackNavigator<ProfileNotFoundStackParamList>();

const ProfileNotFoundView = ({
  defaultName,
  userId,
}: {
  defaultName: string;
  userId: string;
}) => {
  return (
    <ProfileNotFoundStack.Navigator initialRouteName="CreateProfile">
      <ProfileNotFoundStack.Screen
        name="CreateProfile"
        options={{ headerShown: false }}
      >
        {() => {
          return (
            <ProfileCreateScreen defaultName={defaultName} userId={userId} />
          );
        }}
      </ProfileNotFoundStack.Screen>
      <ProfileNotFoundStack.Screen
        name="SignOut"
        options={{ headerShown: false }}
        component={SignOutScreen}
      />
    </ProfileNotFoundStack.Navigator>
  );
};

const SignOutScreen = (
  props: NativeStackScreenProps<ProfileNotFoundStackParamList, "SignOut">
) => {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Sign Out" />
      </Appbar.Header>
    </>
  );
};

type RootStackParamList = {
  Home: undefined;
  Logout: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const ProfileFoundView = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          header: () => {
            return (
              <Appbar.Header>
                <Appbar.Content title="Home" />
              </Appbar.Header>
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

const HomeScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) => {
  const [state, setState] = React.useState<"idle" | "visible">("idle");
  return (
    <>
      <List.Section>
        <List.Item
          onPress={() => {}}
          title="Game"
          left={() => <List.Icon icon="gamepad" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          onPress={() => {}}
          title="Profile"
          left={() => <List.Icon icon="account" />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Item
          onPress={() => {
            setState("visible");
          }}
          title="Sign Out"
          left={() => <List.Icon icon="logout" />}
        />
      </List.Section>
      <SignOutView
        visible={state === "visible"}
        onCancel={() => {
          setState("idle");
        }}
      />
    </>
  );
};
