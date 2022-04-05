import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useState } from "react";
import { parseAvatarUrl } from "../profile-avatar";
import { ProfileUpdate } from "./ProfileUpdate";
import {
  ProfileUpdateAvatar,
  ProfileUpdateAvatarSeed,
  ProfileUpdateAvatarStyle,
} from "./ProfileUpdateAvatar";
import { ProfileUpdateName } from "./ProfileUpdateName";
import { ProfileUpdateUsername } from "./ProfileUpdateUsername";

type IStackParamList = {
  Update: undefined;
  UpdateUsername: undefined;
  UpdateName: undefined;
  UpdateAvatar: undefined;
  UpdateAvatarStyle: undefined;
  UpdateAvatarSeed: undefined;
};

type IScreenProps<TKey extends keyof IStackParamList> = NativeStackScreenProps<
  IStackParamList,
  TKey
>;

export const Stack = createNativeStackNavigator<IStackParamList>();

export const ProfileUpdateStack = ({
  profile,
}: {
  profile: {
    userId: string;
    username: string;
    avatarUrl: string;
    name: string;
  };
}) => {
  const UpdateScreen = ({ navigation }: IScreenProps<"Update">) => {
    return (
      <ProfileUpdate
        profile={profile}
        onCancel={navigation.goBack}
        onUpdateAvatar={() => {
          navigation.navigate("UpdateAvatar");
        }}
        onUpdateName={() => {
          navigation.navigate("UpdateName");
        }}
        onUpdateUsername={() => {
          navigation.navigate("UpdateUsername");
        }}
      />
    );
  };

  const UpdateUsernameScreen = ({
    navigation,
  }: IScreenProps<"UpdateUsername">) => {
    return (
      <ProfileUpdateUsername
        onCancel={navigation.goBack}
        onSuccess={navigation.goBack}
        profile={profile}
      />
    );
  };

  const UpdateNameScreen = ({ navigation }: IScreenProps<"UpdateName">) => {
    return (
      <ProfileUpdateName
        onCancel={navigation.goBack}
        onSuccess={navigation.goBack}
        profile={profile}
      />
    );
  };

  const parsed = parseAvatarUrl(profile.avatarUrl);
  const [avatarSeed, setAvatarSeed] = useState(parsed.avatarSeed);
  const [avatarStyle, setAvatarStyle] = useState(parsed.avatarStyle);

  const UpdateAvatarScreen = ({ navigation }: IScreenProps<"UpdateAvatar">) => {
    return (
      <ProfileUpdateAvatar
        userId={profile.userId}
        avatarSeed={avatarSeed}
        avatarStyle={avatarStyle}
        onCancel={navigation.goBack}
        onSuccess={navigation.goBack}
        onAvatarSeed={() => {
          navigation.navigate("UpdateAvatarSeed");
        }}
        onAvatarStyle={() => {
          navigation.navigate("UpdateAvatarStyle");
        }}
      />
    );
  };

  const UpdateAvatarStyleScreen = ({
    navigation,
  }: IScreenProps<"UpdateAvatarStyle">) => {
    return (
      <ProfileUpdateAvatarStyle
        avatarSeed={avatarSeed}
        userId={profile.userId}
        initial={{ avatarStyle }}
        onBack={navigation.goBack}
        onSuccess={navigation.goBack}
      />
    );
  };

  const UpdateAvatarSeedScreen = ({
    navigation,
  }: IScreenProps<"UpdateAvatarSeed">) => {
    return <ProfileUpdateAvatarSeed onCancel={navigation.goBack} />;
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Update" component={UpdateScreen} />
      <Stack.Screen name="UpdateUsername" component={UpdateUsernameScreen} />
      <Stack.Screen name="UpdateName" component={UpdateNameScreen} />

      <Stack.Screen name="UpdateAvatar" component={UpdateAvatarScreen} />
      <Stack.Screen
        name="UpdateAvatarStyle"
        component={UpdateAvatarStyleScreen}
      />
      <Stack.Screen
        name="UpdateAvatarSeed"
        component={UpdateAvatarSeedScreen}
      />
    </Stack.Navigator>
  );
};
