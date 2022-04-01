import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { useDispatch, useSelector } from "../data-access/store";
import { Account } from "../features/account/Account";
import { ProfileCreate } from "../features/account/profile-create/ProfileCreate";
import { ProfileDelete } from "../features/account/profile-delete/ProfileDelete";
import { ProfileUpdateStack } from "../features/account/profile-update/ProfileUpdateStack";
import { SignIn } from "../features/account/sign-in/SignIn";
import { SignOut } from "../features/account/sign-out/SignOut";
import { GameStack } from "../features/game/GameStack";
import { DialogLoading, useTheme } from "../ui";

type IStackParamList = {
  Home: undefined;
  Profile: undefined;
  Game: undefined;
  ProfileUpdateStack: undefined;
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
          navigation.navigate("ProfileUpdateStack");
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

  const ProfileDeleteScreen = () => {
    return <ProfileDelete onCancel={navigation.goBack} userId={userId} />;
  };

  const SignOutScreen = () => {
    return <SignOut onCancel={navigation.goBack} />;
  };

  const ProfileUpdateStackScreen = () => {
    return <ProfileUpdateStack profile={profile} />;
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={TabStack} />
      <Stack.Screen
        name="ProfileUpdateStack"
        component={ProfileUpdateStackScreen}
      />
      <Stack.Screen name="ProfileDelete" component={ProfileDeleteScreen} />
      <Stack.Screen name="SignOut" component={SignOutScreen} />
    </Stack.Navigator>
  );
};
