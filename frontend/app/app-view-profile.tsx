import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import constate from "constate";
import * as React from "react";
import { Appbar, List } from "react-native-paper";
import { SignOutButton } from "../features/auth/sign-out/sign-out-view-native";
import { ProfileDeleteButton } from "../features/profile/profile-delete/profile-delete-view";
import { ProfileUpdateView } from "../features/profile/profile-update/profile-update-view";
import { spacing } from "../ui";

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
  ProfileUpdate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const [StackContext, useStackContext] = constate(
  ({
    profile,
  }: {
    profile: {
      userId: string;
      username?: string;
      name?: string;
      avatarUrl?: string;
    };
  }) => {
    return {
      profile,
    };
  }
);

export const AppProfileView = ({
  profile,
}: {
  profile: {
    userId: string;
    username?: string;
    name?: string;
    avatarUrl?: string;
  };
}) => {
  return (
    <StackContext profile={profile}>
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

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            header: ({ navigation }) => {
              return (
                <Appbar.Header>
                  <Appbar.BackAction
                    onPress={() => {
                      navigation.goBack();
                    }}
                  />
                  <Appbar.Content title="Profile" />
                </Appbar.Header>
              );
            },
          }}
        />

        <Stack.Screen
          name="ProfileUpdate"
          options={{
            header: ({ navigation }) => {
              return (
                <Appbar.Header>
                  <Appbar.BackAction
                    onPress={() => {
                      navigation.goBack();
                    }}
                  />
                  <Appbar.Content title="Edit Profile" />
                </Appbar.Header>
              );
            },
          }}
        >
          {() => {
            return <ProfileUpdateView profile={profile} />;
          }}
        </Stack.Screen>

        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{
            header: ({ navigation }) => {
              return (
                <Appbar.Header>
                  <Appbar.BackAction
                    onPress={() => {
                      navigation.goBack();
                    }}
                  />
                  <Appbar.Content title="Game" />
                </Appbar.Header>
              );
            },
          }}
        />
      </Stack.Navigator>
    </StackContext>
  );
};

const HomeScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) => {
  return (
    <>
      <List.Section>
        <List.Item
          onPress={() => {
            navigation.navigate("Game");
          }}
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

const ProfileScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) => {
  const { profile } = useStackContext();
  return (
    <>
      <List.Section>
        <List.Item
          onPress={() => {
            navigation.navigate("ProfileUpdate");
          }}
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
