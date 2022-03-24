import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import {
  Appbar,
  Avatar,
  Button,
  List,
  Portal,
  TextInput,
} from "react-native-paper";
import { SignInView } from "../features/auth/sign-in/sign-in-view-native";
import { SignOutView } from "../features/auth/sign-out/sign-out-view-native";
import { useAppSelector } from "../main-store";
import { DialogLoading } from "../ui/DialogLoading";
import { spacing, ThemeProvider } from "../ui/ThemeProvider";

export const AppView = () => {
  const authState = useAppSelector((state) => state.auth.subscribe);

  return (
    <ThemeProvider>
      <Portal>
        <DialogLoading
          visible={authState.type === "loading"}
          title="Checking if logged in..."
        />
      </Portal>

      {authState.type === "signed-in" && <SignedInView />}

      {authState.type === "signed-out" && (
        <>
          <SignInView />
        </>
      )}
    </ThemeProvider>
  );
};

const SignedInView = () => {
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

      {profileState.type === "not-found" && <ProfileNotFoundView />}
    </>
  );
};

type ProfileNotFoundStackParamList = {
  CreateProfile: undefined;
};

const ProfileNotFoundStack =
  createNativeStackNavigator<ProfileNotFoundStackParamList>();

const ProfileNotFoundView = () => {
  return (
    <ProfileNotFoundStack.Navigator initialRouteName="CreateProfile">
      <ProfileNotFoundStack.Screen
        name="CreateProfile"
        component={CreateProfileView}
        options={{
          header: () => {
            return (
              <Appbar.Header>
                <Appbar.Content title="Create Profile" />
              </Appbar.Header>
            );
          },
        }}
      />
    </ProfileNotFoundStack.Navigator>
  );
};

const CreateProfileView = () => {
  return (
    <>
      <Avatar.Icon
        style={{
          marginHorizontal: "auto",
          marginTop: spacing(2),
          marginBottom: spacing(1),
        }}
        size={144}
        icon="folder"
      />
      <Button onPress={() => {}}>Change Avatar</Button>

      <TextInput
        style={{ marginHorizontal: spacing(1), marginBottom: spacing(2) }}
        mode="outlined"
        label="Name"
        value={"text"}
        // onChangeText={(text) => setText(text)}
      />

      <TextInput
        style={{ marginHorizontal: spacing(1) }}
        mode="outlined"
        label="Username"
        value={"text"}
        // onChangeText={(text) => setText(text)}
      />
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
