import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { IAvatarSeed, IAvatarStyle } from "../../common";
import { Account } from "../features/account/Account";
import { ProfileCreate } from "../features/account/profile-create/ProfileCreate";
import { ProfileDelete } from "../features/account/profile-delete/ProfileDelete";
import { ProfileUpdate } from "../features/account/profile-update/ProfileUpdate";
import {
  ProfileUpdateAvatar,
  ProfileUpdateAvatarSeed,
  ProfileUpdateAvatarStyle,
} from "../features/account/profile-update/ProfileUpdateAvatar";
import { ProfileUpdateName } from "../features/account/profile-update/ProfileUpdateName";
import { ProfileUpdateUsername } from "../features/account/profile-update/ProfileUpdateUsername";
import { SignIn } from "../features/account/sign-in/SignIn";
import { SignOut } from "../features/account/sign-out/SignOut";
import { GameStack } from "../features/game/GameStack";
import { useDispatch, useSelector } from "../store";
import { DialogLoading, useTheme } from "../ui";

type IStackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
  ProfileUpdate: undefined;
  ProfileUpdateUsername: undefined;
  ProfileUpdateName: undefined;
  ProfileUpdateAvatar: {
    avatarStyle: IAvatarStyle;
    avatarSeed: IAvatarSeed;
  };
  ProfileUpdateAvatarSeed: {
    avatarStyle: IAvatarStyle;
    avatarSeed: IAvatarSeed;
  };
  ProfileUpdateAvatarStyle: {
    avatarSeed: IAvatarSeed;
  };
  ProfileCreate: undefined;
  ProfileDelete: undefined;
  SignIn: undefined;
  SignOut: undefined;
  LoadingAuth: undefined;
  LoadingProfile: undefined;
};

type ITabParamList = {
  Play: undefined;
  Account: undefined;
};

export const Tab = createBottomTabNavigator<ITabParamList>();
export const Stack = createNativeStackNavigator<IStackParamList>();

