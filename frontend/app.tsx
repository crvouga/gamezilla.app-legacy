import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { View } from "react-native";
import { ActivityIndicator, Title } from "react-native-paper";
import { Account } from "../common/account/Account";
import { ProfileCreate } from "../common/account/profile-create/ProfileCreate";
import { ProfileDelete } from "../common/account/profile-delete/ProfileDelete";
import { ProfileUpdateStack } from "../common/account/profile-update/ProfileUpdateStack";
import { SignIn } from "../common/account/sign-in/SignIn";
import { SignOut } from "../common/account/sign-out/SignOut";
import { Game, GameStart } from "../common/games/game-view";
import { GameBanner } from "../common/games/game-view-banner";
import { spacing, useTheme } from "../common/ui";
import { useDispatch, useSelector } from "./store";

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
  GameStart: undefined;
  Account: undefined;
};

export const Tab = createBottomTabNavigator<ITabParamList>();
export const Stack = createNativeStackNavigator<IStackParamList>();

const LoadingScreen = ({ title }: { title: string }) => {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        width: "100%",
      }}
    >
      <View>
        <ActivityIndicator style={{ marginBottom: spacing(2) }} size={32} />
        <Title>{title}</Title>
      </View>
    </View>
  );
};

export const App = () => {
  const authState = useSelector((state) => state.auth);
  const profileState = useSelector((state) => state.profile);
  const gameState = useSelector((state) => state.game);

  const navigation = useNavigation<NavigationProp<IStackParamList>>();
  const theme = useTheme();

  React.useEffect(() => {
    if (gameState.type === "started") {
      navigation.navigate("Game");
    }
  }, [gameState.type]);

  const dispatch = useDispatch();

  if (authState.type === "loading") {
    return <LoadingScreen title="Checking if logged in..." />;
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
    return <LoadingScreen title="Loading profile..." />;
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

  const GameStartScreen = () => {
    return (
      <GameStart
        onNavigateGame={() => {
          navigation.navigate("Game");
        }}
        dispatch={dispatch}
        state={gameState}
      />
    );
  };

  const TabStackScreen = () => {
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
                    : route.name === "GameStart"
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
        <Tab.Screen name="GameStart" component={GameStartScreen} />
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
    <>
      <GameBanner
        onPress={() => {
          navigation.navigate("Game");
        }}
        state={gameState}
        dispatch={dispatch}
      />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={TabStackScreen} />
        <Stack.Screen
          name="ProfileUpdateStack"
          component={ProfileUpdateStackScreen}
        />
        <Stack.Screen name="ProfileDelete" component={ProfileDeleteScreen} />
        <Stack.Screen name="SignOut" component={SignOutScreen} />
        {gameState.type === "started" && (
          <Stack.Screen name="Game">
            {() => (
              <Game
                onBack={navigation.goBack}
                dispatch={dispatch}
                gameState={gameState.game}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </>
  );
};