export const App = () => {
  const authState = useSelector((state) => state.auth);
  const profileState = useSelector((state) => state.profile);
  const gameState = useSelector((state) => state.game);
  const navigation = useNavigation<NavigationProp<IStackParamList>>();
  const theme = useTheme();

  const dispatch = useDispatch();

  if (authState.type === "loading") {
    const LoadingScreen = () => {
      return <DialogLoading visible title={"Checking if logged in..."} />;
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="LoadingAuth"
          component={LoadingScreen}
          options={{ presentation: "containedTransparentModal" }}
        />
      </Stack.Navigator>
    );
  }

  if (authState.type === "signed-out") {
    const SignInScreen = () => {
      return <SignIn />;
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
      </Stack.Navigator>
    );
  }

  const { defaultName, userId } = authState;

  if (profileState.type === "loading") {
    const LoadingScreen = () => {
      return <DialogLoading visible title={"Loading profile..."} />;
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="LoadingProfile"
          component={LoadingScreen}
          options={{ presentation: "containedTransparentModal" }}
        />
      </Stack.Navigator>
    );
  }

  if (profileState.type === "not-found") {
    const ProfileCreateScreen = () => {
      return (
        <ProfileCreate
          onLogout={() => {
            navigation.navigate("SignOut");
          }}
          userId={userId}
          defaultName={defaultName}
        />
      );
    };

    const SignOutScreen = () => {
      return <SignOut onCancel={navigation.goBack} />;
    };

    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileCreate" component={ProfileCreateScreen} />
        <Stack.Screen name="SignOut" component={SignOutScreen} />
      </Stack.Navigator>
    );
  }

  const { profile } = profileState;

  const AccountScreen = () => {
    return (
      <Account
        profile={profile}
        onProfileUpdate={() => {
          navigation.navigate("ProfileUpdate");
        }}
      />
    );
  };

  const GameStackScreen = () => {
    return <GameStack dispatch={dispatch} state={gameState} />;
  };

  const TabStack = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveBackgroundColor: theme.colors.background,
          tabBarInactiveBackgroundColor: theme.colors.background,
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Ionicons
                name={
                  route.name === "Account"
                    ? focused
                      ? "person"
                      : "person-outline"
                    : route.name === "Play"
                    ? focused
                      ? "game-controller"
                      : "game-controller-outline"
                    : "add"
                }
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: theme.colors.text,
          tabBarInactiveTintColor: theme.colors.placeholder,
        })}
      >
        <Tab.Screen name="Play" component={GameStackScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    );
  };

  const ProfileUpdateScreen = () => {
    return (
      <ProfileUpdate
        profile={profile}
        onCancel={() => {
          navigation.goBack();
        }}
        onUpdateAvatar={({ avatarStyle, avatarSeed }) => {
          navigation.navigate("ProfileUpdateAvatar", {
            avatarStyle,
            avatarSeed,
          });
        }}
        onUpdateName={() => {
          navigation.navigate("ProfileUpdateName");
        }}
        onUpdateUsername={() => {
          navigation.navigate("ProfileUpdateUsername");
        }}
      />
    );
  };

  const ProfileDeleteScreen = () => {
    return <ProfileDelete onCancel={navigation.goBack} userId={userId} />;
  };

  const SignOutScreen = () => {
    return <SignOut onCancel={navigation.goBack} />;
  };

  const ProfileUpdateUsernameScreen = () => {
    return (
      <ProfileUpdateUsername
        onCancel={navigation.goBack}
        onSuccess={navigation.goBack}
        profile={profile}
      />
    );
  };

  const ProfileUpdateNameScreen = () => {
    return (
      <ProfileUpdateName
        onCancel={navigation.goBack}
        onSuccess={navigation.goBack}
        profile={profile}
      />
    );
  };

  const ProfileUpdateAvatarScreen = () => {
    const route = useRoute<RouteProp<IStackParamList, "ProfileUpdateAvatar">>();
    return (
      <ProfileUpdateAvatar
        avatarSeed={route.params.avatarSeed}
        avatarStyle={route.params.avatarStyle}
        onUpdateAvatarSeed={({ avatarSeed, avatarStyle }) =>
          navigation.navigate("ProfileUpdateAvatarSeed", {
            avatarSeed,
            avatarStyle,
          })
        }
        onUpdateAvatarStyle={({ avatarSeed }) =>
          navigation.navigate("ProfileUpdateAvatarStyle", { avatarSeed })
        }
        onCancel={navigation.goBack}
        onSuccess={navigation.goBack}
        profile={profile}
      />
    );
  };

  const ProfileUpdateAvatarSeedScreen = () => {
    const route =
      useRoute<RouteProp<IStackParamList, "ProfileUpdateAvatarSeed">>();
    return (
      <ProfileUpdateAvatarSeed
        onCancel={navigation.goBack}
        avatarSeed={route.params.avatarSeed}
      />
    );
  };

  const ProfileUpdateAvatarStyleScreen = () => {
    const route =
      useRoute<RouteProp<IStackParamList, "ProfileUpdateAvatarStyle">>();

    return (
      <ProfileUpdateAvatarStyle
        onBack={navigation.goBack}
        onAvatarStyle={(avatarStyle) => {
          navigation.navigate("ProfileUpdateAvatar", {
            avatarSeed: route.params.avatarSeed,
            avatarStyle,
          });
        }}
        avatarSeed={route.params.avatarSeed}
      />
    );
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={TabStack} />
      <Stack.Screen name="ProfileUpdate" component={ProfileUpdateScreen} />
      <Stack.Screen
        name="ProfileUpdateUsername"
        component={ProfileUpdateUsernameScreen}
      />
      <Stack.Screen
        name="ProfileUpdateName"
        component={ProfileUpdateNameScreen}
      />
      <Stack.Screen
        name="ProfileUpdateAvatar"
        component={ProfileUpdateAvatarScreen}
      />
      <Stack.Screen
        name="ProfileUpdateAvatarSeed"
        component={ProfileUpdateAvatarSeedScreen}
      />
      <Stack.Screen
        name="ProfileUpdateAvatarStyle"
        component={ProfileUpdateAvatarStyleScreen}
      />
      <Stack.Screen name="ProfileDelete" component={ProfileDeleteScreen} />
      <Stack.Screen name="SignOut" component={SignOutScreen} />
    </Stack.Navigator>
  );
};
